import { IsOptional, IsString, IsEnum, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { PaginationQuery } from '../../../common/dto/pagination.dto';

export enum VehicleSortOption {
  PRICE_ASC = 'price_asc',
  PRICE_DESC = 'price_desc',
  YEAR_DESC = 'year_desc',
  YEAR_ASC = 'year_asc',
}

export class SearchVehiclesDto extends PaginationQuery {
  @IsString()
  market!: string;

  @IsOptional()
  @IsString()
  condition?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  minPrice?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  maxPrice?: number;

  @IsOptional()
  @IsString()
  bodyType?: string;

  @IsOptional()
  @IsString()
  fuelType?: string;

  @IsOptional()
  @IsString()
  transmission?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  brandId?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  modelId?: number;

  @IsOptional()
  @IsEnum(VehicleSortOption)
  sort?: VehicleSortOption;
}
