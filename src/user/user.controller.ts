import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { JwtGuard } from '../auth/guard/jwt.guard';
import { UserService } from './user.service';
import { User } from './user.decorator';

@Controller('users')
export class UserController {
  constructor(private userService: UserService) {}

  @UseGuards(JwtGuard)
  @Get('me')
  getMe(@Req() req: Request) {
    return req.user;
  }

  @Get(':user/orders')
  getUserOrders(@User('userId') userId: string) {
    return this.userService.getUserOrders(userId);
  }
}
