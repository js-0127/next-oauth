import { InjectRedis } from '@nestjs-modules/ioredis';
import { Injectable, NestMiddleware } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request, Response } from 'express';
import IoRedis from 'ioredis';
@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(
    @InjectRedis() private readonly redis: IoRedis,
    private readonly jwtService: JwtService,
  ) {}
  async use(req: Request, res: Response, next: () => void) {
    const cookies = req.cookies;
    const { userId = '', gid } = cookies;
    const accessToken = await this.redis.get(`userId:${userId}`);
    if (accessToken) {
      const new_access_token = await this.jwtService.signAsync(
        { userId },
        {
          secret: process.env.ACCESS_TOKEN_SECRET,
        },
      );
      this.redis
        .multi()
        .set(`userId:${userId}`, new_access_token)
        .expire(`userId:${userId}`, 60 * 60 * 24 * 3)
        .exec();

      res.cookie('userId', userId, {
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 24 * 3,
      });
      next();
    } else if (gid) {
      const githubAccessToken = await this.redis.get(
        `gid:${gid}`,
      );
      if (githubAccessToken) {
        next();
      }
    } else {
      //这里会有跨域错误，不能直接重定向
      res.setHeader('Access-Control-Allow-Credentials', 'true');
      res.status(302).json({ redirectUrl: 'http://localhost:3000/login' });
      return res.send();
    }
  }
}
