import { IsString, IsNotEmpty, IsOptional, IsIn } from 'class-validator';

export class ChatRequestDto {
  @IsString()
  @IsNotEmpty()
  message!: string;

  @IsString()
  @IsOptional()
  sessionToken?: string;

  @IsString()
  @IsOptional()
  market?: string;

  @IsString()
  @IsOptional()
  @IsIn(['en', 'fr'])
  language?: string = 'en';
}
