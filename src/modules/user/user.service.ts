import { User } from './user.model';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { ForbiddenException, Injectable } from '@nestjs/common';
import { linking } from '../../../config.json';

@Injectable()
export class UserService {
  constructor(@InjectModel(User.name) private readonly user: Model<User>) {}

  /**
   * Finds one user.
   * @param user The User object (or their ID)
   * @param type The type of ID we're searching for.
   * @returns The User document if found.
   */
  async findUserById(
    user: string | any,
    type: 'discord' | 'steam',
  ): Promise<User> {
    let u: any = await this.user.findOne({
      [type]: user.id === undefined ? user : user.id,
    });

    // If no user is found, create one.
    if (!u && !(user instanceof String))
      u = (await this.resolveUser(user)) as User;

    // Remove the _id parameter from the user object.
    const res = u.toObject();
    delete res?._id;
    delete res?.__v;

    return res ?? null;
  }

  /**
   * Resolves a User object to create a new one / update an existing one.
   * @param user The User object.
   * @returns The updated/new User document.
   */
  async resolveUser(user: any): Promise<User> {
    // Find this user in our DB to update them if not found.
    let u = await this.user.findOne({
      discord: user.id,
    });

    // If not found, create one.
    if (!u) {
      // If no Steam account was found, throw the error.
      const steam = user?.connections?.find((c) => c.type === 'steam');
      if (!steam)
        throw new ForbiddenException({
          status: 404,
          error: `No Steam account has been found linked to this Discord account.`,
        });

      // Create the new user.
      // Remove non ASCII so we don't have some nasty problems.
      u = new this.user({
        discord: user.id,
        steam: steam.id,
        linkedAt: new Date(),
        updated: new Date(),
        name: user.username.replace(/[^\x00-\x7F]/g, ''),
      });

      // Return the new user
      return await u.save();
    }

    // Update the current one if any modifications are present, else just return the old document.
    if (u.name !== user.username && linking.allowNameUpdate) {
      u.name = user.username;
      u.markModified('name');
    }
    if (u.steam !== user.steam && linking.allowSteamAccountUpdate) {
      u.steam = user.steam;
      u.markModified('steam');
    }

    if (u.isModified(['name', 'steam'])) u.updated = new Date();

    return await u.save();
  }
}
