"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = register;
const discord_js_1 = require("discord.js");
const GlobalBan_1 = __importDefault(require("../models/GlobalBan"));
const globalLogger_1 = require("../utils/globalLogger");
const colors_1 = require("../utils/colors");
function register(client) {
    client.on(discord_js_1.Events.GuildMemberAdd, async (member) => {
        try {
            const ban = await GlobalBan_1.default.findOne({ userId: member.id });
            if (!ban)
                return;
            await member.ban({ reason: `[GlobalBan] ${ban.reason}` });
            try {
                await member.send({
                    embeds: [
                        new discord_js_1.EmbedBuilder()
                            .setColor(colors_1.RED)
                            .setTitle("🔨 You are Globally Banned")
                            .setDescription(`You are globally banned from all servers using this bot.\n\n**Reason:** ${ban.reason}`)
                            .setTimestamp(),
                    ],
                });
            }
            catch { }
            await (0, globalLogger_1.logEvent)(client, new discord_js_1.EmbedBuilder()
                .setColor(colors_1.RED)
                .setTitle("🔨 GlobalBan Auto-Applied")
                .setDescription(`Globally banned user **${member.user.tag}** tried to join **${member.guild.name}** and was auto-banned.`)
                .addFields({ name: "Reason", value: ban.reason })
                .setTimestamp());
        }
        catch { }
    });
}
//# sourceMappingURL=guildMemberAdd.js.map