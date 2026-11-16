import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Request, Response } from 'express';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class UserGuard implements CanActivate {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const response = context.switchToHttp().getResponse<Response>();
    const request = context.switchToHttp().getRequest<Request>();
    const userInit = response.locals.initData;
    if(!userInit) throw new UnauthorizedException();
    try {
      let user = await this.prisma.user.findUnique({
        where: {
          telegram_id: String(userInit.user.id)
        }
      });
      if (!user && userInit?.user?.id) {
        user = await this.prisma.user.create({
          data: {
            telegram_id: String(userInit.user.id),
            name: userInit.user.firstName || 'User',
            username: userInit.user.username || null,
            language_code: userInit.user.languageCode || 'en',
          },
        });
      }
      if(!user) throw new UnauthorizedException();
      request['user'] = user;
    } catch {
      throw new UnauthorizedException();
    }
    return true;
  }
}
