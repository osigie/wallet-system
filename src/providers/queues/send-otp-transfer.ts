import { Process, Processor } from '@nestjs/bull';
import { Injectable } from '@nestjs/common';
import { Job } from 'bull';
import { MailOptionsInterface } from '../mail/interface/mail-sender';
import { MailtrapEmailProviderImpl } from '../mail/mailtrap-email-provider-impl';
import { otpTransferQueue } from 'src/configs/constant';

@Injectable()
@Processor(otpTransferQueue)
export class SendOtpTransfer {
  constructor(
    private readonly mailtrapEmailProvider: MailtrapEmailProviderImpl,
  ) {}

  @Process()
  async send(job: Job<MailOptionsInterface>) {
    this.mailtrapEmailProvider.sendEmail(job.data);
  }
}
