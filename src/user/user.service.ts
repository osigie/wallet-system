import { Injectable } from '@nestjs/common';
import { Prisma, User } from '@prisma/client';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async findUser(
    userWhereUniqueInput: Prisma.UserWhereUniqueInput,
  ): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: userWhereUniqueInput,
      include: {
        accounts: true,
      },
    });
  }

  async createUser(user): Promise<User> {
    return this.prisma.user.create(user);
  }

  async resetPassword(password: string, id: number): Promise<User> {
    return this.prisma.user.update({
      where: {
        id,
      },
      data: {
        password,
      },
    });
  }

  async isUserAccount(userId: number, accountId: string) {
    try {
      const query = Prisma.sql`
      SELECT
        COUNT(acc.id)::INTEGER as count
      FROM "Account" acc 
      WHERE acc."userId" = ${userId} AND acc.id = ${accountId}; 
    `;
      const result = await this.prisma.$queryRaw(query);
      return result[0]?.count ? true : false;
    } catch (error) {
      throw error;
    }
  }
}
