import { forwardRef, Inject } from '@nestjs/common';
import { User } from '../user/user.model';
import { UserService } from '../user/user.service';

export class AuthService {
  constructor(
    @Inject(forwardRef(() => UserService))
    private readonly userService: UserService,
  ) {}

  /**
   * Finds an user from their Discord ID and returns a formatted JSON response for API consumption.
   * If the user is not present, they will be added to the database.
   * @param user The User information from Discord's OAuth.
   * @returns The user's linked information if found, else an error JSON.
   */
  async getUserByDiscord(user: any): Promise<User> {
    return await this.userService.findUserById(user, 'discord');
  }
}
