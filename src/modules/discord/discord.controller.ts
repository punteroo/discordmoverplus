import {
  Body,
  Controller,
  Logger,
  Post,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { DiscordService } from './discord.service';
import { PlayerGuard } from './objects/player.guard';
import { TeamMoveRequestDto } from './objects/teams-move.dto';

@Controller('/sourcemod/teams')
export class DiscordController {
  private readonly logger = new Logger(DiscordController.name);

  constructor(private readonly service: DiscordService) {}

  // The SourceMod plugin will HTTP POST here.
  // I know its unsafe to expose this endpoint :)
  @Post('/')
  @UseGuards(PlayerGuard)
  @UsePipes(new ValidationPipe())
  async moveTeams(
    @Body()
    body: TeamMoveRequestDto,
  ) {
    this.logger.debug(`Received move request: ${JSON.stringify(body)}`);

    // Move the players to their team channels.
    return this.service.movePlayers(body);
  }
}
