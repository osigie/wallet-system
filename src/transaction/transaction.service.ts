import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { Imetadata, IPaginationLinks, paginate } from 'src/lib/paginate';
import { PrismaService } from 'src/prisma.service';
import { TransactionDto } from './dto/transaction-dto';

@Injectable()
export class TransactionService {
  constructor(private prisma: PrismaService) {}
  logger = new Logger('Transaction');
  async findAllTransaction(
    cursor: number,
    take: number,
    startDate: Date,
    endDate: Date,
    accountId: string,
  ): Promise<{
    items: TransactionDto[];
    metadata: Imetadata;
    links: IPaginationLinks;
  }> {
    try {
      const conditions: Prisma.Sql[] = [];
      if (startDate) {
        conditions.push(Prisma.sql`"createdAt" >= ${new Date(startDate)}`);
      }
      if (endDate) {
        conditions.push(Prisma.sql`"createdAt" <= ${new Date(endDate)}`);
      }

      const conditionFragment =
        conditions.length > 0
          ? Prisma.sql` AND (${conditions.map((cond) => Prisma.sql`${cond}`).reduce((acc, curr) => Prisma.sql`${acc} AND ${curr}`)})`
          : Prisma.sql``;

      const query = Prisma.sql`
  WITH LimitedTransactions AS (
      SELECT *,
             CASE
                 WHEN "fromAccountId" = ${accountId} THEN 'DEBIT'
                 ELSE 'CREDIT'
             END AS creditStatus
      FROM "Transaction"
      WHERE ("fromAccountId" = ${accountId} OR "toAccountId" = ${accountId})
        ${conditionFragment}
      ORDER BY "id" ASC
  )
  SELECT *
  FROM LimitedTransactions
  WHERE "id" > ${cursor}
  ORDER BY "id" ASC
  LIMIT LEAST(50, ${take});
`;

      const totalCountQuery = Prisma.sql`
  SELECT COUNT(*) as count
  FROM "Transaction"
  WHERE ("fromAccountId" = ${accountId} OR "toAccountId" = ${accountId})
    ${conditionFragment}
`;

      return paginate<TransactionDto>(
        cursor,
        take,
        (item) => item?.id,
        totalCountQuery,
        query,
        this.prisma,
        `/transactions/accounts/${accountId}`,
      );
    } catch (error) {
      this.logger.error('Transaction fetched failed', error.stack);
      throw error;
    }
  }

  async findTransactionById(
    transactionId: number,
    accountId: string,
  ): Promise<TransactionDto> {
    try {
      const query = Prisma.sql`
      SELECT
        id,
        "fromAccountId",
        "toAccountId",
        "createdAt",
        CASE
          WHEN "fromAccountId" = ${accountId} THEN 'DEBIT'
          ELSE 'CREDIT'
        END AS creditStatus
      FROM "Transaction"
      WHERE id = ${transactionId};
    `;
      const result = await this.prisma.$queryRaw<TransactionDto[]>(query);

      if (result.length === 0) {
        throw new NotFoundException('Transaction not found');
      }
      return result[0];
    } catch (error) {
      this.logger.error('Transaction fetched failed', error.stack);
      throw error;
    }
  }
}
