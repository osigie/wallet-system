import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from 'src/app.module';
import { createUserDto } from 'src/common/utils/test-utils';
import * as request from 'supertest';
import { PrismaService } from '../src/prisma.service';

describe('AccountController (e2e)', () => {
  let prismaService: PrismaService;
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
      providers: [PrismaService],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
    prismaService = moduleFixture.get<PrismaService>(PrismaService);
    // await prismaService.cleanDatabase();
  });

  it('/accounts (POST)', async () => {
    await request(app.getHttpServer())
      .post('/auth/register')
      .send({ ...createUserDto, email: 'account@example.com' });

    const login = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'account@example.com', password: createUserDto.password });
    const token = login.body.data.access_token;
    return request(app.getHttpServer())
      .post('/accounts')
      .send({
        balance: 1000,
        currency: 'USD',
      })
      .set('Authorization', `Bearer ${token}`)
      .expect(201)
      .expect(({ body }) => {
        expect(body.message).toBe('Account created successfully');
        expect(body.data).toHaveProperty('balance');
        expect(body.data).toHaveProperty('currency');
      });
  });

  afterAll(async () => {
    await prismaService.cleanDatabase();
    await app.close();
  });
});
