import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { DiscordModule } from './discord/discord.module';
import { UserModule } from './user/user.module';

@Module({
  imports: [AuthModule, DiscordModule, UserModule],
})
export class ApiModule {}
