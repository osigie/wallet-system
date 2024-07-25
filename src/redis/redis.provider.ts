import { Provider } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

export type RedisClient = Redis;

export const redisProvider: Provider = {
  useFactory: async (configService: ConfigService) => {
    return new Redis({
      host: configService.get('REDIS_HOST'),
      port: 6379,
    });
  },
  provide: 'REDIS_CLIENT',
  inject: [ConfigService],
};
