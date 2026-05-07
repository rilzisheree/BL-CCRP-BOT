"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const permissions_1 = require("../utils/permissions");
const globalLogger_1 = require("../utils/globalLogger");
const colors_1 = require("../utils/colors");
const dm = {
    data: new discord_js_1.SlashCommandBuilder()
        .setName("dm")
        .setDescription("Send a direct message to a user as the bot.")
        .addUserOption((opt) => opt.setName("user").setDescription("The user to DM").setRequired(true))
        .addStringOption((opt) => opt.setName("message").setDescription("The message to send").setRequired(true)),
    async execute(interaction, client) {
        if (!interaction.inGuild() || !interaction.guild) {
            await interaction.reply({ content: "This command can only be used in a server.", ephemeral: true });
            return;
        }
        const member = interaction.guild.members.cache.get(interaction.user.id);
        const allowed = await (0, permissions_1.hasCommandPermission)(member, "dm", []);
        if (!(0, permissions_1.isOwner)(interaction.user.id) && !allowed) {
            await interaction.reply({
                embeds: [new discord_js_1.EmbedBuilder().setColor(colors_1.RED).setDescription("❌ You don't have permission to use this command.")],
                ephemeral: true,
            });
            return;
        }
        const target = interaction.options.getUser("user", true);
        const message = interaction.options.getString("message", true);
        await interaction.deferReply({ ephemeral: true });
        try {
            await target.send({
                embeds: [
                    new discord_js_1.EmbedBuilder()
                        .setColor(colors_1.ORANGE)
                        .setDescription(message)
                        .setFooter({ text: `Sent from ${interaction.guild.name}` })
                        .setTimestamp(),
                ],
            });
            await interaction.editReply({
                embeds: [
                    new discord_js_1.EmbedBuilder()
                        .setColor(colors_1.GREEN)
                        .setDescription(`✅ DM sent to **${target.tag}** successfully.`)
                        .setTimestamp(),
                ],
            });
            await (0, globalLogger_1.logEvent)(client, (0, globalLogger_1.buildCommandLog)("dm", interaction.user, interaction.guild, `DM sent to ${target.tag} (${target.id}): "${message.substring(0, 200)}"`));
        }
        catch {
            await interaction.editReply({
                embeds: [
                    new discord_js_1.EmbedBuilder()
                        .setColor(colors_1.RED)
                        .setDescription(`❌ Could not send a DM to **${target.tag}**. They may have DMs disabled.`),
                ],
            });
        }
    },
};
exports.default = dm;
//# sourceMappingURL=dm.js.map