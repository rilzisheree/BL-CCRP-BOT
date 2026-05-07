"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const discord_js_1 = require("discord.js");
const database_1 = require("./utils/database");
const colors_1 = require("./utils/colors");
const purge_1 = __importDefault(require("./commands/purge"));
const say_1 = __importDefault(require("./commands/say"));
const serverlist_1 = __importDefault(require("./commands/serverlist"));
const globalban_1 = __importDefault(require("./commands/globalban"));
const unglobalban_1 = __importDefault(require("./commands/unglobalban"));
const globalbanlist_1 = __importDefault(require("./commands/globalbanlist"));
const setlogchannel_1 = __importDefault(require("./commands/setlogchannel"));
const dm_1 = __importDefault(require("./commands/dm"));
const allowuser_1 = __importDefault(require("./commands/allowuser"));
const ready_1 = __importDefault(require("./events/ready"));
const messageDelete_1 = __importDefault(require("./events/messageDelete"));
const messageUpdate_1 = __importDefault(require("./events/messageUpdate"));
const guildMemberAdd_1 = __importDefault(require("./events/guildMemberAdd"));
const client = new discord_js_1.Client({
    intents: [
        discord_js_1.GatewayIntentBits.Guilds,
        discord_js_1.GatewayIntentBits.GuildMessages,
        discord_js_1.GatewayIntentBits.GuildMembers,
        discord_js_1.GatewayIntentBits.MessageContent,
        discord_js_1.GatewayIntentBits.DirectMessages,
    ],
    partials: [discord_js_1.Partials.Message, discord_js_1.Partials.Channel, discord_js_1.Partials.GuildMember],
});
const commands = new discord_js_1.Collection();
const allCommands = [
    purge_1.default,
    say_1.default,
    serverlist_1.default,
    globalban_1.default,
    unglobalban_1.default,
    globalbanlist_1.default,
    setlogchannel_1.default,
    dm_1.default,
    allowuser_1.default,
];
for (const cmd of allCommands) {
    commands.set(cmd.data.name, cmd);
}
(0, ready_1.default)(client);
(0, messageDelete_1.default)(client);
(0, messageUpdate_1.default)(client);
(0, guildMemberAdd_1.default)(client);
client.on(discord_js_1.Events.InteractionCreate, async (interaction) => {
    if (!interaction.isChatInputCommand())
        return;
    const command = commands.get(interaction.commandName);
    if (!command)
        return;
    try {
        await command.execute(interaction, client);
    }
    catch (err) {
        console.error(`[Bot] Error executing /${interaction.commandName}:`, err);
        const errEmbed = new discord_js_1.EmbedBuilder()
            .setColor(colors_1.RED)
            .setDescription(`❌ An error occurred while executing this command.\n\`\`\`${err.message}\`\`\``);
        try {
            if (interaction.replied || interaction.deferred) {
                await interaction.followUp({ embeds: [errEmbed], ephemeral: true });
            }
            else {
                await interaction.reply({ embeds: [errEmbed], ephemeral: true });
            }
        }
        catch { }
    }
});
async function main() {
    const token = process.env.DISCORD_TOKEN;
    if (!token)
        throw new Error("DISCORD_TOKEN environment variable is not set.");
    await (0, database_1.connectDatabase)();
    await client.login(token);
}
main().catch((err) => {
    console.error("[Bot] Fatal startup error:", err);
    process.exit(1);
});
//# sourceMappingURL=index.js.map