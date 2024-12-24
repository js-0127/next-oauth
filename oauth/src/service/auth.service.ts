import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { JwtService } from '@nestjs/jwt';
import { InjectRedis } from '@nestjs-modules/ioredis';
import IoRedis from 'ioredis';
import axios from 'axios';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    @InjectRedis() private readonly redis: IoRedis,
  ) {}
  async signIn(loginParam: any) {
    const { email } = loginParam;

    const loginUser = await this.prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (!loginUser) {
      const user = await this.prisma.user.create({
        data: {
          email,
        },
      });
      return this.setJwtToken(user.id);
    }
    return this.setJwtToken(loginUser.id);
  }

  async oauthRedirect(code: string) {
    try {
      const tokenResponse = await axios({
        method: 'post',
        url: `https://gitee.com/oauth/token?grant_type=authorization_code&code=${code}&client_id=${process.env.CLIENT_ID}&client_secret=${process.env.CLIENT_SECRET}&redirect_uri=${process.env.REDIRECT_URL}`,
        headers: {
          accept: 'application/json',
        },
        data: {
          client_secret: process.env.CLIENT_SECRET,
        },
      });
      console.log(tokenResponse, 'data');
      const accessToken = tokenResponse.data.access_token;
      const result = await axios({
        method: 'get',
        url: `https://gitee.com/api/v5/user?access_token=${accessToken}`,
        headers: {
          accept: 'application/json',
        },
      });
      const userInfo = result.data;
      const userId = userInfo.id;
      this.redis
        .multi()
        .set(`gid:${userId}`, accessToken)
        .expire(`gid:${userId}`, 60 * 60 * 24 * 3)
        .exec();

      const user = await this.prisma.user.findUnique({
        where: {
          id: userId,
        },
      });
      if (!user) {
        await this.prisma.user.create({
          data: {
            id: userId,
            email: userInfo?.email,
            userName: userInfo?.login,
            avatar: userInfo?.avatar_url,
            nickName: userInfo?.name,
          },
        });
      } else {
        await this.prisma.user.update({
          where: {
            id: userId,
          },
          data: {
            email: userInfo?.email,
            userName: userInfo?.login,
            avatar: userInfo?.avatar_url,
            nickName: userInfo?.name,
          },
        });
      }
      return {
        gid: userId,
      };
    } catch (error) {
      console.log(error, 'error');
    }
  }

  async getUserInfo(cookies: any) {
    const { userId, gid } = cookies;
    const user = await this.prisma.user.findUnique({
      where: {
        id: Number(userId) || Number(gid),
      },
    });
    return {
      user,
    };
  }

  async setJwtToken(userId: number) {
    const payload = { sub: userId };
    const access_token = await this.jwtService.signAsync(payload, {
      secret: process.env.ACCESS_TOKEN_SECRET,
    });
    this.redis
      .multi()
      .set(`userId:${userId}`, access_token)
      .expire(`userId:${userId}`, 60 * 60 * 24 * 3)
      .exec();

    return {
      userId: userId,
    };
  }
}