import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../src/app.module'; // Adjust path if necessary
import * as request from 'supertest';
import { createUserDto } from '../src/common/utils/test-utils';
import { PrismaService } from '../src/prisma.service';

describe('AuthController (e2e)', () => {
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
    await prismaService.cleanDatabase();
  });

  it('/auth/register (POST)', async () => {
    return request(app.getHttpServer())
      .post('/auth/register')
      .send(createUserDto)
      .expect(201)
      .expect(({ body }) => {
        expect(body.message).toBe('Account created successfully');
        expect(body.data).toHaveProperty('user');
      });
  });

  it('/auth/login (POST)', async () => {
    return request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: createUserDto.email, password: createUserDto.password })
      .expect(200)
      .expect(({ body }) => {
        expect(body.message).toBe('Login successful');
        expect(body.data).toHaveProperty('access_token');
        expect(body.data).toHaveProperty('user');
      });
  });

  it('/auth/reset-password (POST)', async () => {
    return request(app.getHttpServer())
      .post('/auth/reset-password')
      .send({ email: createUserDto.email })
      .expect(200)
      .expect(({ body }) => {
        expect(body.message).toBe('Mail sent successfully');
      });
  });

  it('/auth/change-password (POST)', async () => {
    // Request password reset to get a token
    const resetResponse = await request(app.getHttpServer())
      .post('/auth/reset-password')
      .send({ email: createUserDto.email })
      .expect(200);

    const token = resetResponse.body.data;

    return request(app.getHttpServer())
      .post('/auth/change-password')
      .send({ newPassword: 'newpassword', token })
      .expect(200)
      .expect(({ body }) => {
        expect(body.message).toBe('Password changed successfully');
        expect(body.data).toHaveProperty('access_token');
        expect(body.data).toHaveProperty('user');
      });
  });

  afterAll(async () => {
    await prismaService.cleanDatabase();
    await app.close();
  });
});
