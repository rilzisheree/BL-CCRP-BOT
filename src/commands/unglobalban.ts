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

const unglobalban: Command = {
  data: new SlashCommandBuilder()
    .setName("unglobalban")
    .setDescription("Remove a user's global ban (Bot Owner only).")
    .addStringOption((opt) =>
      opt.setName("userid").setDescription("User ID to unban globally").setRequired(true)
    ),

  async execute(interaction: ChatInputCommandInteraction, client: Client) {
    if (!isOwner(interaction.user.id)) {
      await interaction.reply({
        embeds: [new EmbedBuilder().setColor(RED).setDescription("❌ This command is restricted to the bot owner.")],
        ephemeral: true,
      });
      return;
    }

    const userId = interaction.options.getString("userid", true).trim();
    await interaction.deferReply({ ephemeral: true });

    const ban = await GlobalBan.findOne({ userId });
    if (!ban) {
      await interaction.editReply({
        embeds: [new EmbedBuilder().setColor(RED).setDescription(`❌ No global ban found for user ID \`${userId}\`.`)],
      });
      return;
    }

    await GlobalBan.deleteOne({ userId });

    const guilds = client.guilds.cache.values();
    let unbanned = 0;
    let failed = 0;

    for (const guild of guilds) {
      try {
        await guild.bans.remove(userId, `[GlobalBan Lifted] By ${interaction.user.tag}`);
        unbanned++;
      } catch {
        failed++;
      }
    }

    let userTag = ban.username;
    try {
      const user = await client.users.fetch(userId);
      userTag = user.tag;

      await user.send({
        embeds: [
          new EmbedBuilder()
            .setColor(GREEN)
            .setTitle("✅ Global Ban Lifted")
            .setDescription("Your global ban has been removed. You may rejoin servers that use this bot.")
            .setTimestamp(),
        ],
      });
    } catch {}

    const embed = new EmbedBuilder()
      .setColor(GREEN)
      .setTitle("✅ Global Ban Removed")
      .addFields(
        { name: "User", value: `${userTag} (${userId})`, inline: true },
        { name: "Unbanned In", value: `${unbanned} server${unbanned !== 1 ? "s" : ""}`, inline: true },
        { name: "Failed", value: `${failed} server${failed !== 1 ? "s" : ""}`, inline: true }
      )
      .setTimestamp();

    await interaction.editReply({ embeds: [embed] });
    await logEvent(
      client,
      buildCommandLog("unglobalban", interaction.user, interaction.guild, `Lifted global ban for ${userTag} (${userId})`)
    );
  },
};

export default unglobalban;
