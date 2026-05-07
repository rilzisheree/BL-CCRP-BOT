"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const permissions_1 = require("../utils/permissions");
const globalLogger_1 = require("../utils/globalLogger");
const colors_1 = require("../utils/colors");
const serverlist = {
    data: new discord_js_1.SlashCommandBuilder()
        .setName("serverlist")
        .setDescription("List all servers the bot is in (Bot Owner only).")
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
        const guilds = [...client.guilds.cache.values()];
        const perPage = 5;
        let page = (interaction.options.getInteger("page") ?? 1) - 1;
        const sendPage = async (pg) => {
            const start = pg * perPage;
            const slice = guilds.slice(start, start + perPage);
            const totalPages = Math.ceil(guilds.length / perPage);
            const embed = new discord_js_1.EmbedBuilder()
                .setColor(colors_1.ORANGE)
                .setTitle(`🌐 Server List — Page ${pg + 1}/${totalPages}`)
                .setDescription(`Bot is in **${guilds.length}** server${guilds.length !== 1 ? "s" : ""} total.`)
                .setTimestamp();
            for (const guild of slice) {
                let inviteLink = "No invite available";
                try {
                    const channels = guild.channels.cache.filter((c) => c.isTextBased() && !c.isDMBased());
                    const first = channels.first();
                    if (first) {
                        const invite = await first.createInvite({ maxAge: 0, maxUses: 0 });
                        inviteLink = invite.url;
                    }
                }
                catch { }
                embed.addFields({
                    name: `${guild.name}`,
                    value: [
                        `**ID:** \`${guild.id}\``,
                        `**Members:** ${guild.memberCount}`,
                        `**Owner:** <@${guild.ownerId}>`,
                        `**Invite:** ${inviteLink}`,
                    ].join("\n"),
                });
            }
            const row = new discord_js_1.ActionRowBuilder();
            if (pg > 0) {
                row.addComponents(new discord_js_1.ButtonBuilder().setCustomId(`sl_prev_${pg}`).setLabel("◀ Prev").setStyle(discord_js_1.ButtonStyle.Secondary));
            }
            slice.forEach((guild, i) => {
                row.addComponents(new discord_js_1.ButtonBuilder()
                    .setCustomId(`sl_leave_${guild.id}`)
                    .setLabel(`Leave: ${guild.name.substring(0, 15)}`)
                    .setStyle(discord_js_1.ButtonStyle.Danger));
            });
            if ((pg + 1) * perPage < guilds.length) {
                row.addComponents(new discord_js_1.ButtonBuilder().setCustomId(`sl_next_${pg}`).setLabel("Next ▶").setStyle(discord_js_1.ButtonStyle.Secondary));
            }
            return { embed, row };
        };
        const { embed, row } = await sendPage(page);
        const components = row.components.length > 0 ? [row] : [];
        const reply = await interaction.editReply({ embeds: [embed], components });
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
            if (btn.customId.startsWith("sl_prev_")) {
                page = parseInt(btn.customId.split("_")[2]) - 1;
                const { embed, row } = await sendPage(page);
                await interaction.editReply({ embeds: [embed], components: row.components.length > 0 ? [row] : [] });
            }
            else if (btn.customId.startsWith("sl_next_")) {
                page = parseInt(btn.customId.split("_")[2]) + 1;
                const { embed, row } = await sendPage(page);
                await interaction.editReply({ embeds: [embed], components: row.components.length > 0 ? [row] : [] });
            }
            else if (btn.customId.startsWith("sl_leave_")) {
                const guildId = btn.customId.replace("sl_leave_", "");
                const guild = client.guilds.cache.get(guildId);
                if (guild) {
                    await guild.leave();
                    await (0, globalLogger_1.logEvent)(client, (0, globalLogger_1.buildCommandLog)("serverlist (leave)", interaction.user, null, `Left server: ${guild.name} (${guildId})`));
                    const { embed, row } = await sendPage(page);
                    await interaction.editReply({ embeds: [embed], components: row.components.length > 0 ? [row] : [] });
                }
            }
        });
        await (0, globalLogger_1.logEvent)(client, (0, globalLogger_1.buildCommandLog)("serverlist", interaction.user, interaction.guild));
    },
};
exports.default = serverlist;
//# sourceMappingURL=serverlist.js.map