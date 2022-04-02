#include <sourcemod>
#include <sdktools>

#include <tf2>
#include <tf2_stocks>

#include <system2>
#include <json>

#pragma semicolon 1
#pragma newdecls required

#define PLUGIN_VERSION "1.0.0"

public Plugin myinfo = 
{
	name = "[TF2] DiscordMover+",
	author = "Lucas 'puntero' Maza",
	description = "Moves players in Discord to their respective pre-configured team-channels.",
	version = PLUGIN_VERSION,
	url = "https://github.com/punteroo"
};

ConVar CV_URI, CV_Timeout, CV_Secret;
Handle gTimer = INVALID_HANDLE;

// ampere i hate you

public void OnPluginStart()
{
	CreateConVar("sm_discordmoverplus_version", PLUGIN_VERSION, "Standard plugin version ConVar. Please don't change me!", FCVAR_REPLICATED|FCVAR_NOTIFY|FCVAR_DONTRECORD);
	
	CV_URI = CreateConVar("sm_dmp_uri", "", "The URI to make the POST request with moving information.");
	CV_Timeout = CreateConVar("sm_dmp_cooldown", "60.0", "Time (in seconds) for the cooldown timer before requesting another move.", _, true, 1.0);
	CV_Secret = CreateConVar("sm_dmp_secret", "", "Secret passphrase to authenticate the plugin with the application.", FCVAR_PROTECTED);
	
	RegAdminCmd("sm_move", CMD_MoveTeams, ADMFLAG_GENERIC, "Sends a request to move the players to their teams. Optional Arguments: [waiting = 1|0]");
}

public Action CMD_MoveTeams(int client, int args) {
	if (gTimer != INVALID_HANDLE) {
		ReplyToCommand(client, "[DM+] The cooldown hasn't expired yet! Wait before asking for another move.");
		return Plugin_Handled;
	}
	
	// If an argument was passed, then we move back to waiting channels.
	bool waiting = (args > 0);
	
	// If the timer is inactive, process the request.
	System2HTTPRequest req = CreateRequest(waiting);
	
	req.POST();
	ReplyToCommand(client, "[DM+] Request to move players has been sent!%s Waiting...", waiting ? " Moving to Waiting Channel again." : "");
	
	return Plugin_Handled;
}

System2HTTPRequest CreateRequest(bool backToWaiting = false) {
	// Instance the HTTP request
	char uri[128];
	CV_URI.GetString(uri, sizeof(uri));
	
	System2HTTPRequest req = new System2HTTPRequest(OnResponse, uri);
	
	// Generate a JSON with the player list currently connected.
	JSON_Object data = new JSON_Object();
	JSON_Array players = new JSON_Array();
	
	for (int i = 1; i <= MaxClients; i++) {
		// Valid player?
		if (IsClientInGame(i) && !IsFakeClient(i) && IsClientConnected(i)) {
			// Get their team (must be RED or BLU)
			TFTeam team = TF2_GetClientTeam(i);
			
			if (team > TFTeam_Spectator) {
				// Create player object
				JSON_Object player = new JSON_Object();
				
				// Get Steam64 ID
				char steamId[64];
				GetClientAuthId(i, AuthId_SteamID64, steamId, sizeof(steamId));
				
				player.SetString("steam", steamId);
				player.SetString("team", backToWaiting ? "waiting" : (team == TFTeam_Red ? "red" : "blu"));
				
				players.PushObject(player);
			}
		}
	}
	
	// Set the JSON for the body request.
	data.SetObject("players", players);
	
	// Prepare the request.
	char body[4080];
	data.Encode(body, sizeof(body), JSON_ENCODE_PRETTY);
	
	req.SetData(body);
	
	// Memory cleanup
	data.Cleanup();
	
	char secret[512];
	CV_Secret.GetString(secret, sizeof(secret));
	
	req.SetHeader("Authorization", "Bearer %s", secret);
	req.SetHeader("Accept", "application/json");
	req.SetHeader("Content-Type", "application/json");
	
	return req;
}

/**
  * Called when the HTTP request has been finished. This indicates the system is doing its job (or an error ocurred on the backend)
  */
void OnResponse(bool success, const char[] error, System2HTTPRequest request, System2HTTPResponse response, HTTPRequestMethod method) {
	// Get response data
	char data[512];
	response.GetContent(data, sizeof(data));
		
	if (!success) {
		PrintToChatAll("[DM+] Request for player moving has failed. Check RCON for details.");
		LogError("[DM+] Request for moving players has failed: %s", data);
	}
	
	// Enforce timer cooldown
	char cTime[24];
	CV_Timeout.GetString(cTime, sizeof(cTime));
	
	float cooldown = StringToFloat(cTime);
	gTimer = CreateTimer(cooldown, OnEndCooldown);
}

public Action OnEndCooldown(Handle timer, any data) {
	gTimer = INVALID_HANDLE;
	
	return Plugin_Handled;
}
