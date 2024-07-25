import { Test, TestingModule } from '@nestjs/testing';
import { TokenService } from './token.service';
import { RedisService } from 'src/redis/redis.service';
import { UserService } from 'src/user/user.service';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { generateOtp } from 'src/lib/generate-otp';

const user = {
  id: 1,
  firstName: 'John',
  lastName: 'Doe',
  email: 'john@example.com',
  password: 'hashed',
  isDisabled: false,
  trialCount: 0,
  createdAt: new Date(),
  updatedAt: new Date(),
};

jest.mock('src/lib/generate-otp', () => ({
  generateOtp: jest.fn(),
}));

describe('TokenService', () => {
  let service: TokenService;
  let redisServiceMock: jest.Mocked<RedisService>;
  let userServiceMock: jest.Mocked<UserService>;

  beforeEach(async () => {
    redisServiceMock = {
      set: jest.fn(),
      get: jest.fn(),
      delete: jest.fn(),
    } as any;

    userServiceMock = {
      findUser: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TokenService,
        { provide: RedisService, useValue: redisServiceMock },
        { provide: UserService, useValue: userServiceMock },
      ],
    }).compile();

    service = module.get<TokenService>(TokenService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('generateToken', () => {
    it('should generate a token and store it in Redis', async () => {
      const otp = '123456';
      const userId = '1';
      const prefix = 'prefix:';
      const ttl = 3600;

      (generateOtp as jest.Mock).mockReturnValue(otp);
      await service.generateToken({ ttl, userId, prefix });

      expect(generateOtp).toHaveBeenCalled();
      expect(redisServiceMock.set).toHaveBeenCalledWith(
        `${prefix}${otp}`,
        userId,
        ttl,
      );
    });
  });

  describe('verifyToken', () => {
    it('should return user and verification true if token is valid', async () => {
      const token = 'prefix:123456';
      const userId = '1';
      redisServiceMock.get.mockResolvedValue(userId);
      userServiceMock.findUser.mockResolvedValue(user);
      redisServiceMock.delete.mockResolvedValue(undefined);

      const result = await service.verifyToken(token);

      expect(redisServiceMock.get).toHaveBeenCalledWith(token);
      expect(userServiceMock.findUser).toHaveBeenCalledWith({
        id: Number(userId),
      });
      expect(redisServiceMock.delete).toHaveBeenCalledWith(token);
      expect(result).toEqual({
        user,
        verification: true,
      });
    });

    it('should throw ConflictException if token is expired', async () => {
      const token = 'prefix:123456';

      redisServiceMock.get.mockResolvedValue(null);

      await expect(service.verifyToken(token)).rejects.toThrow(
        ConflictException,
      );
    });

    it('should throw NotFoundException if user is not found', async () => {
      const token = 'prefix:123456';
      const userId = '1';

      redisServiceMock.get.mockResolvedValue(userId);
      userServiceMock.findUser.mockResolvedValue(null);

      await expect(service.verifyToken(token)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
