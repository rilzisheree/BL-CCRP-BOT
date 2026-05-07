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
const globalbanlist = {
    data: new discord_js_1.SlashCommandBuilder()
        .setName("globalbanlist")
        .setDescription("View all globally banned users (Bot Owner only).")
        .addIntegerOption((opt) => opt.setName("page").setDescription("Page number").setMinValue(1).setRequired(false)),
    async execute(interaction, client) {
        if (!(0, permissions_1.isOwner)(interaction.user.id)) {
            await interaction.reply({
                embeds: [new discord_js_1.EmbedBuilder().setColor(colors_1.RED).setDescription("❌ This command is restricted to the bot owner.")],
                ephemeral: true,
            });
            return;
        }
        await interaction.deferReply({ ephemeral: true });
        const perPage = 5;
        let page = (interaction.options.getInteger("page") ?? 1) - 1;
        const renderPage = async (pg) => {
            const total = await GlobalBan_1.default.countDocuments();
            const bans = await GlobalBan_1.default.find().skip(pg * perPage).limit(perPage).sort({ bannedAt: -1 });
            const totalPages = Math.ceil(total / perPage) || 1;
            if (total === 0) {
                return {
                    embed: new discord_js_1.EmbedBuilder()
                        .setColor(colors_1.GREEN)
                        .setTitle("✅ Global Ban List")
                        .setDescription("No globally banned users."),
                    rows: [],
                };
            }
            const embed = new discord_js_1.EmbedBuilder()
                .setColor(colors_1.ORANGE)
                .setTitle(`🔨 Global Ban List — Page ${pg + 1}/${totalPages}`)
                .setDescription(`**${total}** user${total !== 1 ? "s" : ""} globally banned.`)
                .setTimestamp();
            for (const ban of bans) {
                embed.addFields({
                    name: `${ban.username}`,
                    value: [
                        `**ID:** \`${ban.userId}\``,
                        `**Reason:** ${ban.reason}`,
                        `**Banned by:** ${ban.bannedByUsername}`,
                        `**Date:** <t:${Math.floor(ban.bannedAt.getTime() / 1000)}:R>`,
                    ].join("\n"),
                });
            }
            const navRow = new discord_js_1.ActionRowBuilder();
            if (pg > 0)
                navRow.addComponents(new discord_js_1.ButtonBuilder().setCustomId(`gbl_prev_${pg}`).setLabel("◀ Prev").setStyle(discord_js_1.ButtonStyle.Secondary));
            if ((pg + 1) * perPage < total)
                navRow.addComponents(new discord_js_1.ButtonBuilder().setCustomId(`gbl_next_${pg}`).setLabel("Next ▶").setStyle(discord_js_1.ButtonStyle.Secondary));
            const unbanRow = new discord_js_1.ActionRowBuilder();
            for (const ban of bans) {
                unbanRow.addComponents(new discord_js_1.ButtonBuilder()
                    .setCustomId(`gbl_unban_${ban.userId}`)
                    .setLabel(`Unban: ${ban.username.substring(0, 12)}`)
                    .setStyle(discord_js_1.ButtonStyle.Danger));
            }
            const rows = [];
            if (navRow.components.length > 0)
                rows.push(navRow);
            if (unbanRow.components.length > 0)
                rows.push(unbanRow);
            return { embed, rows };
        };
        const { embed, rows } = await renderPage(page);
        const reply = await interaction.editReply({ embeds: [embed], components: rows });
        const collector = reply.createMessageComponentCollector({
            componentType: discord_js_1.ComponentType.Button,
            time: 120000,
        });
        collector.on("collect", async (btn) => {
            if (btn.user.id !== interaction.user.id) {
                await btn.reply({ content: "Not your interaction.", ephemeral: true });
                return;
            }
            await btn.deferUpdate();
            if (btn.customId.startsWith("gbl_prev_")) {
                page = parseInt(btn.customId.split("_")[2]) - 1;
            }
            else if (btn.customId.startsWith("gbl_next_")) {
                page = parseInt(btn.customId.split("_")[2]) + 1;
            }
            else if (btn.customId.startsWith("gbl_unban_")) {
                const userId = btn.customId.replace("gbl_unban_", "");
                const ban = await GlobalBan_1.default.findOne({ userId });
                if (ban) {
                    await GlobalBan_1.default.deleteOne({ userId });
                    for (const guild of client.guilds.cache.values()) {
                        try {
                            await guild.bans.remove(userId);
                        }
                        catch { }
                    }
                    try {
                        const user = await client.users.fetch(userId);
                        await user.send({ embeds: [new discord_js_1.EmbedBuilder().setColor(colors_1.GREEN).setTitle("✅ Global Ban Lifted").setDescription("Your global ban has been removed.")] });
                    }
                    catch { }
                    await (0, globalLogger_1.logEvent)(client, (0, globalLogger_1.buildCommandLog)("globalbanlist (unban)", interaction.user, interaction.guild, `Lifted global ban for ${ban.username} (${userId})`));
                }
            }
            const { embed, rows } = await renderPage(page);
            await interaction.editReply({ embeds: [embed], components: rows });
        });
        await (0, globalLogger_1.logEvent)(client, (0, globalLogger_1.buildCommandLog)("globalbanlist", interaction.user, interaction.guild));
    },
};
exports.default = globalbanlist;
//# sourceMappingURL=globalbanlist.js.map