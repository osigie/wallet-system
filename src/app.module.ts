import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
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

@Module({
  imports: [
    ConfigModule.forRoot({
      validationSchema: validationSchema,
      isGlobal: true,
    }),
    BullModule.forRoot({
      redis: {
        host: 'localhost',
        port: 6379,
      },
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
