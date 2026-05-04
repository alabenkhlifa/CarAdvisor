import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Res,
  HttpStatus,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { Response } from 'express';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ChatService } from './chat.service';
import { AiService, ExtractedIntent } from './ai.service';
import { ChatRequestDto } from './dto/chat-request.dto';
import { buildSystemPrompt } from './prompts/system-prompt';
import { Market } from '../../entities/market.entity';
import { Vehicle } from '../../entities/vehicle.entity';

@Controller('api/chat')
@Throttle({ chat: { limit: 10, ttl: 60_000 } })
export class ChatController {
  constructor(
    private readonly chatService: ChatService,
    private readonly aiService: AiService,
    @InjectRepository(Market)
    private readonly marketRepo: Repository<Market>,
    @InjectRepository(Vehicle)
    private readonly vehicleRepo: Repository<Vehicle>,
  ) {}

  @Post()
  async chat(
    @Body() body: ChatRequestDto,
    @Res() res: Response,
  ): Promise<void> {
    if (!body.sessionToken && !body.market) {
      throw new BadRequestException(
        'Either sessionToken or market must be provided',
      );
    }

    // Resolve market
    let marketId: number | undefined;
    let marketCode = 'tn';

    if (body.market) {
      const market = await this.marketRepo.findOne({
        where: { code: body.market },
      });
      if (!market) {
        throw new BadRequestException(`Market not found: ${body.market}`);
      }
      marketId = market.id;
      marketCode = market.code;
    }

    // Get or create session
    const session = await this.chatService.getOrCreateSession(
      body.sessionToken,
      marketId,
    );

    if (!body.market && session.marketId) {
      const market = await this.marketRepo.findOne({
        where: { id: session.marketId },
      });
      if (market) marketCode = market.code;
    }

    const hasExplicitSelection =
      !!body.selectedVehicleIds && body.selectedVehicleIds.length > 0;

    // Annotate the stored message so historical turns keep their own selection.
    const taggedMessage = hasExplicitSelection
      ? `[Selected cars for this turn: ${body.selectedVehicleIds!.join(', ')}]\n${body.message}`
      : body.message;
    await this.chatService.addMessage(session, 'user', taggedMessage);

    // Step 1: Extract intent using fast model.
    // When the user has an explicit selection this turn, skip prior history —
    // otherwise filters from earlier turns (deselected cars) leak forward.
    const chatHistory = (session.messages || []).map((m) => ({
      role: m.role,
      content: m.content,
    }));
    const intentHistory = hasExplicitSelection ? [] : chatHistory;

    const intent = await this.aiService.extractIntent(
      body.message,
      intentHistory,
    );

    // Step 2: Build context — selection (if any), screen results, intent query
    const selectionContext = hasExplicitSelection
      ? await this.buildScreenContext(
          body.selectedVehicleIds,
          'USER EXPLICITLY SELECTED THESE CARS — discuss ONLY these, ignore cars from earlier turns',
        )
      : null;
    const screenContext = hasExplicitSelection
      ? null
      : await this.buildScreenContext(body.currentResultIds);
    const intentContext = hasExplicitSelection
      ? ''
      : await this.queryByIntent(marketCode, intent);

    const parts: string[] = [];
    if (selectionContext) parts.push(selectionContext);
    if (screenContext) parts.push(screenContext);
    if (intentContext) parts.push(intentContext);
    const inventoryContext = parts.join('\n\n');

    // Step 3: Stream response from main model
    const language = body.language || 'en';
    const systemPrompt = buildSystemPrompt(marketCode, language, inventoryContext);

    // Set SSE headers
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');
    res.status(HttpStatus.OK);
    res.flushHeaders();

    res.write(
      `data: ${JSON.stringify({ sessionToken: session.sessionToken })}\n\n`,
    );

    let fullResponse = '';
    for await (const chunk of this.aiService.streamChat(
      chatHistory,
      systemPrompt,
    )) {
      fullResponse += chunk;
      res.write(`data: ${JSON.stringify({ content: chunk })}\n\n`);
    }

    res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
    res.end();

    await this.chatService.addMessage(session, 'assistant', fullResponse);
  }

  @Get(':sessionToken/history')
  async getHistory(@Param('sessionToken') sessionToken: string) {
    const session = await this.chatService.getHistory(sessionToken);
    if (!session) {
      throw new NotFoundException('Chat session not found');
    }
    return {
      sessionToken: session.sessionToken,
      messages: session.messages,
      createdAt: session.createdAt,
    };
  }

