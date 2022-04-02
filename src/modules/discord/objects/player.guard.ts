import {
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import * as config from '../../../../config.json';

export class PlayerGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Get provided secret
    const secret = context.switchToHttp().getRequest().headers.authorization;

    if (secret.split(' ')[1] !== config.sourcemod.secret)
      throw new UnauthorizedException('Invalid authorization secret / Missing');

    return true;
  }
}
