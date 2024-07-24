import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateAccountDto {
  @ApiProperty()
  @IsNumber()
  @IsOptional()
  balance: number;

  @ApiProperty()
  @IsString()
  @IsOptional()
  currency: string;
}
