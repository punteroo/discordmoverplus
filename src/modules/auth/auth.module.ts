import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UserModule } from '../user/user.module';
import { DiscordStrategy } from './objects/discord.strategy';

@Module({
  imports: [UserModule, HttpModule],
  exports: [AuthService],
  controllers: [AuthController],
  providers: [AuthService, DiscordStrategy],
})
export class AuthModule {}
