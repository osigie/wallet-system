import { IsDate, IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class TransactionDto {
  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  id: number;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  fromAccountId: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  toAccountId: string;

  @ApiProperty()
  @IsDate()
  @IsNotEmpty()
  createdAt: string;

  @ApiProperty()
  @IsDate()
  @IsNotEmpty()
  creditStatus: string;
}
