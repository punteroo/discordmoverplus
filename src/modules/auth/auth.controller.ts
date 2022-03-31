import { Controller, Get, Req } from '@nestjs/common';
import { UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { User } from '../user/user.model';

@Controller('/api/link')
export class AuthController {
  // GET /
  // Open the OAuth URI for the user to link their Discord account to our system.
  @Get('/')
  @UseGuards(AuthGuard('discord'))
  oauth(@Req() req): Promise<User> {
    return req.user;
  }
}
