import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  Client,
  EmbedBuilder,
  PermissionFlagsBits,
  TextChannel,
} from "discord.js";
import { Command } from "../utils/types";
import { isOwner } from "../utils/permissions";
import { logEvent, buildCommandLog } from "../utils/globalLogger";
import LogChannel from "../models/LogChannel";
import { ORANGE, RED, GREEN, GRAY } from "../utils/colors";

const setlogchannel: Command = {
  data: new SlashCommandBuilder()
    .setName("setlogchannel")
    .setDescription("Manage the global log channel for the bot.")
    .addSubcommand((sub) =>
      sub
        .setName("setglobal")
        .setDescription("Set a channel as the global log channel (Bot Owner only).")
        .addChannelOption((opt) =>
          opt.setName("channel").setDescription("The channel to use as global log").setRequired(true)
        )
    )
    .addSubcommand((sub) =>
      sub.setName("remove").setDescription("Remove the global log channel (Bot Owner only).")
    )
    .addSubcommand((sub) =>
      sub.setName("check").setDescription("Check what the current global log channel is.")
    ),

  async execute(interaction: ChatInputCommandInteraction, client: Client) {
    const sub = interaction.options.getSubcommand();

    if (sub === "check") {
      const doc = await LogChannel.findOne();
      if (!doc) {
        await interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setColor(GRAY)
              .setDescription("📋 No global log channel is currently set."),
          ],
          ephemeral: true,
        });
        return;
      }

      let channelMention = `\`${doc.channelId}\``;
      try {
        const ch = await client.channels.fetch(doc.channelId);
        if (ch) channelMention = `<#${doc.channelId}>`;
      } catch {}

      await interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor(ORANGE)
            .setTitle("📋 Global Log Channel")
            .addFields(
              { name: "Channel", value: channelMention, inline: true },
              { name: "Set By", value: `<@${doc.setBy}>`, inline: true },
              { name: "Set At", value: `<t:${Math.floor(doc.setAt.getTime() / 1000)}:R>`, inline: true }
            )
            .setTimestamp(),
        ],
        ephemeral: true,
      });
      return;
    }

    if (!isOwner(interaction.user.id)) {
      await interaction.reply({
        embeds: [new EmbedBuilder().setColor(RED).setDescription("❌ Only the bot owner can change the log channel.")],
        ephemeral: true,
      });
      return;
    }

    if (sub === "setglobal") {
      const channelOption = interaction.options.getChannel("channel", true);
      let channel: TextChannel | null = null;

      try {
        const fetched = await client.channels.fetch(channelOption.id);
        if (!fetched || !fetched.isTextBased() || fetched.isDMBased()) {
          await interaction.reply({
            embeds: [new EmbedBuilder().setColor(RED).setDescription("❌ That is not a valid text channel.")],
            ephemeral: true,
          });
          return;
        }
        channel = fetched as TextChannel;
      } catch {
        await interaction.reply({
          embeds: [new EmbedBuilder().setColor(RED).setDescription("❌ Could not fetch that channel.")],
          ephemeral: true,
        });
        return;
      }

      await LogChannel.deleteMany({});
      await LogChannel.create({ channelId: channel.id, setBy: interaction.user.id });

      await interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor(GREEN)
            .setTitle("✅ Global Log Channel Set")
            .setDescription(`All bot logs will now be sent to <#${channel.id}>.`)
            .setTimestamp(),
        ],
        ephemeral: true,
      });

      await logEvent(
        client,
        buildCommandLog("setlogchannel setglobal", interaction.user, interaction.guild, `Log channel set to <#${channel.id}>`)
      );
    } else if (sub === "remove") {
      const existing = await LogChannel.findOne();
      if (!existing) {
        await interaction.reply({
          embeds: [new EmbedBuilder().setColor(RED).setDescription("❌ No global log channel is currently set.")],
          ephemeral: true,
        });
        return;
      }

      await LogChannel.deleteMany({});

      await interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor(GREEN)
            .setTitle("✅ Global Log Channel Removed")
            .setDescription("Bot logs will no longer be sent to any channel.")
            .setTimestamp(),
        ],
        ephemeral: true,
      });
    }
  },
};

export default setlogchannel;
