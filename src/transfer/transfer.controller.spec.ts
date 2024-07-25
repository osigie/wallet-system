import { Test, TestingModule } from '@nestjs/testing';
import { TransferController } from './transfer.controller';
import { TransferService } from './transfer.service';
import { CreateTransferDto } from './dto/create-transfer-dto';
import { BaseResponseDto } from 'src/common/dto/base-response-dto';
import {
  BadRequestException,
  HttpStatus,
  NotAcceptableException,
} from '@nestjs/common';
import { createTransferDto } from 'src/common/utils/test-utils';

describe('TransferController', () => {
  let controller: TransferController;
  let transferService: jest.Mocked<TransferService>;

  beforeEach(async () => {
    transferService = {
      transferFunds: jest.fn(),
      sendOtp: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      controllers: [TransferController],
      providers: [{ provide: TransferService, useValue: transferService }],
    }).compile();

    controller = module.get<TransferController>(TransferController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('transfer', () => {
    it('should successfully transfer funds and return a response', async () => {
      const user = { id: 1 };

      const transferValue = {
        fromAccountId: createTransferDto.senderId,
        toAccountId: createTransferDto.receiverId,
        amount: createTransferDto.amount,
        description: createTransferDto.description,
        id: 1,
        createdAt: new Date(),
      };

      transferService.transferFunds.mockResolvedValue(transferValue);

      const response = await controller.transfer(createTransferDto, { user });

      expect(transferService.transferFunds).toHaveBeenCalledWith(
        createTransferDto,
        user.id,
      );
      expect(response).toEqual(
        new BaseResponseDto('Transfer Done', HttpStatus.OK, transferValue),
      );
    });

    it('should handle BadRequestException thrown by TransferService', async () => {
      const reqData: CreateTransferDto = {
        senderId: '1',
        receiverId: '2',
        amount: 100,
        otp: '123456',
        description: 'Transfer',
      };
      const user = { id: 1 };

      transferService.transferFunds.mockRejectedValue(
        new BadRequestException('Invalid transfer'),
      );

      await expect(controller.transfer(reqData, { user })).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should handle NotAcceptableException thrown by TransferService', async () => {
      const reqData: CreateTransferDto = {
        senderId: '1',
        receiverId: '2',
        amount: 100,
        otp: '123456',
        description: 'Transfer',
      };
      const user = { id: 1 };

      transferService.transferFunds.mockRejectedValue(
        new NotAcceptableException('Invalid OTP'),
      );

      await expect(controller.transfer(reqData, { user })).rejects.toThrow(
        NotAcceptableException,
      );
    });
  });

  describe('sendOtp', () => {
    it('should successfully send OTP and return a response', async () => {
      const user = {
        id: 1,
        email: 'user@example.com',
        firstName: 'John',
        lastName: 'Doe',
      };
      const otp = '123456';

      transferService.sendOtp.mockResolvedValue(otp);

      const response = await controller.sendOtp({ user });

      expect(transferService.sendOtp).toHaveBeenCalledWith(user);
      expect(response).toEqual(
        new BaseResponseDto('Otp Sent Successfully', HttpStatus.OK, otp),
      );
    });

    it('should handle error thrown by TransferService', async () => {
      const user = { id: 1 };

      transferService.sendOtp.mockRejectedValue(
        new Error('OTP sending failed'),
      );

      await expect(controller.sendOtp({ user })).rejects.toThrow(
        'OTP sending failed',
      );
    });
  });
});
