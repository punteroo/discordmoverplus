export interface PlayerRequest {
  // The Player's Steam64 ID
  steam: string;

  // The player's assigned team name (must be red or blu)
  team: 'red' | 'blu' | 'waiting';
}
