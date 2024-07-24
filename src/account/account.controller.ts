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
import { JwtAuthGuard } from 'src/guards/jwt-auth-guard';
import { AccountService } from './account.service';
import { CreateAccountDto } from './dto/create-account-dto';
import { BaseResponseDto } from 'src/common/dto/base-response-dto';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Account')
@Controller()
export class AccountController {
  constructor(private accountService: AccountService) {}
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  @UsePipes(ValidationPipe)
  @Post('/accounts')
  async createAccount(@Request() req, @Body() account: CreateAccountDto) {
    const data = await this.accountService.createAccount(account, req.user.id);
    return new BaseResponseDto(
      'Account created successfully',
      HttpStatus.CREATED,
      data,
    );
  }
}
