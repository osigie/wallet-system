import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { BaseResponseDto } from 'src/common/dto/base-response-dto';
import { LoginUserDto } from './dto/login-user.dto';
import { CreateUserDto } from './dto/create-user-dto';
import { ResetPasswordDto } from './dto/reset-password-dto';
import { NewPasswordDto } from './dto/new-password-dto';
import { BadRequestException, HttpStatus } from '@nestjs/common';
import { createUserDto, user } from 'src/common/utils/test-utils';

// Create a mock AuthService with Jest
const mockAuthService = {
  login: jest.fn(),
  register: jest.fn(),
  resetPassword: jest.fn(),
  newPassword: jest.fn(),
};

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: mockAuthService }],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('login', () => {
    it('should return login successful response', async () => {
      const loginDto: LoginUserDto = {
        email: 'john@example.com',
        password: 'password',
      };
      const result = { access_token: 'token', user: user };
      jest.spyOn(authService, 'login').mockResolvedValue(result);

      const response = await controller.login(loginDto);

      const data = {
        ...result,
      };
      expect(response).toEqual(
        new BaseResponseDto('Login successful', HttpStatus.OK, data),
      );
      expect(authService.login).toHaveBeenCalledWith(loginDto);
    });

    it('should handle login failure', async () => {
      const loginDto: LoginUserDto = {
        email: 'john@example.com',
        password: 'password',
      };
      jest
        .spyOn(authService, 'login')
        .mockRejectedValue(new BadRequestException('Invalid credentials'));

      await expect(controller.login(loginDto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('register', () => {
    it('should return registration successful response', async () => {
      jest.spyOn(authService, 'register').mockResolvedValue({ user });

      const response = await controller.register(createUserDto);

      expect(response).toEqual(
        new BaseResponseDto(
          'Account created successfully',
          HttpStatus.CREATED,
          { user },
        ),
      );
      expect(authService.register).toHaveBeenCalledWith(createUserDto);
    });

    it('should handle registration failure', async () => {
      const createUserDto: CreateUserDto = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        password: 'password',
        state: 'NY',
        sex: 'M',
        maritalStatus: 'Single',
        address: '123 Main St',
      };
      jest
        .spyOn(authService, 'register')
        .mockRejectedValue(new BadRequestException('Email already registered'));

      await expect(controller.register(createUserDto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('resetPassword', () => {
    it('should return reset password successful response', async () => {
      const resetPasswordDto: ResetPasswordDto = { email: 'john@example.com' };
      const result = undefined;
      jest.spyOn(authService, 'resetPassword').mockResolvedValue(result);

      const response = await controller.resetPassword(resetPasswordDto);

      expect(response).toEqual(
        new BaseResponseDto('Mail sent successfully', HttpStatus.OK, result),
      );
      expect(authService.resetPassword).toHaveBeenCalledWith(
        resetPasswordDto.email,
      );
    });

    it('should handle reset password failure', async () => {
      const resetPasswordDto: ResetPasswordDto = { email: 'john@example.com' };
      jest
        .spyOn(authService, 'resetPassword')
        .mockRejectedValue(new BadRequestException('User not found'));

      await expect(controller.resetPassword(resetPasswordDto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('changePassword', () => {
    it('should return change password successful response', async () => {
      const newPasswordDto: NewPasswordDto = {
        newPassword: 'newpassword',
        token: 'token',
      };
      const result = { access_token: 'token', user };
      jest.spyOn(authService, 'newPassword').mockResolvedValue(result);

      const response = await controller.changePassword(newPasswordDto);

      expect(response).toEqual(
        new BaseResponseDto(
          'Password changed successfully',
          HttpStatus.OK,
          result,
        ),
      );
      expect(authService.newPassword).toHaveBeenCalledWith(
        newPasswordDto.newPassword,
        newPasswordDto.token,
      );
    });

    it('should handle change password failure', async () => {
      const newPasswordDto: NewPasswordDto = {
        newPassword: 'short',
        token: 'token',
      };
      jest
        .spyOn(authService, 'newPassword')
        .mockRejectedValue(
          new BadRequestException('Password must be at least 5 characters'),
        );

      await expect(controller.changePassword(newPasswordDto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });
});
