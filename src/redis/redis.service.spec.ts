import { Test, TestingModule } from '@nestjs/testing';
import { RedisService } from './redis.service';
import * as redisMock from 'redis-mock';

describe('RedisService', () => {
  let service: RedisService;
  let redisClientMock: any;

  beforeEach(async () => {
    redisClientMock = redisMock.createClient();
    redisClientMock.set = jest.fn();
    redisClientMock.get = jest.fn();
    redisClientMock.del = jest.fn();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RedisService,
        {
          provide: 'REDIS_CLIENT',
          useValue: redisClientMock,
        },
      ],
    }).compile();

    service = module.get<RedisService>(RedisService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('set', () => {
    it('should call set method of redis client with correct arguments', async () => {
      const key = 'test-key';
      const value = 'test-value';
      const expirationSeconds = 3600;

      await service.set(key, value, expirationSeconds);

      expect(redisClientMock.set).toHaveBeenCalledWith(
        key,
        value,
        'EX',
        expirationSeconds,
      );
    });
  });

  describe('get', () => {
    it('should call get method of redis client with correct arguments', async () => {
      const key = 'test-key';
      const returnValue = 'test-value';

      redisClientMock.get.mockResolvedValue(returnValue);

      const result = await service.get(key);

      expect(redisClientMock.get).toHaveBeenCalledWith(key);
      expect(result).toBe(returnValue);
    });
  });

  describe('delete', () => {
    it('should call del method of redis client with correct arguments', async () => {
      const key = 'test-key';

      await service.delete(key);

      expect(redisClientMock.del).toHaveBeenCalledWith(key);
    });
  });
});
