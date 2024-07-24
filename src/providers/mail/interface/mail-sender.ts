export interface MailSender {
  sendEmail(mailOptions: MailOptionsInterface): Promise<unknown>;
}

export type MailOptionsInterface = {
  to: string | string[];
  from: string;
  subject: string;
  html?: string;
  text?: string;
  cc?: string | string[];
  bcc?: string | string[];
};
