import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { AppController } from './controller/app.controller';
import { AppService } from './service/app.service';
import { PrismaService } from './service/prisma.service';
import { AuthController } from './controller/auth.controller';
import { AuthService } from './service/auth.service';
import { JwtService } from '@nestjs/jwt';
import { RedisModule } from '@nestjs-modules/ioredis';
import { AuthMiddleware } from './middleware/auth.middleware';

@Module({
  imports: [
    RedisModule.forRoot({
      type: 'single',
      url: process.env.REDIS_URL,
    }),
  ],
  controllers: [AppController, AuthController],
  providers: [AppService, PrismaService, AuthService, JwtService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AuthMiddleware)
      .exclude({ path: '/auth/login', method: RequestMethod.ALL })
      .forRoutes({ path: '*', method: RequestMethod.ALL });
  }
}
