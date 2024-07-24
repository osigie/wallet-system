import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { MailOptionsInterface, MailSender } from './interface/mail-sender';

@Injectable()
export class MailtrapEmailProviderImpl implements MailSender {
  constructor(private readonly configService: ConfigService) {}
  logger = new Logger('MailtrapEmailProvider');

  async sendEmail(mailOptions: MailOptionsInterface): Promise<unknown> {
    try {
      const transport = this.createTransport();
      return await transport.sendMail(mailOptions);
    } catch (err) {
      this.logger.error(`Error from EmailNotificationProvider ${err}`);
      throw new InternalServerErrorException(`An error occurred`);
    }
  }

  private createTransport() {
    return nodemailer.createTransport({
      host: this.configService.get('MAIL_TRAP_HOST'),
      port: this.configService.get('MAIL_TRAP_PORT'),
      auth: {
        user: this.configService.get('MAIL_TRAP_USERNAME'),
        pass: this.configService.get('MAIL_TRAP_PASSWORD'),
      },
    });
  }
}
