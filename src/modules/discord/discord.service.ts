import { forwardRef, Inject, Logger } from '@nestjs/common';
import { Guild, GuildMember, Intents } from 'discord.js';
import { Client } from 'discordx';

import * as config from '../../../config.json';
import { UserService } from '../user/user.service';
import { TeamMoveRequestDto } from './objects/teams-move.dto';

export class DiscordService {
  private readonly logger: Logger = new Logger(DiscordService.name);
  private bot: Client;

  constructor(
    @Inject(forwardRef(() => UserService))
    private readonly userService: UserService,
  ) {
    this.run();
  }

  /**
   * Parses the move request to start moving players to their team channels.
   * @param moveRequest The move request to parse.
   * @noreturn
   */
  async movePlayers(moveRequest: TeamMoveRequestDto) {
    try {
      // Get the guild the bot is in.
      const guild: Guild = await this.bot.guilds.fetch(config.discord.guild);

      // Loop players to read their information.
      for (const player of moveRequest.players) {
        // Get the Discord ID for this user. If not present, we cannot move them.
        const { discord } = await this.userService.findUserById(
          player.steam,
          'steam',
        );

        if (!discord) {
          this.logger.warn(
            `Player ${player.steam} skipped due to not having linked accounts.`,
          );
        }

        const user = (await guild.members.fetch(discord)) as GuildMember;

        // Find their waiting channel
        const wC = config.discord.channels.find(
          (c) =>
            c.waiting === user.voice.channel.id ||
            c.blu === user.voice.channel.id ||
            c.red === user.voice.channel.id,
        );

        // Move them to their correct channel.
        // Delay of a second and 25ms to prevent rate limiting.
        setTimeout(async () => {
          if (wC[player.team] === user.voice.channel.id) return;

          await user.voice.setChannel(wC[player.team]);

          this.logger.log(
            `Moved player ${user.user.username} to channel ${wC[player.team]}.`,
          );
        }, 1250);
      }
    } catch (e) {
      this.logger.error(`Failed to move players: ${e}`);
      return {
        error: 401,
        message: `Internal server error.`,
      };
    }
  }

  /**
   * Executes the Discord bot and initializes the client instance.
   * @noparams
   * @noreturn
   */
  async run() {
    // Our Discord client requires to know the guild they're in, the members in it and the voice states to move players around.
    // Make sure to enable these intents on your Discord bot application page.
    // Regardless of permissions.
    this.bot = new Client({
      intents: [
        Intents.FLAGS.GUILDS,
        Intents.FLAGS.GUILD_MEMBERS,
        Intents.FLAGS.GUILD_VOICE_STATES,
      ],
      botGuilds: [config.discord.guild],
    });

    /**
     * On READY (Bot is logged in)
     */
    this.bot.once('ready', async () => {
      this.logger.log(
        `Successfully authenticated client as ${this.bot.user.username}#${this.bot.user.discriminator}`,
      );
    });

    try {
      await this.bot.login(config.discord.token);
    } catch (e) {
      this.logger.error(`Failed to authenticate Discord client: ${e}`);
    }
  }
}
