import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from 'src/app.module';
import * as request from 'supertest';
import { PrismaService } from '../src/prisma.service';
import { createUserDto } from 'src/common/utils/test-utils';

describe('TransactionController (e2e)', () => {
  let prismaService: PrismaService;
  let app: INestApplication;
  let senderId;
  let senderUserToken;
  let transactionId;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
      providers: [PrismaService],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
    prismaService = moduleFixture.get<PrismaService>(PrismaService);
    await prismaService.cleanDatabase();

    await request(app.getHttpServer())
      .post('/auth/register')
      .send({ ...createUserDto, email: 'transferpost@example.com' });

    await request(app.getHttpServer())
      .post('/auth/register')
      .send({ ...createUserDto, email: 'admin@prisma.com' });

    const senderUserResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'transferpost@example.com',
        password: createUserDto.password,
      });

    const receiverUserResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'admin@prisma.com',
        password: createUserDto.password,
      });

    senderUserToken = senderUserResponse?.body.data?.access_token;
    const receiverUserToken = receiverUserResponse?.body.data?.access_token;

    const senderAccount = await request(app.getHttpServer())
      .post('/accounts')
      .send({
        balance: 1000,
        currency: 'USD',
      })
      .set('Authorization', `Bearer ${senderUserToken}`);

    const receiverAccount = await request(app.getHttpServer())
      .post('/accounts')
      .send({
        balance: 5,
        currency: 'USD',
      })
      .set('Authorization', `Bearer ${receiverUserToken}`);

    const otpResponse = await request(app.getHttpServer())
      .post('/transfers/otp')
      .set('Authorization', `Bearer ${senderUserToken}`);

    const otp = otpResponse.body?.data;

    senderId = senderAccount.body?.data.id;
    const receiverId = receiverAccount.body?.data.id;

    const transferData = {
      senderId,
      receiverId,
      amount: 100,
      description: 'Test Transfer',
      otp,
    };

    const transactionResponse = await request(app.getHttpServer())
      .post('/transfers')
      .send(transferData)
      .set('Authorization', `Bearer ${senderUserToken}`);
    transactionId = transactionResponse.body?.data?.id;
  });

  it('/transactions/accounts/:accountId (GET)', async () => {
    return request(app.getHttpServer())
      .get(`/transactions/accounts/${senderId}?take=5&cursor=0`)
      .set('Authorization', `Bearer ${senderUserToken}`)
      .expect(200)
      .expect(({ body }) => {
        expect(body.message).toBe('Transaction history');
        expect(body.data).toHaveProperty('items');
        expect(body.data).toHaveProperty('metadata');
        expect(body.data).toHaveProperty('links');
      });
  });

  it('/transactions/:id/accounts/:accountId (GET)', async () => {
    return request(app.getHttpServer())
      .get(`/transactions/${transactionId}/accounts/${senderId}`)
      .set('Authorization', `Bearer ${senderUserToken}`)
      .expect(200)
      .expect(({ body }) => {
        expect(body.message).toBe('Success');
        expect(body.data).toHaveProperty('id');
        expect(body.data).toHaveProperty('fromAccountId');
        expect(body.data).toHaveProperty('toAccountId');
        expect(body.data).toHaveProperty('createdAt');
        expect(body.data).toHaveProperty('creditstatus');
      });
  });

  afterAll(async () => {
    await prismaService.cleanDatabase();
    await app.close();
  });
});
