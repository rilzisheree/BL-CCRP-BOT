"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const permissions_1 = require("../utils/permissions");
const globalLogger_1 = require("../utils/globalLogger");
const colors_1 = require("../utils/colors");
const say = {
    data: new discord_js_1.SlashCommandBuilder()
        .setName("say")
        .setDescription("Send, reply to, or edit a message as the bot.")
        .addStringOption((opt) => opt.setName("message").setDescription("The message content to send").setRequired(true))
        .addChannelOption((opt) => opt.setName("channel").setDescription("Channel to send the message in (defaults to current channel)").setRequired(false))
        .addStringOption((opt) => opt.setName("reply_to").setDescription("Message ID to reply to").setRequired(false))
        .addStringOption((opt) => opt.setName("edit").setDescription("Message ID of a bot message to edit").setRequired(false)),
    async execute(interaction, client) {
        if (!interaction.inGuild() || !interaction.guild) {
            await interaction.reply({ content: "This command can only be used in a server.", ephemeral: true });
            return;
        }
        const member = interaction.guild.members.cache.get(interaction.user.id);
        const allowed = await (0, permissions_1.hasCommandPermission)(member, "say", [discord_js_1.PermissionFlagsBits.ManageMessages]);
        if (!allowed) {
            await interaction.reply({
                embeds: [new discord_js_1.EmbedBuilder().setColor(colors_1.RED).setDescription("❌ You don't have permission to use this command.")],
                ephemeral: true,
            });
            return;
        }
        const content = interaction.options.getString("message", true);
        const channelOption = interaction.options.getChannel("channel");
        const replyToId = interaction.options.getString("reply_to");
        const editId = interaction.options.getString("edit");
        await interaction.deferReply({ ephemeral: true });
        try {
            const targetChannel = (channelOption
                ? await interaction.guild.channels.fetch(channelOption.id)
                : interaction.channel);
            if (!targetChannel || !targetChannel.isTextBased()) {
                await interaction.editReply({ content: "❌ Invalid channel." });
                return;
            }
            if (editId) {
                const msg = await targetChannel.messages.fetch(editId);
                if (msg.author.id !== client.user.id) {
                    await interaction.editReply({ content: "❌ I can only edit my own messages." });
                    return;
                }
                await msg.edit(content);
                await interaction.editReply({ content: `✅ Message edited in <#${targetChannel.id}>.` });
                await (0, globalLogger_1.logEvent)(client, (0, globalLogger_1.buildCommandLog)("say (edit)", interaction.user, interaction.guild, `Edited message \`${editId}\` in <#${targetChannel.id}>`));
                return;
            }
            if (replyToId) {
                const msgToReply = await targetChannel.messages.fetch(replyToId);
                await msgToReply.reply(content);
                await interaction.editReply({ content: `✅ Reply sent in <#${targetChannel.id}>.` });
                await (0, globalLogger_1.logEvent)(client, (0, globalLogger_1.buildCommandLog)("say (reply)", interaction.user, interaction.guild, `Replied to \`${replyToId}\` in <#${targetChannel.id}>`));
                return;
            }
            await targetChannel.send(content);
            await interaction.editReply({ content: `✅ Message sent in <#${targetChannel.id}>.` });
            await (0, globalLogger_1.logEvent)(client, (0, globalLogger_1.buildCommandLog)("say", interaction.user, interaction.guild, `Sent message in <#${targetChannel.id}>: "${content.substring(0, 200)}"`));
        }
        catch (err) {
            await interaction.editReply({ content: `❌ Error: ${err.message}` });
        }
    },
};
exports.default = say;
//# sourceMappingURL=say.js.map