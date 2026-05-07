"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const permissions_1 = require("../utils/permissions");
const globalLogger_1 = require("../utils/globalLogger");
const GlobalBan_1 = __importDefault(require("../models/GlobalBan"));
const colors_1 = require("../utils/colors");
const unglobalban = {
    data: new discord_js_1.SlashCommandBuilder()
        .setName("unglobalban")
        .setDescription("Remove a user's global ban (Bot Owner only).")
        .addStringOption((opt) => opt.setName("userid").setDescription("User ID to unban globally").setRequired(true)),
    async execute(interaction, client) {
        if (!(0, permissions_1.isOwner)(interaction.user.id)) {
            await interaction.reply({
                embeds: [new discord_js_1.EmbedBuilder().setColor(colors_1.RED).setDescription("❌ This command is restricted to the bot owner.")],
                ephemeral: true,
            });
            return;
        }
        const userId = interaction.options.getString("userid", true).trim();
        await interaction.deferReply({ ephemeral: true });
        const ban = await GlobalBan_1.default.findOne({ userId });
        if (!ban) {
            await interaction.editReply({
                embeds: [new discord_js_1.EmbedBuilder().setColor(colors_1.RED).setDescription(`❌ No global ban found for user ID \`${userId}\`.`)],
            });
            return;
        }
        await GlobalBan_1.default.deleteOne({ userId });
        const guilds = client.guilds.cache.values();
        let unbanned = 0;
        let failed = 0;
        for (const guild of guilds) {
            try {
                await guild.bans.remove(userId, `[GlobalBan Lifted] By ${interaction.user.tag}`);
                unbanned++;
            }
            catch {
                failed++;
            }
        }
        let userTag = ban.username;
        try {
            const user = await client.users.fetch(userId);
            userTag = user.tag;
            await user.send({
                embeds: [
                    new discord_js_1.EmbedBuilder()
                        .setColor(colors_1.GREEN)
                        .setTitle("✅ Global Ban Lifted")
                        .setDescription("Your global ban has been removed. You may rejoin servers that use this bot.")
                        .setTimestamp(),
                ],
            });
        }
        catch { }
        const embed = new discord_js_1.EmbedBuilder()
            .setColor(colors_1.GREEN)
            .setTitle("✅ Global Ban Removed")
            .addFields({ name: "User", value: `${userTag} (${userId})`, inline: true }, { name: "Unbanned In", value: `${unbanned} server${unbanned !== 1 ? "s" : ""}`, inline: true }, { name: "Failed", value: `${failed} server${failed !== 1 ? "s" : ""}`, inline: true })
            .setTimestamp();
        await interaction.editReply({ embeds: [embed] });
        await (0, globalLogger_1.logEvent)(client, (0, globalLogger_1.buildCommandLog)("unglobalban", interaction.user, interaction.guild, `Lifted global ban for ${userTag} (${userId})`));
    },
};
exports.default = unglobalban;
//# sourceMappingURL=unglobalban.js.map