import { Test, TestingModule } from '@nestjs/testing';
import { TransactionController } from './transaction.controller';
import { TransactionService } from './transaction.service';
import { BaseResponseDto } from 'src/common/dto/base-response-dto';
import { HttpStatus } from '@nestjs/common';

describe('TransactionController', () => {
  let controller: TransactionController;
  let transactionService: jest.Mocked<TransactionService>;

  beforeEach(async () => {
    transactionService = {
      findAllTransaction: jest.fn(),
      findTransactionById: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      controllers: [TransactionController],
      providers: [
        { provide: TransactionService, useValue: transactionService },
      ],
    }).compile();

    controller = module.get<TransactionController>(TransactionController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAllTransactions', () => {
    it('should return paginated transactions', async () => {
      const data = {
        items: [
          {
            id: 1,
            fromAccountId: '123',
            toAccountId: '456',
            createdAt: '2024-03-12',
            creditStatus: 'DEBIT',
          },
        ],
        metadata: { nextCursor: 1, previousCursor: null, totalCount: '100' },
        links: {
          previous: 'previous',
          next: 'next',
          totalCount: '2',
        },
      };
      const accountId = '123';
      const cursor = 0;
      const take = 10;
      const startDate = new Date('2024-03-12');
      const endDate = new Date('2024-03-12');

      transactionService.findAllTransaction.mockResolvedValue(data);

      const result = await controller.findAllTransactions(
        accountId,
        take,
        cursor,
        startDate,
        endDate,
      );

      expect(transactionService.findAllTransaction).toHaveBeenCalledWith(
        cursor,
        take,
        startDate,
        endDate,
        accountId,
      );
      expect(result).toEqual(
        new BaseResponseDto('Transaction history', HttpStatus.OK, data),
      );
    });
  });

  describe('findSingleTransaction', () => {
    it('should return a single transaction', async () => {
      const transactionId = 1;
      const accountId = '123';
      const transaction = {
        id: 1,
        fromAccountId: '123',
        toAccountId: '456',
        createdAt: '2024-03-12',
        creditStatus: 'DEBIT',
      };

      transactionService.findTransactionById.mockResolvedValue(transaction);

      const result = await controller.findSingleTransaction(
        transactionId,
        accountId,
      );

      expect(transactionService.findTransactionById).toHaveBeenCalledWith(
        transactionId,
        accountId,
      );
      expect(result).toEqual(
        new BaseResponseDto('Success', HttpStatus.OK, transaction),
      );
    });
  });
});
