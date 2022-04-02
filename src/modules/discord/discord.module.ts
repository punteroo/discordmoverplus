import { Module } from '@nestjs/common';
import { UserModule } from '../user/user.module';
import { DiscordController } from './discord.controller';
import { DiscordService } from './discord.service';

@Module({
  imports: [UserModule],
  exports: [DiscordService],
  controllers: [DiscordController],
  providers: [DiscordService],
})
export class DiscordModule {}
