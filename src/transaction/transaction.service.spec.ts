import { Test, TestingModule } from '@nestjs/testing';
import { TransactionService } from './transaction.service';
import { PrismaService } from 'src/prisma.service';
import { NotFoundException } from '@nestjs/common';

const prismaServiceMock = {
  $queryRaw: jest.fn(),
};

describe('TransactionService', () => {
  let service: TransactionService;
  let prisma: jest.Mocked<PrismaService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TransactionService,
        { provide: PrismaService, useValue: prismaServiceMock },
      ],
    }).compile();

    service = module.get<TransactionService>(TransactionService);
    prisma = module.get<PrismaService>(
      PrismaService,
    ) as jest.Mocked<PrismaService>;
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAllTransaction', () => {
    it('should call paginate with correct parameters and return paginated transactions', async () => {
      const cursor = 0;
      const take = 10;
      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-12-31');
      const accountId = '123';
      const transactions = [
        {
          id: 1,
          fromAccountId: '123',
          toAccountId: '456',
          createdAt: new Date(),
          creditStatus: 'DEBIT',
        },
      ];
      const totalCount = 100;

      prisma.$queryRaw.mockResolvedValueOnce(transactions);
      prisma.$queryRaw.mockResolvedValueOnce([{ count: totalCount }]);

      const result = await service.findAllTransaction(
        cursor,
        take,
        startDate,
        endDate,
        accountId,
      );

      expect(prisma.$queryRaw).toHaveBeenCalledTimes(2);
      expect(prisma.$queryRaw).toHaveBeenCalledWith(expect.anything());

      expect(result).toEqual({
        items: transactions,
        metadata: {
          nextCursor: 1,
          previousCursor: null,
          totalCount: '100',
        },
        links: {
          first: expect.any(String),
          previous: null,
          next: expect.any(String),
        },
      });
    });

    it('should handle errors and log them', async () => {
      const error = new Error('Database error');
      prisma.$queryRaw.mockRejectedValueOnce(error);

      await expect(
        service.findAllTransaction(0, 10, new Date(), new Date(), '123'),
      ).rejects.toThrowError(error);
    });
  });

  describe('findTransactionById', () => {
    it('should return the transaction if found', async () => {
      const transactionId = 1;
      const accountId = '123';
      const transaction = {
        id: 1,
        fromAccountId: '123',
        toAccountId: '456',
        createdAt: new Date(),
        creditStatus: 'DEBIT',
      };

      prisma.$queryRaw.mockResolvedValueOnce([transaction]);

      const result = await service.findTransactionById(
        transactionId,
        accountId,
      );

      expect(prisma.$queryRaw).toHaveBeenCalledWith(expect.anything()); // Ensure it's called with a SQL query
      expect(result).toEqual(transaction);
    });

    it('should throw NotFoundException if transaction is not found', async () => {
      const transactionId = 1;
      const accountId = '123';

      prisma.$queryRaw.mockResolvedValueOnce([]);

      await expect(
        service.findTransactionById(transactionId, accountId),
      ).rejects.toThrow(NotFoundException);
    });

    it('should handle errors and log them', async () => {
      const error = new Error('Database error');
      prisma.$queryRaw.mockRejectedValueOnce(error);

      await expect(service.findTransactionById(1, '123')).rejects.toThrowError(
        error,
      );
    });
  });
});
