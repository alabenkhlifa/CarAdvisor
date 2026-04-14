import { IsArray, IsInt, ArrayMinSize, ArrayMaxSize } from 'class-validator';

export class CompareVehiclesDto {
  @IsArray()
  @IsInt({ each: true })
  @ArrayMinSize(2)
  @ArrayMaxSize(4)
  ids!: number[];
}
