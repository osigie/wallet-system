import { InjectQueue } from '@nestjs/bull';
import {
  BadRequestException,
  Injectable,
  Logger,
  NotAcceptableException,
} from '@nestjs/common';
import { Queue } from 'bull';
import { PrismaService } from 'src/prisma.service';
import { TokenService } from 'src/token/token.service';
import { CreateTransferDto } from './dto/create-transfer-dto';
import { User } from '@prisma/client';
import { otpEmailTemplate } from 'src/providers/mail/templates/otp-email-template';
import { otpTransferQueue, TRANSFER_OTP_PREFIX } from 'src/configs/constant';
import { ConfigService } from '@nestjs/config';
import { UserService } from 'src/user/user.service';

@Injectable()
export class TransferService {
  constructor(
    private prisma: PrismaService,
    @InjectQueue(otpTransferQueue) private mailQueue: Queue,
    private tokenService: TokenService,
    private configService: ConfigService,
    private userService: UserService,
  ) {}
  logger = new Logger('Transfer');

  async sendOtp(user: User) {
    try {
      const otp = await this.tokenService.generateToken({
        userId: String(user.id),
        prefix: TRANSFER_OTP_PREFIX,
      });

      await this.mailQueue.add(
        {
          to: user.email,
          from: this.configService.get('EMAIL_FROM_ADDRESS'),
          subject: 'Transfer OTP',
          html: otpEmailTemplate(
            `${user.firstName}  ${user.lastName}`,
            otp,
            this.configService.get('EMAIL_FROM_NAME'),
          ),
        },
        { priority: 1 },
      );
      this.logger.log('Token sent', otp);
      return otp;
    } catch (error) {
      this.logger.error('Token sending failed', error.stack);
      throw error;
    }
  }

  async transferFunds(data: CreateTransferDto, loginUserId: number) {
    try {
      const isUserAccount = await this.userService.isUserAccount(
        loginUserId,
        data.senderId,
      );

      if (!isUserAccount) {
        throw new BadRequestException(
          'You can only transfer funds from your account',
        );
      }

      const { senderId, amount, receiverId, description } = data;
      const { verification } = await this.tokenService.verifyToken(
        TRANSFER_OTP_PREFIX + data.otp,
      );
      if (!verification) {
        throw new NotAcceptableException('Invalid otp verification');
      }
      const transaction = this.prisma.$transaction(async (tx) => {
        // 1. Decrement amount from the sender.
        const sender = await tx.account.update({
          data: {
            balance: {
              decrement: amount,
            },
          },
          where: {
            id: senderId,
          },
        });

        // 2. Verify that the sender's balance didn't go below zero.
        if (sender.balance < 0) {
          throw new BadRequestException(
            `${senderId} doesn't have enough to send ${amount}`,
          );
        }

        // 3. Increment the recipient's balance by amount
        await tx.account.update({
          data: {
            balance: {
              increment: amount,
            },
          },
          where: {
            id: receiverId,
          },
        });

        return await tx.transaction.create({
          data: {
            fromAccountId: senderId,
            toAccountId: receiverId,
            amount,
            description: description,
          },
        });
      });
      this.logger.log('Transfer successful');
      return transaction;
    } catch (error) {
      this.logger.error('Transfer failed', error.stack);
      throw error;
    }
  }
}
