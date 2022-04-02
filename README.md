# DiscordMover+

Customised system that allows administrators to move players between voice channels for competitive pugging servers on Team Fortress 2.

This is a direct upgrade of [the old DiscordMover](https://github.com/punteroo/DiscordTF2Mover) which was a hassle to install and maintain.

## Installation

For NestJS application

```bash
$ cd /dirofproj/
$ npm install
```

SourceMod plugin is provided with dependencies. Compile with latest SourceMod Compiler.

## Running

```bash
# Run App
$ npm run start

# Run in Development
$ npm run start:dev

# Run in Production
$ npm run start:prod
```

## Configuration

### NestJS App

To modify the app's behaivor always use `config.json` on the root folder.

By default the application runs on the port `7777`.

```js
{
    // MongoDB Connect URI
    "mongoDb": "",

    "sourcemod": {
        // A secret passphrase for the SourceMod plugin to use for communication with the app.
        // This must be the same as the one set in your plugin's ConVars.
        "secret": ""
    },
    
    "discord": {
        // Array of channels where the app will perform movings in.
        // As an example:
        //
        //  You can have a set of waiting, RED & BLU voice channels for 6vs6 pugs, and have another exact same set but for Highlander.
        //  The app will distinguish which is on which set and move users to the "format" corresponding channels.
        "channels": [
            {
                "name": "6vs6",
                "waiting": "954854823604416536",
                "red": "954864057071075398",
                "blu": "954864101782339585"
            }
        ],

        // Discord Application Client ID
        "clientId": "",

        // Discord Application Secret
        "secret": "",

        // Hostname on which this application is being hosted in (without leading /) (Ex: https://yourwebpage.com)
        "host": "",

        // Discord Guild ID of the server the bot will work in.
        "guild": "",

        // Discord Bot User Token
        "token": ""
    },

    "linking": {
        // If true, allows users that re-link their accounts to update the linked Steam account.
        "allowSteamAccountUpdate": false,

        // If true, allows users that re-link their accounts to update their name.
        "allowNameUpdate": true
    }
}
```

### SourceMod (TF2 Server)

Once the plugin is compiled and installed on the server you need to configure some ConVars to have both systems communicate with each other.

Open your `tf/cfg/server.cfg` config file or `tf/cfg/sourcemod/sourcemod.cfg` and add the following ConVars according to your configuration:

```
sm_dmp_uri "http://yourapp.com/sourcemod/teams" // Your NestJS application's hostname with the /sourcemod/teams endpoint (add /sourcemod/teams to your hostname)
sm_dmp_secret "jamesbond007"                    // The secret passphrase defined in the config file. BOTH MUST match.

sm_dmp_cooldown "60.0"                          // Time (in seconds) between being able to run the !move command again on the server.
```

## Usage

On your Team Fortress 2 server, run `sm_move` to send a request for a player move.

There is an optional parameter `waiting` on the `sm_move` command which will move all players back to their corresponding waiting voice channel.

Example:
- `sm_move` - Moves all players to their team channels.
- `sm_move 1` - Moves all players back to their waiting channel.

## Inquiries

Any suggestion is welcome.

If you find an error, bug, exploit or any of the sort be sure to leave a corresponding issue on the repository.
