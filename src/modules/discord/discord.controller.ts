import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { DiscordService } from './discord.service';
import { PlayerGuard } from './objects/player.guard';
import { TeamMoveRequestDto } from './objects/teams-move.dto';

@Controller('/sourcemod/teams')
export class DiscordController {
  constructor(private readonly service: DiscordService) {}

  // The SourceMod plugin will HTTP POST here.
  // I know its unsafe to expose this endpoint :)
  @Post('/')
  @UseGuards(PlayerGuard)
  async moveTeams(
    @Req()
    req,
    @Body()
    body: TeamMoveRequestDto,
  ) {
    // Move the players to their team channels.
    this.service.movePlayers(body);
  }
}
