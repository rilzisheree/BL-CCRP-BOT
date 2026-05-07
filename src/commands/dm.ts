import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  Client,
  EmbedBuilder,
} from "discord.js";
import { Command } from "../utils/types";
import { isOwner, hasCommandPermission } from "../utils/permissions";
import { logEvent, buildCommandLog } from "../utils/globalLogger";
import { ORANGE, RED, GREEN } from "../utils/colors";

const dm: Command = {
  data: new SlashCommandBuilder()
    .setName("dm")
    .setDescription("Send a direct message to a user as the bot.")
    .addUserOption((opt) =>
      opt.setName("user").setDescription("The user to DM").setRequired(true)
    )
    .addStringOption((opt) =>
      opt.setName("message").setDescription("The message to send").setRequired(true)
    ),

  async execute(interaction: ChatInputCommandInteraction, client: Client) {
    if (!interaction.inGuild() || !interaction.guild) {
      await interaction.reply({ content: "This command can only be used in a server.", ephemeral: true });
      return;
    }

    const member = interaction.guild.members.cache.get(interaction.user.id)!;
    const allowed = await hasCommandPermission(member, "dm", []);
    if (!isOwner(interaction.user.id) && !allowed) {
      await interaction.reply({
        embeds: [new EmbedBuilder().setColor(RED).setDescription("❌ You don't have permission to use this command.")],
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
          new EmbedBuilder()
            .setColor(ORANGE)
            .setDescription(message)
            .setFooter({ text: `Sent from ${interaction.guild.name}` })
            .setTimestamp(),
        ],
      });

      await interaction.editReply({
        embeds: [
          new EmbedBuilder()
            .setColor(GREEN)
            .setDescription(`✅ DM sent to **${target.tag}** successfully.`)
            .setTimestamp(),
        ],
      });

      await logEvent(
        client,
        buildCommandLog(
          "dm",
          interaction.user,
          interaction.guild,
          `DM sent to ${target.tag} (${target.id}): "${message.substring(0, 200)}"`
        )
      );
    } catch {
      await interaction.editReply({
        embeds: [
          new EmbedBuilder()
            .setColor(RED)
            .setDescription(`❌ Could not send a DM to **${target.tag}**. They may have DMs disabled.`),
        ],
      });
    }
  },
};

export default dm;
