import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Request,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from './dto/create-user-dto';
import { LoginUserDto } from './dto/login-user.dto';
import { BaseResponseDto } from 'src/common/dto/base-response-dto';
import { ResetPasswordDto } from './dto/reset-password-dto';
import { NewPasswordDto } from './dto/new-password-dto';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Auth')
@Controller('/auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @HttpCode(HttpStatus.OK)
  @UsePipes(ValidationPipe)
  @Post('login')
  async login(@Request() req, @Body() user: LoginUserDto) {
    const data = await this.authService.login(user);
    return new BaseResponseDto('Login successful', HttpStatus.OK, data);
  }

  @Post('/register')
  @HttpCode(HttpStatus.CREATED)
  @UsePipes(ValidationPipe)
  async register(@Request() req, @Body() user: CreateUserDto) {
    const data = await this.authService.register(user);
    return new BaseResponseDto(
      'Account created successfully',
      HttpStatus.CREATED,
      data,
    );
  }

  @Post('/reset-password')
  @HttpCode(HttpStatus.OK)
  @UsePipes(ValidationPipe)
  async resetPassword(@Body() email: ResetPasswordDto) {
    const data = await this.authService.resetPassword(email.email);
    return new BaseResponseDto('Mail sent successfully', HttpStatus.OK, data);
  }

  @Post('/change-password')
  @HttpCode(HttpStatus.OK)
  @UsePipes(ValidationPipe)
  async changePassword(@Body() reqData: NewPasswordDto) {
    const data = await this.authService.newPassword(
      reqData.newPassword,
      reqData.token,
    );
    return new BaseResponseDto(
      'Password changed successfully',
      HttpStatus.OK,
      data,
    );
  }
}