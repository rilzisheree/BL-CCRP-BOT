"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const discord_js_1 = require("discord.js");
const purge_1 = __importDefault(require("./commands/purge"));
const say_1 = __importDefault(require("./commands/say"));
const serverlist_1 = __importDefault(require("./commands/serverlist"));
const globalban_1 = __importDefault(require("./commands/globalban"));
const unglobalban_1 = __importDefault(require("./commands/unglobalban"));
const globalbanlist_1 = __importDefault(require("./commands/globalbanlist"));
const setlogchannel_1 = __importDefault(require("./commands/setlogchannel"));
const dm_1 = __importDefault(require("./commands/dm"));
const allowuser_1 = __importDefault(require("./commands/allowuser"));
const commands = [
    purge_1.default,
    say_1.default,
    serverlist_1.default,
    globalban_1.default,
    unglobalban_1.default,
    globalbanlist_1.default,
    setlogchannel_1.default,
    dm_1.default,
    allowuser_1.default,
].map((cmd) => cmd.data.toJSON());
const token = process.env.DISCORD_TOKEN;
const clientId = process.env.CLIENT_ID;
if (!token)
    throw new Error("DISCORD_TOKEN is not set in .env");
if (!clientId)
    throw new Error("CLIENT_ID is not set in .env");
const rest = new discord_js_1.REST().setToken(token);
(async () => {
    try {
        console.log(`[Deploy] Registering ${commands.length} application (/) commands globally...`);
        const data = await rest.put(discord_js_1.Routes.applicationCommands(clientId), { body: commands });
        console.log(`[Deploy] ✅ Successfully registered ${data.length} commands globally.`);
        console.log("[Deploy] Note: Global commands may take up to 1 hour to appear in Discord.");
        console.log("[Deploy] Commands registered:");
        for (const cmd of data) {
            console.log(`  /${cmd.name}`);
        }
    }
    catch (err) {
        console.error("[Deploy] Failed to register commands:", err);
        process.exit(1);
    }
})();
//# sourceMappingURL=deploy-commands.js.map