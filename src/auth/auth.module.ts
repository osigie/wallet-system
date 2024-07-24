import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { resetPasswordQueue } from 'src/configs/constant';
import { MailtrapEmailProviderImpl } from 'src/providers/mail/mailtrap-email-provider-impl';
import { SendOtpResetPassword } from 'src/providers/queues/send-otp-reset-password';
import { TokenModule } from 'src/token/token.module';
import { JwtStrategy } from '../guards/jw.strategy';
import { UserModule } from '../user/user.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

@Module({
  imports: [
    UserModule,
    PassportModule,
    // JwtModule.register({
    //   secret: jwtConstants.secret,
    //   signOptions: { expiresIn: process.env.JWT_EXPIRATION },
    // }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: configService.get<string>('JWT_EXPIRATION'),
        },
      }),
      inject: [ConfigService],
    }),
    TokenModule,
    BullModule.registerQueue({
      name: resetPasswordQueue,
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy,
    SendOtpResetPassword,
    MailtrapEmailProviderImpl,
  ],
})
export class AuthModule {}
