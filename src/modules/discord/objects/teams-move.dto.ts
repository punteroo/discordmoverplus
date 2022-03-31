import { IsArray } from 'class-validator';
import { PlayerRequest } from './player.interface';

export class TeamMoveRequestDto {
  // Array of player objects.
  @IsArray()
  players: PlayerRequest[];
}
