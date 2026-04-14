import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { randomUUID } from 'crypto';
import { ChatSession } from '../../entities/chat-session.entity';

@Injectable()
export class ChatService {
  private readonly logger = new Logger(ChatService.name);

  constructor(
    @InjectRepository(ChatSession)
    private readonly chatSessionRepo: Repository<ChatSession>,
  ) {}

  async getOrCreateSession(
    sessionToken?: string,
    marketId?: number,
  ): Promise<ChatSession> {
    if (sessionToken) {
      const existing = await this.chatSessionRepo.findOne({
        where: { sessionToken },
      });
      if (existing) {
        return existing;
      }
    }

    const session = this.chatSessionRepo.create({
      sessionToken: sessionToken || randomUUID(),
      marketId: marketId || 1,
      preferences: {},
      messages: [],
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
    });

    return this.chatSessionRepo.save(session);
  }

  async addMessage(
    session: ChatSession,
    role: 'user' | 'assistant',
    content: string,
  ): Promise<void> {
    session.messages = [
      ...(session.messages || []),
      {
        role,
        content,
        timestamp: new Date().toISOString(),
      },
    ];

    await this.chatSessionRepo.save(session);
  }

  async getHistory(sessionToken: string): Promise<ChatSession | null> {
    return this.chatSessionRepo.findOne({
      where: { sessionToken },
    });
  }
}
