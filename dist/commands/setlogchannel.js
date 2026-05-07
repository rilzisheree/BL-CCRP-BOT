"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const permissions_1 = require("../utils/permissions");
const globalLogger_1 = require("../utils/globalLogger");
const LogChannel_1 = __importDefault(require("../models/LogChannel"));
const colors_1 = require("../utils/colors");
const setlogchannel = {
    data: new discord_js_1.SlashCommandBuilder()
        .setName("setlogchannel")
        .setDescription("Manage the global log channel for the bot.")
        .addSubcommand((sub) => sub
        .setName("setglobal")
        .setDescription("Set a channel as the global log channel (Bot Owner only).")
        .addChannelOption((opt) => opt.setName("channel").setDescription("The channel to use as global log").setRequired(true)))
        .addSubcommand((sub) => sub.setName("remove").setDescription("Remove the global log channel (Bot Owner only)."))
        .addSubcommand((sub) => sub.setName("check").setDescription("Check what the current global log channel is.")),
    async execute(interaction, client) {
        const sub = interaction.options.getSubcommand();
        if (sub === "check") {
            const doc = await LogChannel_1.default.findOne();
            if (!doc) {
                await interaction.reply({
                    embeds: [
                        new discord_js_1.EmbedBuilder()
                            .setColor(colors_1.GRAY)
                            .setDescription("📋 No global log channel is currently set."),
                    ],
                    ephemeral: true,
                });
                return;
            }
            let channelMention = `\`${doc.channelId}\``;
            try {
                const ch = await client.channels.fetch(doc.channelId);
                if (ch)
                    channelMention = `<#${doc.channelId}>`;
            }
            catch { }
            await interaction.reply({
                embeds: [
                    new discord_js_1.EmbedBuilder()
                        .setColor(colors_1.ORANGE)
                        .setTitle("📋 Global Log Channel")
                        .addFields({ name: "Channel", value: channelMention, inline: true }, { name: "Set By", value: `<@${doc.setBy}>`, inline: true }, { name: "Set At", value: `<t:${Math.floor(doc.setAt.getTime() / 1000)}:R>`, inline: true })
                        .setTimestamp(),
                ],
                ephemeral: true,
            });
            return;
        }
        if (!(0, permissions_1.isOwner)(interaction.user.id)) {
            await interaction.reply({
                embeds: [new discord_js_1.EmbedBuilder().setColor(colors_1.RED).setDescription("❌ Only the bot owner can change the log channel.")],
                ephemeral: true,
            });
            return;
        }
        if (sub === "setglobal") {
            const channelOption = interaction.options.getChannel("channel", true);
            let channel = null;
            try {
                const fetched = await client.channels.fetch(channelOption.id);
                if (!fetched || !fetched.isTextBased() || fetched.isDMBased()) {
                    await interaction.reply({
                        embeds: [new discord_js_1.EmbedBuilder().setColor(colors_1.RED).setDescription("❌ That is not a valid text channel.")],
                        ephemeral: true,
                    });
                    return;
                }
                channel = fetched;
            }
            catch {
                await interaction.reply({
                    embeds: [new discord_js_1.EmbedBuilder().setColor(colors_1.RED).setDescription("❌ Could not fetch that channel.")],
                    ephemeral: true,
                });
                return;
            }
            await LogChannel_1.default.deleteMany({});
            await LogChannel_1.default.create({ channelId: channel.id, setBy: interaction.user.id });
            await interaction.reply({
                embeds: [
                    new discord_js_1.EmbedBuilder()
                        .setColor(colors_1.GREEN)
                        .setTitle("✅ Global Log Channel Set")
                        .setDescription(`All bot logs will now be sent to <#${channel.id}>.`)
                        .setTimestamp(),
                ],
                ephemeral: true,
            });
            await (0, globalLogger_1.logEvent)(client, (0, globalLogger_1.buildCommandLog)("setlogchannel setglobal", interaction.user, interaction.guild, `Log channel set to <#${channel.id}>`));
        }
        else if (sub === "remove") {
            const existing = await LogChannel_1.default.findOne();
            if (!existing) {
                await interaction.reply({
                    embeds: [new discord_js_1.EmbedBuilder().setColor(colors_1.RED).setDescription("❌ No global log channel is currently set.")],
                    ephemeral: true,
                });
                return;
            }
            await LogChannel_1.default.deleteMany({});
            await interaction.reply({
                embeds: [
                    new discord_js_1.EmbedBuilder()
                        .setColor(colors_1.GREEN)
                        .setTitle("✅ Global Log Channel Removed")
                        .setDescription("Bot logs will no longer be sent to any channel.")
                        .setTimestamp(),
                ],
                ephemeral: true,
            });
        }
    },
};
exports.default = setlogchannel;
//# sourceMappingURL=setlogchannel.js.map