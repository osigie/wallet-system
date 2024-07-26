import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AccountModule } from './account/account.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { TransactionModule } from './transaction/transaction.module';
import { TransferModule } from './transfer/transfer.module';
import { UserModule } from './user/user.module';
import { RedisModule } from './redis/redis.module';
import { TokenModule } from './token/token.module';
import { validationSchema } from './configs/config-validation';
import { DEVELEOPMENT_ENV } from './configs/constant';

@Module({
  imports: [
    ConfigModule.forRoot({
      validationSchema: validationSchema,
      isGlobal: true,
      envFilePath: `.env.${process.env.NODE_ENV || DEVELEOPMENT_ENV}`,
    }),

    BullModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        redis: {
          host: configService.get<string>('REDIS_HOST'),
          port: 6379,
        },
      }),
    }),
    AuthModule,
    UserModule,
    AccountModule,
    TransferModule,
    TransactionModule,
    RedisModule,
    TokenModule,
  ],
  controllers: [AppController],
  providers: [AppService],
  exports: [BullModule],
})
export class AppModule {}
