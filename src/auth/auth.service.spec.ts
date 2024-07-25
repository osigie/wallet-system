import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { UserService } from 'src/user/user.service';
import { TokenService } from 'src/token/token.service';
import { Queue } from 'bull';
import { ConfigService } from '@nestjs/config';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { FORGET_PASSWORD_PREFIX } from 'src/configs/constant';
import { otpResetPasswordTemplate } from 'src/providers/mail/templates/otp-reset-password-template';
import { createUserDto, loginDto, user } from 'src/common/utils/test-utils';

jest.mock('bcrypt', () => ({
  genSalt: jest.fn(),
  hash: jest.fn(),
  compare: jest.fn(),
}));

describe('AuthService', () => {
  let service: AuthService;
  let jwtService: JwtService;
  let userService: UserService;
  let tokenService: TokenService;
  let mailQueue: Queue;
  let configService: ConfigService;

  beforeEach(async () => {
    jwtService = { sign: jest.fn() } as unknown as JwtService;
    userService = {
      findUser: jest.fn(),
      createUser: jest.fn(),
      resetPassword: jest.fn(),
    } as unknown as UserService;
    tokenService = {
      generateToken: jest.fn(),
      verifyToken: jest.fn(),
    } as unknown as TokenService;
    mailQueue = { add: jest.fn() } as unknown as Queue;
    configService = { get: jest.fn() } as unknown as ConfigService;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: JwtService, useValue: jwtService },
        { provide: UserService, useValue: userService },
        { provide: TokenService, useValue: tokenService },
        { provide: ConfigService, useValue: configService },
        { provide: 'BullQueue_rest-password-mail-queue', useValue: mailQueue },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('login', () => {
    it('should return access token and user details on successful login', async () => {
      const payload = { email: 'john@example.com', sub: 1 };
      const accessToken = 'access_token';

      (userService.findUser as jest.Mock).mockResolvedValue(user);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (jwtService.sign as jest.Mock).mockReturnValue(accessToken);

      const result = await service.login(loginDto);

      expect(result).toMatchObject({
        access_token: accessToken,
        user: {
          id: user.id,
          email: user.email,
        },
      });
      expect(userService.findUser).toHaveBeenCalledWith({
        email: loginDto.email,
      });
      // expect(bcrypt.compare).toHaveBeenCalledWith(
      //   loginDto.password,
      //   user.password,
      // );
      expect(jwtService.sign).toHaveBeenCalledWith(payload);
    });

    it('should throw BadRequestException on invalid credentials', async () => {
      (userService.findUser as jest.Mock).mockResolvedValue(user);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);
      await expect(service.login(loginDto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('register', () => {
    it('should register a user successfully', async () => {
      (bcrypt.hash as jest.Mock).mockResolvedValue(createUserDto.password);
      (userService.findUser as jest.Mock).mockResolvedValue(null);
      (userService.createUser as jest.Mock).mockResolvedValue(user);
      const result = await service.register(createUserDto);
      expect(result).toEqual({ user });
      expect(userService.findUser).toHaveBeenCalledWith({
        email: createUserDto.email,
      });
      expect(bcrypt.hash).toHaveBeenCalledWith(
        createUserDto.password,
        undefined,
      );
    });

    it('should throw BadRequestException if email is already registered', async () => {
      (userService.findUser as jest.Mock).mockResolvedValue({});
      await expect(service.register(createUserDto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('resetPassword', () => {
    it('should send reset password email successfully', async () => {
      const token = 'token';
      const fromEmail = 'from@example.com';
      (userService.findUser as jest.Mock).mockResolvedValue(user);
      (tokenService.generateToken as jest.Mock).mockResolvedValue(token);
      (mailQueue.add as jest.Mock).mockResolvedValue(null);
      (configService.get as jest.Mock).mockReturnValue(fromEmail);

      await service.resetPassword(user.email);

      expect(userService.findUser).toHaveBeenCalledWith({
        email: user.email,
      });
      expect(tokenService.generateToken).toHaveBeenCalledWith({
        prefix: FORGET_PASSWORD_PREFIX,
        userId: '1',
      });
      expect(mailQueue.add).toHaveBeenCalledWith(
        {
          to: user.email,
          from: fromEmail,
          subject: 'Reset Password',
          html: otpResetPasswordTemplate(
            'John  Doe',
            token,
            FORGET_PASSWORD_PREFIX + token,
            fromEmail,
          ),
        },
        { priority: 1 },
      );
    });

    it('should throw NotFound if user not found', async () => {
      const email = 'test@example.com';
      (userService.findUser as jest.Mock).mockResolvedValue(null);

      await expect(service.resetPassword(email)).rejects.toThrow(
        NotFoundException,
      );
    });

    describe('newPassword', () => {
      it('should change password successfully', async () => {
        const newPassword = 'newpassword';
        const token = 'token';
        const hashedPassword = 'hashedpassword';
        const payload = { email: user.email, sub: 1 };

        (tokenService.verifyToken as jest.Mock).mockResolvedValue({ user });
        (bcrypt.hash as jest.Mock).mockResolvedValue(hashedPassword);
        (userService.resetPassword as jest.Mock).mockResolvedValue(null);
        (jwtService.sign as jest.Mock).mockReturnValue('access_token');

        const result = await service.newPassword(newPassword, token);

        expect(result).toEqual({
          access_token: 'access_token',
          user,
        });
        expect(bcrypt.hash).toHaveBeenCalledWith(newPassword, undefined);
        expect(userService.resetPassword).toHaveBeenCalledWith(
          hashedPassword,
          user.id,
        );
        expect(jwtService.sign).toHaveBeenCalledWith(payload);
      });

      it('should throw BadRequestException on invalid token', async () => {
        const newPassword = 'newpassword';
        const invalidToken = 'invalidtoken';
        (tokenService.verifyToken as jest.Mock).mockRejectedValue(
          new BadRequestException('Invalid token'),
        );

        await expect(
          service.newPassword(newPassword, invalidToken),
        ).rejects.toThrow(BadRequestException);
      });
    });
  });
});
