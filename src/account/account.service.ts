import { Injectable, Logger } from '@nestjs/common';
import { Account } from '@prisma/client';
import { PrismaService } from 'src/prisma.service';
import { CreateAccountDto } from './dto/create-account-dto';

@Injectable()
export class AccountService {
  constructor(private prisma: PrismaService) {}
  logger = new Logger('Acccount');
  async createAccount(
    account: CreateAccountDto,
    userId: number,
  ): Promise<Account> {
    try {
      const createdAccount = this.prisma.account.create({
        data: {
          balance: account?.balance,
          currency: account?.currency,
          user: {
            connect: { id: userId },
          },
        },
      });
      this.logger.log('Account created successful {}');
      return createdAccount;
    } catch (error) {
      this.logger.error('Account creation failed', error.stack);
      throw error;
    }
  }
}
