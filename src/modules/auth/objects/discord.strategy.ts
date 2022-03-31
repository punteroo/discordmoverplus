/*
source: https://gitlab.com/nerd-vision/blogs/nestjs-oauth-discord/-/blob/master/src/auth/discord.strategy.ts
slightly modify to remove deprecations and specific use
*/
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { AuthService } from '../auth.service';
import { Strategy } from 'passport-oauth2';
import { stringify } from 'querystring';
import * as config from '../../../../config.json';

// change these to be your Discord client ID and secret
const clientID = config.discord.clientId;
const clientSecret = config.discord.secret;
const callbackURL = `${config.discord.host}/api/link`;

@Injectable()
export class DiscordStrategy extends PassportStrategy(Strategy, 'discord') {
  constructor(private authService: AuthService, private http: HttpService) {
    super({
      authorizationURL: `https://discordapp.com/api/oauth2/authorize?${stringify(
        {
          client_id: clientID,
          redirect_uri: callbackURL,
          response_type: 'code',
          scope: 'identify connections',
        },
      )}`,
      tokenURL: 'https://discordapp.com/api/oauth2/token',
      scope: 'identify connections',
      clientID,
      clientSecret,
      callbackURL,
    });
  }

  async validate(accessToken: string): Promise<any> {
    const { data: user } = await this.http
        .get('https://discordapp.com/api/users/@me', {
          headers: { Authorization: `Bearer ${accessToken}` },
        })
        .toPromise(),
      { data: connections } = await this.http
        .get('https://discordapp.com/api/users/@me/connections', {
          headers: { Authorization: `Bearer ${accessToken}` },
        })
        .toPromise();

    user['connections'] = connections;
    return this.authService.getUserByDiscord(user);
  }
}
