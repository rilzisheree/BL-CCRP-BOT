import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  Client,
  EmbedBuilder,
  PermissionFlagsBits,
  TextChannel,
} from "discord.js";
import { Command } from "../utils/types";
import { hasCommandPermission } from "../utils/permissions";
import { logEvent, buildCommandLog } from "../utils/globalLogger";
import { ORANGE, RED } from "../utils/colors";

const purge: Command = {
  data: new SlashCommandBuilder()
    .setName("purge")
    .setDescription("Delete a number of messages from this channel.")
    .addIntegerOption((opt) =>
      opt
        .setName("amount")
        .setDescription("Number of messages to delete (1–100)")
        .setMinValue(1)
        .setMaxValue(100)
        .setRequired(true)
    )
    .addUserOption((opt) =>
      opt.setName("user").setDescription("Only delete messages from this user").setRequired(false)
    ),

  async execute(interaction: ChatInputCommandInteraction, client: Client) {
    if (!interaction.inGuild() || !interaction.guild) {
      await interaction.reply({ content: "This command can only be used in a server.", ephemeral: true });
      return;
    }

    const member = interaction.guild.members.cache.get(interaction.user.id)!;
    const allowed = await hasCommandPermission(member, "purge", [PermissionFlagsBits.ManageMessages]);
    if (!allowed) {
      await interaction.reply({
        embeds: [new EmbedBuilder().setColor(RED).setDescription("❌ You don't have permission to use this command.")],
        ephemeral: true,
      });
      return;
    }

    const amount = interaction.options.getInteger("amount", true);
    const targetUser = interaction.options.getUser("user");
    const channel = interaction.channel as TextChannel;

    await interaction.deferReply({ ephemeral: true });

    try {
      let messages = await channel.messages.fetch({ limit: 100 });

      if (targetUser) {
        messages = messages.filter((m) => m.author.id === targetUser.id);
      }

      const toDelete = [...messages.values()].slice(0, amount);
      const deleted = await channel.bulkDelete(toDelete, true);

      const embed = new EmbedBuilder()
        .setColor(ORANGE)
        .setTitle("🧹 Purge Complete")
        .setDescription(
          `Deleted **${deleted.size}** message${deleted.size !== 1 ? "s" : ""}${targetUser ? ` from ${targetUser.tag}` : ""}.`
        )
        .setTimestamp();

      await interaction.editReply({ embeds: [embed] });

      await logEvent(
        client,
        buildCommandLog(
          "purge",
          interaction.user,
          interaction.guild,
          `Deleted ${deleted.size} messages in <#${channel.id}>${targetUser ? ` from ${targetUser.tag}` : ""}`
        )
      );
    } catch (err) {
      await interaction.editReply({
        embeds: [
          new EmbedBuilder()
            .setColor(RED)
            .setDescription("❌ Failed to delete messages. Messages older than 14 days cannot be bulk deleted."),
        ],
      });
    }
  },
};

export default purge;
