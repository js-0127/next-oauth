import { Body, Controller, Get, Post, Query, Res } from '@nestjs/common';
import { AuthService } from 'src/service/auth.service';
import { Response } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body() body: any, @Res() res: Response): Promise<any> {
    return this.authService.signIn(body, res);
  }
  @Get('redirect')
  async oauthRedirect(
    @Query() query: { code: string },
    @Res() res: Response,
  ): Promise<any> {
    return this.authService.oauthRedirect(query?.code, res);
  }
}
