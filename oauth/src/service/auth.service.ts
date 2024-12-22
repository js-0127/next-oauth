import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { JwtService } from '@nestjs/jwt';
import { InjectRedis } from '@nestjs-modules/ioredis';
import IoRedis from 'ioredis';
import { Response } from 'express';
import axios from 'axios';

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

  async oauthRedirect(code: string, res: Response) {
    console.log(code);

    const tokenResponse = await axios({
      method: 'post',
      url:
        'https://github.com/login/oauth/access_token?' +
        `client_id=${'Ov23li9D4HB48T32pxI9'}&` +
        `client_secret=${'d192c5308379781d18d3cb48a6d0f704346bf5ab'}&` +
        `code=${code}`,
      headers: {
        accept: 'application/json',
      },
    });
    const accessToken = tokenResponse.data.access_token;
    const result = await axios({
      method: 'get',
      url: `https://api.github.com/user`,
      headers: {
        accept: 'application/json',
        Authorization: `token ${accessToken}`,
      },
    });
    const userInfo = result.data;
    const userId = result.data.id;
    this.redis
      .multi()
      .set(`gid:${userId}`, accessToken)
      .expire(`gid:${userId}`, 60 * 60 * 24 * 3)
      .exec();
    res.cookie('gid', userId, {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 3,
    });

    return userInfo;
  }
}
