import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Request,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { TransferService } from './transfer.service';
import { JwtAuthGuard } from 'src/guards/jwt-auth-guard';
import { CreateTransferDto } from './dto/create-transfer-dto';
import { BaseResponseDto } from 'src/common/dto/base-response-dto';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Transfer')
@Controller('/transfers')
export class TransferController {
  constructor(private transferService: TransferService) {}
  @UseGuards(JwtAuthGuard)
  @UsePipes(ValidationPipe)
  @HttpCode(HttpStatus.OK)
  @Post()
  async transfer(@Body() reqData: CreateTransferDto, @Request() req) {
    const data = await this.transferService.transferFunds(reqData, req.user.id);
    return new BaseResponseDto('Transfer Done', HttpStatus.OK, data);
  }

  @UseGuards(JwtAuthGuard)
  @UsePipes(ValidationPipe)
  @HttpCode(HttpStatus.OK)
  @Post('/otp')
  async sendOtp(@Request() req) {
    const data = await this.transferService.sendOtp(req.user);
    return new BaseResponseDto('Otp Sent Successfully', HttpStatus.OK, data);
  }
}
