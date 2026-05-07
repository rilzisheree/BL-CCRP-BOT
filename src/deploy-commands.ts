import "dotenv/config";
import { REST, Routes } from "discord.js";

import purge from "./commands/purge";
import say from "./commands/say";
import serverlist from "./commands/serverlist";
import globalban from "./commands/globalban";
import unglobalban from "./commands/unglobalban";
import globalbanlist from "./commands/globalbanlist";
import setlogchannel from "./commands/setlogchannel";
import dm from "./commands/dm";
import allowuser from "./commands/allowuser";

const commands = [
  purge,
  say,
  serverlist,
  globalban,
  unglobalban,
  globalbanlist,
  setlogchannel,
  dm,
  allowuser,
].map((cmd) => cmd.data.toJSON());

const token = process.env.DISCORD_TOKEN;
const clientId = process.env.CLIENT_ID;

if (!token) throw new Error("DISCORD_TOKEN is not set in .env");
if (!clientId) throw new Error("CLIENT_ID is not set in .env");

const rest = new REST().setToken(token);

(async () => {
  try {
    console.log(`[Deploy] Registering ${commands.length} application (/) commands globally...`);

    const data = await rest.put(Routes.applicationCommands(clientId), { body: commands }) as any[];

    console.log(`[Deploy] ✅ Successfully registered ${data.length} commands globally.`);
    console.log("[Deploy] Note: Global commands may take up to 1 hour to appear in Discord.");
    console.log("[Deploy] Commands registered:");
    for (const cmd of data) {
      console.log(`  /${cmd.name}`);
    }
  } catch (err) {
    console.error("[Deploy] Failed to register commands:", err);
    process.exit(1);
  }
})();
