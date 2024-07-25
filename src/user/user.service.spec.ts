import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { PrismaService } from 'src/prisma.service';
import { user } from 'src/common/utils/test-utils';

describe('UserService', () => {
  let service: UserService;

  const mockPrismaService = {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    $queryRaw: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findUser', () => {
    it('should return a user if found', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(user);

      const result = await service.findUser({ id: 1 });
      expect(result).toEqual(user);
    });

    it('should return null if user not found', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      const result = await service.findUser({ id: 1 });
      expect(result).toBeNull();
    });
  });

  describe('createUser', () => {
    it('should create and return a user', async () => {
      mockPrismaService.user.create.mockResolvedValue(user);

      const result = await service.createUser({ data: user });
      expect(result).toEqual(user);
    });
  });

  describe('resetPassword', () => {
    it('should reset and return the updated user', async () => {
      mockPrismaService.user.update.mockResolvedValue(user);
      const result = await service.resetPassword('newpassword', 1);
      expect(result).toEqual(user);
    });
  });

  describe('isUserAccount', () => {
    it('should return true if the user has the account', async () => {
      mockPrismaService.$queryRaw.mockResolvedValue([{ count: 1 }]);
      const result = await service.isUserAccount(1, 'account-id');
      expect(result).toBe(true);
    });

    it('should return false if the user does not have the account', async () => {
      mockPrismaService.$queryRaw.mockResolvedValue([{ count: 0 }]);

      const result = await service.isUserAccount(1, 'account-id');
      expect(result).toBe(false);
    });

    it('should throw an error if query fails', async () => {
      mockPrismaService.$queryRaw.mockRejectedValue(
        new Error('Database error'),
      );

      await expect(service.isUserAccount(1, 'account-id')).rejects.toThrow(
        'Database error',
      );
    });
  });
});
