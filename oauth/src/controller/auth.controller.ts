import { Body, Controller, Get, Post, Query, Req, Res } from '@nestjs/common';
import { AuthService } from 'src/service/auth.service';
import { Response, Request } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body() body: any, @Res() res: Response): Promise<any> {
    const { userId } = await this.authService.signIn(body);
    res.cookie('userId', userId, {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 3,
    });
    res.status(200).send({
      status: 200,
      message: '登录成功',
    });
  }
  @Get('redirect')
  async oauthRedirect(
    @Query() query: { code: string },
    @Res() res: Response,
  ): Promise<any> {
    const result = await this.authService.oauthRedirect(query?.code);
    if (result?.gid) {
      res.cookie('gid', result?.gid, {
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 24 * 1,
      });
    }
    res.status(200).send();
  }

  @Get('userInfo')
  async getUserInfo(@Req() req: Request): Promise<any> {
    const cookies = req.cookies;
    return this.authService.getUserInfo(cookies);
  }

  @Get()
  async getAuth(@Req() req: Request, @Res() res: Response): Promise<any> {
    const cookies = req.cookies;
    console.log(cookies, 'cookies');
    if (Object.keys(cookies).length) {
      res.status(302).json({ redirectUrl: 'http://localhost:3000', cookies });
      return res.send();
    }
    return res.send({
      status: 200,
    });
  }

  @Get('logout')
  async logout(@Res() res: Response): Promise<any> {
    res.clearCookie('userId');
    res.clearCookie('gid');
    res.status(200).send({
      message: 'logout success',
    });
  }
}
