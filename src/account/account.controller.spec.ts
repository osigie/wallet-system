import { Test, TestingModule } from '@nestjs/testing';
import { AccountController } from './account.controller';
import { AccountService } from './account.service';
import { JwtAuthGuard } from 'src/guards/jwt-auth-guard';
import { CreateAccountDto } from './dto/create-account-dto';
import { BaseResponseDto } from 'src/common/dto/base-response-dto';
import { HttpStatus } from '@nestjs/common';
import { jest } from '@jest/globals';

describe('AccountController', () => {
  let controller: AccountController;
  let accountService: jest.Mocked<AccountService>;

  beforeEach(async () => {
    accountService = {
      createAccount: jest.fn(),
    } as unknown as jest.Mocked<AccountService>;

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AccountController],
      providers: [
        {
          provide: AccountService,
          useValue: accountService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: jest.fn(() => true) }) // Mock JwtAuthGuard
      .compile();

    controller = module.get<AccountController>(AccountController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createAccount', () => {
    it('should create an account successfully', async () => {
      const createAccountDto: CreateAccountDto = {
        balance: 1000,
        currency: 'USD',
      };

      const userId = 1;
      const mockRequest = {
        user: { id: userId },
      };

      const createdAccount = {
        id: '1',
        ...createAccountDto,
        userId,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      accountService.createAccount.mockResolvedValue(createdAccount);

      const response = await controller.createAccount(
        mockRequest as any,
        createAccountDto,
      );

      expect(response).toEqual(
        new BaseResponseDto(
          'Account created successfully',
          HttpStatus.CREATED,
          createdAccount,
        ),
      );
      expect(accountService.createAccount).toHaveBeenCalledWith(
        createAccountDto,
        userId,
      );
    });

    it('should handle errors properly', async () => {
      const createAccountDto: CreateAccountDto = {
        balance: 1000,
        currency: 'USD',
      };

      const userId = 1;
      const mockRequest = {
        user: { id: userId },
      };

      const error = new Error('Account creation failed');
      accountService.createAccount.mockRejectedValue(error);

      await expect(
        controller.createAccount(mockRequest as any, createAccountDto),
      ).rejects.toThrow(error);

      expect(accountService.createAccount).toHaveBeenCalledWith(
        createAccountDto,
        userId,
      );
    });
  });
});
