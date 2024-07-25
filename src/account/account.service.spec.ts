import { Test, TestingModule } from '@nestjs/testing';
import { AccountService } from './account.service';
import { CreateAccountDto } from './dto/create-account-dto';
import { Account } from '@prisma/client';
import { PrismaService } from '../prisma.service';

describe('AccountService', () => {
  let service: AccountService;
  let prismaService: PrismaService;

  const mockPrismaService = {
    account: {
      create: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AccountService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<AccountService>(AccountService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createAccount', () => {
    it('should create an account successfully', async () => {
      const createAccountDto: CreateAccountDto = {
        balance: 1000,
        currency: 'USD',
      };

      const userId = 1;
      const createdAccount: Account = {
        id: '1',
        balance: 1000,
        currency: 'USD',
        userId: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.account.create.mockResolvedValue(createdAccount);

      const result = await service.createAccount(createAccountDto, userId);

      expect(result).toEqual(createdAccount);
      expect(prismaService.account.create).toHaveBeenCalledWith({
        data: {
          balance: createAccountDto.balance,
          currency: createAccountDto.currency,
          user: {
            connect: { id: userId },
          },
        },
      });
    });

    it('should handle errors properly', async () => {
      const createAccountDto: CreateAccountDto = {
        balance: 1000,
        currency: 'USD',
      };

      const userId = 1;
      const error = new Error('Something went wrong');
      mockPrismaService.account.create.mockRejectedValue(error);

      await expect(
        service.createAccount(createAccountDto, userId),
      ).rejects.toThrow('Something went wrong');
      expect(prismaService.account.create).toHaveBeenCalledWith({
        data: {
          balance: createAccountDto.balance,
          currency: createAccountDto.currency,
          user: {
            connect: { id: userId },
          },
        },
      });
    });
  });
});
