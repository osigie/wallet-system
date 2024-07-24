import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { generateOtp } from 'src/lib/generate-otp';
import { RedisService } from 'src/redis/redis.service';
import { UserService } from 'src/user/user.service';

@Injectable()
export class TokenService {
  constructor(
    private redisService: RedisService,
    private userService: UserService,
  ) {}
  async generateToken({
    ttl = 1000 * 60 * 60,
    userId,
    prefix,
  }: {
    ttl?: number;
    userId: string;
    prefix: string;
  }) {
    const otp = generateOtp();
    await this.redisService.set(prefix + otp, userId, ttl);
    return otp;
  }

  async verifyToken(prefixToken: string) {
    const userId = await this.redisService.get(prefixToken);
    if (!userId) {
      throw new ConflictException('Token Expired');
    }
    const userNum = Number(userId);
    const user = await this.userService.findUser({ id: userNum });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    delete user['password'];
    delete user['isDisabled'];
    await this.redisService.delete(prefixToken);
    return { user, verification: true };
  }
}
