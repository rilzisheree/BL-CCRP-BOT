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
const globalban = {
    data: new discord_js_1.SlashCommandBuilder()
        .setName("globalban")
        .setDescription("Globally ban a user from all servers the bot is in (Bot Owner only).")
        .addUserOption((opt) => opt.setName("user").setDescription("User to globally ban").setRequired(true))
        .addStringOption((opt) => opt.setName("reason").setDescription("Reason for the global ban").setRequired(true)),
    async execute(interaction, client) {
        if (!(0, permissions_1.isOwner)(interaction.user.id)) {
            await interaction.reply({
                embeds: [new discord_js_1.EmbedBuilder().setColor(colors_1.RED).setDescription("❌ This command is restricted to the bot owner.")],
                ephemeral: true,
            });
            return;
        }
        const target = interaction.options.getUser("user", true);
        const reason = interaction.options.getString("reason", true);
        if ((0, permissions_1.isOwner)(target.id)) {
            await interaction.reply({
                embeds: [new discord_js_1.EmbedBuilder().setColor(colors_1.RED).setDescription("❌ You cannot globally ban another bot owner.")],
                ephemeral: true,
            });
            return;
        }
        await interaction.deferReply({ ephemeral: true });
        const existing = await GlobalBan_1.default.findOne({ userId: target.id });
        if (existing) {
            await interaction.editReply({
                embeds: [
                    new discord_js_1.EmbedBuilder()
                        .setColor(colors_1.RED)
                        .setDescription(`❌ **${target.tag}** is already globally banned.\nReason: ${existing.reason}`),
                ],
            });
            return;
        }
        await GlobalBan_1.default.create({
            userId: target.id,
            username: target.tag,
            reason,
            bannedBy: interaction.user.id,
            bannedByUsername: interaction.user.tag,
        });
        const guilds = client.guilds.cache.values();
        let banned = 0;
        let failed = 0;
        for (const guild of guilds) {
            try {
                await guild.bans.create(target.id, { reason: `[GlobalBan] ${reason}` });
                banned++;
            }
            catch {
                failed++;
            }
        }
        try {
            await target.send({
                embeds: [
                    new discord_js_1.EmbedBuilder()
                        .setColor(colors_1.RED)
                        .setTitle("🔨 You have been Globally Banned")
                        .setDescription(`You have been globally banned from all servers using this bot.\n\n**Reason:** ${reason}`)
                        .setTimestamp(),
                ],
            });
        }
        catch { }
        const embed = new discord_js_1.EmbedBuilder()
            .setColor(colors_1.ORANGE)
            .setTitle("🔨 Global Ban Executed")
            .addFields({ name: "User", value: `${target.tag} (${target.id})`, inline: true }, { name: "Reason", value: reason, inline: true }, { name: "Banned In", value: `${banned} server${banned !== 1 ? "s" : ""}`, inline: true }, { name: "Failed", value: `${failed} server${failed !== 1 ? "s" : ""}`, inline: true })
            .setTimestamp();
        await interaction.editReply({ embeds: [embed] });
        await (0, globalLogger_1.logEvent)(client, (0, globalLogger_1.buildCommandLog)("globalban", interaction.user, interaction.guild, `Globally banned ${target.tag} — Reason: ${reason}`));
    },
};
exports.default = globalban;
//# sourceMappingURL=globalban.js.map