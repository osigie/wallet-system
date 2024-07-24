import { Module } from '@nestjs/common';
import { TokenService } from './token.service';
import { RedisModule } from 'src/redis/redis.module';
import { UserModule } from 'src/user/user.module';

@Module({
  imports: [RedisModule, UserModule],
  providers: [TokenService],
  exports: [TokenService],
})
export class TokenModule {}
