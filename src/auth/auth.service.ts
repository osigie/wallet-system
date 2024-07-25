import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UserService } from 'src/user/user.service';
import { LoginUserDto } from './dto/login-user.dto';
import { CreateUserDto } from './dto/create-user-dto';

import { TokenService } from 'src/token/token.service';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { otpResetPasswordTemplate } from 'src/providers/mail/templates/otp-reset-password-template';
import {
  FORGET_PASSWORD_PREFIX,
  resetPasswordQueue,
} from 'src/configs/constant';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private userService: UserService,
    private tokenService: TokenService,
    @InjectQueue(resetPasswordQueue) private mailQueue: Queue,
    private configService: ConfigService,
  ) {}

  logger = new Logger('AuthLogger');

  async login(user: LoginUserDto) {
    try {
      const userFromDb = await this.userService.findUser({ email: user.email });

      if (!userFromDb) {
        throw new BadRequestException(' Invalid credentials');
      }

      const compare = await AuthService.comparePassword(
        user.password,
        userFromDb.password,
      );

      if (user && compare) {
        delete userFromDb['password'];
        delete userFromDb['isDisabled'];
        const payload = { email: user.email, sub: userFromDb.id };
        this.logger.log('Login successful {}');
        return {
          access_token: this.jwtService.sign(payload),
          user: userFromDb,
        };
      }
      throw new BadRequestException('Invalid credentials');
    } catch (error) {
      this.logger.error('Login failed', error.stack);
      throw error;
    }
  }

  async register(user: CreateUserDto) {
    try {
      const userFromDb = await this.userService.findUser({ email: user.email });
      if (userFromDb) {
        throw new BadRequestException('Email already registered');
      }
      const hashedPassword = await AuthService.hashPassword(
        user.password,
        this.configService.get('GEN_SALT'),
      );
      const savedUser = await this.userService.createUser({
        data: {
          password: hashedPassword,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          userDetails: {
            create: {
              state: user.state,
              sex: user.sex,
              maritalStatus: user.maritalStatus,
              address: user.address,
            },
          },
          accounts: {
            create: [{}],
          },
        },
      });
      delete savedUser['password'];
      delete savedUser['isDisabled'];
      this.logger.log('Registration successful {}');
      return { user: savedUser };
    } catch (error) {
      this.logger.error('Registration failed', error.stack);
      throw error;
    }
  }

  async resetPassword(email: string) {
    try {
      const user = await this.userService.findUser({ email });
      if (!user) {
        throw new NotFoundException('User not found');
      }

      const token = await this.tokenService.generateToken({
        prefix: FORGET_PASSWORD_PREFIX,
        userId: String(user.id),
      });

      await this.mailQueue.add(
        {
          to: email,
          from: this.configService.get('EMAIL_FROM_ADDRESS'),
          subject: 'Reset Password',
          html: otpResetPasswordTemplate(
            `${user.firstName}  ${user.lastName}`,
            token,
            FORGET_PASSWORD_PREFIX + token,
            this.configService.get('EMAIL_FROM_NAME'),
          ),
        },
        { priority: 1 },
      );
      this.logger.log('Mail sent {}');
      return token;
    } catch (error) {
      this.logger.error('Password reset failed', error.stack);
      throw error;
    }
  }

  async newPassword(newPassword: string, token: string) {
    try {
      if (newPassword.length < 5) {
        throw new BadRequestException('Password must be at least 5 characters');
      }

      const { user } = await this.tokenService.verifyToken(
        FORGET_PASSWORD_PREFIX + token,
      );

      const hashedPassword = await AuthService.hashPassword(
        newPassword,
        this.configService.get('SALT'),
      );
      await this.userService.resetPassword(hashedPassword, user.id);

      const payload = { email: user.email, sub: user.id };
      delete user['password'];
      delete user['isDisabled'];
      this.logger.log('Password changed {}');
      return {
        access_token: this.jwtService.sign(payload),
        user: user,
      };
    } catch (error) {
      this.logger.error('Password update failed', error.stack);
      throw error;
    }
  }

  private static async hashPassword(
    password: string,
    saltNumber: number,
  ): Promise<string> {
    const salt = await bcrypt.genSalt(saltNumber);
    return await bcrypt.hash(password, salt);
  }
  /*
   * Compare Password
   * */
  private static async comparePassword(
    password: string,
    hash: string,
  ): Promise<boolean> {
    return await bcrypt.compare(password, hash);
  }
}
