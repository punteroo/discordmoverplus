import { Module } from '@nestjs/common';
import { UserModule } from '../user/user.module';
import { DiscordService } from './discord.service';

@Module({
  imports: [UserModule],
  exports: [DiscordService],
  providers: [DiscordService],
})
export class DiscordModule {}
