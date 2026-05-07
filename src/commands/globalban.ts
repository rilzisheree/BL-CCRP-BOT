import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  Client,
  EmbedBuilder,
} from "discord.js";
import { Command } from "../utils/types";
import { isOwner } from "../utils/permissions";
import { logEvent, buildCommandLog } from "../utils/globalLogger";
import GlobalBan from "../models/GlobalBan";
import { ORANGE, RED, GREEN } from "../utils/colors";

const globalban: Command = {
  data: new SlashCommandBuilder()
    .setName("globalban")
    .setDescription("Globally ban a user from all servers the bot is in (Bot Owner only).")
    .addUserOption((opt) =>
      opt.setName("user").setDescription("User to globally ban").setRequired(true)
    )
    .addStringOption((opt) =>
      opt.setName("reason").setDescription("Reason for the global ban").setRequired(true)
    ),

  async execute(interaction: ChatInputCommandInteraction, client: Client) {
    if (!isOwner(interaction.user.id)) {
      await interaction.reply({
        embeds: [new EmbedBuilder().setColor(RED).setDescription("❌ This command is restricted to the bot owner.")],
        ephemeral: true,
      });
      return;
    }

    const target = interaction.options.getUser("user", true);
    const reason = interaction.options.getString("reason", true);

    if (isOwner(target.id)) {
      await interaction.reply({
        embeds: [new EmbedBuilder().setColor(RED).setDescription("❌ You cannot globally ban another bot owner.")],
        ephemeral: true,
      });
      return;
    }

    await interaction.deferReply({ ephemeral: true });

    const existing = await GlobalBan.findOne({ userId: target.id });
    if (existing) {
      await interaction.editReply({
        embeds: [
          new EmbedBuilder()
            .setColor(RED)
            .setDescription(`❌ **${target.tag}** is already globally banned.\nReason: ${existing.reason}`),
        ],
      });
      return;
    }

    await GlobalBan.create({
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
      } catch {
        failed++;
      }
    }

    try {
      await target.send({
        embeds: [
          new EmbedBuilder()
            .setColor(RED)
            .setTitle("🔨 You have been Globally Banned")
            .setDescription(
              `You have been globally banned from all servers using this bot.\n\n**Reason:** ${reason}`
            )
            .setTimestamp(),
        ],
      });
    } catch {}

    const embed = new EmbedBuilder()
      .setColor(ORANGE)
      .setTitle("🔨 Global Ban Executed")
      .addFields(
        { name: "User", value: `${target.tag} (${target.id})`, inline: true },
        { name: "Reason", value: reason, inline: true },
        { name: "Banned In", value: `${banned} server${banned !== 1 ? "s" : ""}`, inline: true },
        { name: "Failed", value: `${failed} server${failed !== 1 ? "s" : ""}`, inline: true }
      )
      .setTimestamp();

    await interaction.editReply({ embeds: [embed] });
    await logEvent(
      client,
      buildCommandLog("globalban", interaction.user, interaction.guild, `Globally banned ${target.tag} — Reason: ${reason}`)
    );
  },
};

export default globalban;