  /**
   * Build context from the cars currently visible on the user's screen.
   */
  private async buildScreenContext(
    vehicleIds?: number[],
    heading?: string,
  ): Promise<string | null> {
    if (!vehicleIds || vehicleIds.length === 0) return null;

    const vehicles = await this.vehicleRepo.find({
      where: vehicleIds.map((id) => ({ id })),
      relations: ['model', 'model.brand', 'market'],
    });

    if (vehicles.length === 0) return null;

    const currency = vehicles[0].market?.code === 'tn' ? 'TND' : 'EUR';
    const lines = vehicles.map((v) => this.formatVehicleLine(v, currency));
    const title = heading ?? `Cars currently shown to the user (${vehicles.length})`;

    return `## ${title}:\n${lines.join('\n')}`;
  }

  /**
   * Precise DB query based on AI-extracted intent.
   * Queries by brand name, model name, price range, specs — no guessing.
   */
  private async queryByIntent(
    marketCode: string,
    intent: ExtractedIntent,
  ): Promise<string> {
    const market = await this.marketRepo.findOne({
      where: { code: marketCode },
    });
    if (!market) return 'Market not found.';

    // If it's a general question with no car-related intent, skip DB query
    if (
      intent.action === 'general' &&
      intent.brands.length === 0 &&
      !intent.bodyType &&
      !intent.fuelType &&
      !intent.minBudget &&
      !intent.maxBudget
    ) {
      return '';
    }

    const qb = this.vehicleRepo
      .createQueryBuilder('v')
      .leftJoinAndSelect('v.model', 'model')
      .leftJoinAndSelect('model.brand', 'brand')
      .where('v.marketId = :marketId', { marketId: market.id })
      .andWhere('v.isAvailable = true');

    // Filter by brand names
    if (intent.brands.length > 0) {
      qb.andWhere('LOWER(brand.name) IN (:...brands)', {
        brands: intent.brands.map((b) => b.toLowerCase()),
      });
    }

    // Filter by model names
    if (intent.models.length > 0) {
      qb.andWhere(
        intent.models
          .map((_, i) => `LOWER(model.name) LIKE :model${i}`)
          .join(' OR '),
        Object.fromEntries(
          intent.models.map((m, i) => [`model${i}`, `%${m.toLowerCase()}%`]),
        ),
      );
    }

    // Filter by price range
    if (intent.minBudget) {
      qb.andWhere('v.price >= :minPrice', { minPrice: intent.minBudget });
    }
    if (intent.maxBudget) {
      qb.andWhere('v.price <= :maxPrice', { maxPrice: intent.maxBudget });
    }

    // Filter by body type
    if (intent.bodyType) {
      qb.andWhere('model.bodyType = :bodyType', { bodyType: intent.bodyType });
    }

    // Filter by fuel type
    if (intent.fuelType) {
      qb.andWhere('v.fuelType = :fuelType', { fuelType: intent.fuelType });
    }

    // Filter by transmission
    if (intent.transmission) {
      qb.andWhere('v.transmission = :transmission', {
        transmission: intent.transmission,
      });
    }

    // Filter by condition
    if (intent.condition) {
      qb.andWhere('v.condition = :condition', { condition: intent.condition });
    }

    qb.orderBy('v.price', 'ASC').limit(15);

    const vehicles = await qb.getMany();
    const currency = marketCode === 'tn' ? 'TND' : 'EUR';

    // Also get total count without limit for context
    const totalCount = await qb.clone().limit(undefined).getCount();

    if (vehicles.length === 0) {
      return `No cars found matching these criteria in ${marketCode.toUpperCase()} (${totalCount} total in market). The user may be asking about cars we don't have.`;
    }

    const lines = vehicles.map((v) => this.formatVehicleLine(v, currency));

    return `## ${vehicles.length} cars found (${totalCount} total matching):\n${lines.join('\n')}`;
  }

  /**
   * Format a single vehicle as a compact line for the AI context.
   * Includes year and trim to help the AI disambiguate similar models.
   */
  private formatVehicleLine(v: Vehicle, currency: string): string {
    const brand = v.model?.brand?.name || '';
    const model = v.model?.name || '';
    const trim = v.trimName || '';
    const year = v.year || '';
    const price = Number(v.price).toLocaleString();
    const parts = [
      `id:${v.id}`,
      `${brand} ${model}`,
      year ? `${year}` : '',
      trim,
      `${price} ${currency}`,
      v.condition,
      v.fuelType,
      v.transmission,
      v.model?.bodyType || '',
    ];
    if (v.horsepower) parts.push(`${v.horsepower}hp`);
    if (v.mileageKm) parts.push(`${v.mileageKm.toLocaleString()}km`);
    if (v.features) {
      const featureNames = Object.keys(v.features).filter(
        (k) => (v.features as Record<string, unknown>)[k],
      );
      if (featureNames.length > 0) {
        parts.push(`options: ${featureNames.join(', ')}`);
      }
    }
    return parts.filter(Boolean).join(' | ');
  }
}
