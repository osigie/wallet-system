import { NotAcceptableException, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { Job, Queue } from 'bull';
import { createTransferDto, user } from 'src/common/utils/test-utils';
import { TRANSFER_OTP_PREFIX } from 'src/configs/constant';
import { PrismaService } from 'src/prisma.service';
import { otpEmailTemplate } from 'src/providers/mail/templates/otp-email-template';
import { TokenService } from 'src/token/token.service';
import { UserService } from 'src/user/user.service';
import { TransferService } from './transfer.service';

describe('TransferService', () => {
  let service: TransferService;
  let prismaService: jest.Mocked<PrismaService>;
  let tokenService: jest.Mocked<TokenService>;
  let configService: jest.Mocked<ConfigService>;
  let userService: jest.Mocked<UserService>;
  let mailQueue: jest.Mocked<Queue>;

  beforeEach(async () => {
    prismaService = {
      $transaction: jest.fn(),
    } as any;

    tokenService = {
      generateToken: jest.fn(),
      verifyToken: jest.fn(),
    } as any;

    configService = {
      get: jest.fn(),
    } as any;

    userService = {
      isUserAccount: jest.fn(),
    } as any;

    mailQueue = {
      add: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TransferService,
        { provide: PrismaService, useValue: prismaService },
        { provide: TokenService, useValue: tokenService },
        { provide: ConfigService, useValue: configService },
        { provide: UserService, useValue: userService },
        // { provide: otpTransferQueue, useValue: mailQueue },
        { provide: 'BullQueue_otp-transfer-mail-queue', useValue: mailQueue },
      ],
    }).compile();

    service = module.get<TransferService>(TransferService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('sendOtp', () => {
    it('should send an OTP and return it', async () => {
      const otp = '123456';

      tokenService.generateToken.mockResolvedValue(otp);
      configService.get.mockReturnValue('noreply@example.com');
      mailQueue.add.mockResolvedValue({} as Job<any>);

      const result = await service.sendOtp(user);

      expect(tokenService.generateToken).toHaveBeenCalledWith({
        userId: String(user.id),
        prefix: TRANSFER_OTP_PREFIX,
      });
      expect(mailQueue.add).toHaveBeenCalledWith(
        {
          to: user.email,
          from: 'noreply@example.com',
          subject: 'Transfer OTP',
          html: otpEmailTemplate(
            `${user.firstName}  ${user.lastName}`,
            otp,
            'noreply@example.com',
          ),
        },
        { priority: 1 },
      );
      expect(result).toBe(otp);
    });

    it('should throw an error if token generation fails', async () => {
      const error = new Error('Token generation failed');
      tokenService.generateToken.mockRejectedValue(error);
      await expect(service.sendOtp(user)).rejects.toThrow(error);
    });
  });

  describe('transferFunds', () => {
    it('should transfer funds and create a transaction', async () => {
      const loginUserId = 1;

      const transaction = {
        fromAccountId: createTransferDto.senderId,
        toAccountId: createTransferDto.receiverId,
        amount: createTransferDto.amount,
        description: createTransferDto.description,
      };
      tokenService.verifyToken.mockResolvedValue({ user, verification: true });

      userService.isUserAccount.mockResolvedValue(true);

      prismaService.$transaction.mockResolvedValue(transaction);

      const result = await service.transferFunds(
        createTransferDto,
        loginUserId,
      );

      expect(tokenService.verifyToken).toHaveBeenCalledWith(
        TRANSFER_OTP_PREFIX + createTransferDto.otp,
      );
      expect(prismaService.$transaction).toHaveBeenCalled();
      expect(result).toEqual(transaction);
    });

    it('should throw Unathorized if user is not authorized to transfer funds', async () => {
      const loginUserId = 2;
      userService.isUserAccount.mockResolvedValue(false);
      await expect(
        service.transferFunds(createTransferDto, loginUserId),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw NotAcceptableException if OTP verification fails', async () => {
      const loginUserId = 1;
      userService.isUserAccount.mockResolvedValue(true);
      tokenService.verifyToken.mockResolvedValue({ user, verification: false });

      await expect(
        service.transferFunds(createTransferDto, loginUserId),
      ).rejects.toThrow(NotAcceptableException);
    });
  });
});
