import {
  Controller,
  DefaultValuePipe,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Query,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/guards/jwt-auth-guard';
import { TransactionService } from './transaction.service';
import { BaseResponseDto } from 'src/common/dto/base-response-dto';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Transaction')
@Controller('/transactions')
export class TransactionController {
  constructor(private transactionService: TransactionService) {}

  @UseGuards(JwtAuthGuard)
  @UsePipes(ValidationPipe)
  @HttpCode(HttpStatus.OK)
  @Get('/accounts/:accountId')
  async findAllTransactions(
    @Param('accountId') accountId: string,
    @Query('take', new DefaultValuePipe(10), ParseIntPipe) take = 10,
    @Query('cursor', new DefaultValuePipe(0), ParseIntPipe) cursor = 0,
    @Query('startDate') startDate?: Date,
    @Query('endDate') endDate?: Date,
  ) {
    const data = await this.transactionService.findAllTransaction(
      cursor,
      take,
      startDate,
      endDate,
      accountId,
    );
    return new BaseResponseDto('Transaction history', HttpStatus.OK, data);
  }

  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @UsePipes(ValidationPipe)
  @Get('/:id/accounts/:accountId')
  async findSingleTransaction(
    @Param('id', ParseIntPipe) transactionId: number,
    @Param('accountId') accountId: string,
  ) {
    const data = await this.transactionService.findTransactionById(
      transactionId,
      accountId,
    );
    return new BaseResponseDto('Success', HttpStatus.OK, data);
  }
}
