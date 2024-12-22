import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { JwtService } from '@nestjs/jwt';
import { InjectRedis } from '@nestjs-modules/ioredis';
import IoRedis from 'ioredis';
import { Response } from 'express';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    @InjectRedis() private readonly redis: IoRedis,
  ) {}
  async signIn(loginParam: any, res: Response) {
    const { email } = loginParam;
    const user = await this.prisma.user.create({
      data: {
        email,
      },
    });
    const payload = { sub: user.id };
    const access_token = await this.jwtService.signAsync(payload, {
      secret: process.env.ACCESS_TOKEN_SECRET,
    });
    this.redis
      .multi()
      .set(`userId:${user.id}`, access_token)
      .expire(`userId:${user.id}`, 60 * 60 * 24 * 3)
      .exec();
    res.cookie('userId', user.id, {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 3,
    });
    res.send({
      status: 200,
      message: '登录成功',
    });
  }
}
