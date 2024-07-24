import { Module } from '@nestjs/common';
import { TransferService } from './transfer.service';
import { TransferController } from './transfer.controller';
import { PrismaService } from 'src/prisma.service';
import { BullModule } from '@nestjs/bull';
import { MailtrapEmailProviderImpl } from 'src/providers/mail/mailtrap-email-provider-impl';
import { SendOtpTransfer } from 'src/providers/queues/send-otp-transfer';
import { TokenModule } from 'src/token/token.module';
import { otpTransferQueue } from 'src/configs/constant';
import { UserService } from 'src/user/user.service';

@Module({
  imports: [
    BullModule.registerQueue({
      name: otpTransferQueue,
    }),
    TokenModule,
  ],
  providers: [
    TransferService,
    PrismaService,
    MailtrapEmailProviderImpl,
    SendOtpTransfer,
    UserService,
  ],
  controllers: [TransferController],
})
export class TransferModule {}
