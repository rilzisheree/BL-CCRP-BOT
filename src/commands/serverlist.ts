import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  Client,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ComponentType,
  Guild,
} from "discord.js";
import { Command } from "../utils/types";
import { isOwner } from "../utils/permissions";
import { logEvent, buildCommandLog } from "../utils/globalLogger";
import { ORANGE, RED, GREEN } from "../utils/colors";

const serverlist: Command = {
  data: new SlashCommandBuilder()
    .setName("serverlist")
    .setDescription("List all servers the bot is in (Bot Owner only).")
    .addIntegerOption((opt) =>
      opt.setName("page").setDescription("Page number").setMinValue(1).setRequired(false)
    ),

  async execute(interaction: ChatInputCommandInteraction, client: Client) {
    if (!isOwner(interaction.user.id)) {
      await interaction.reply({
        embeds: [new EmbedBuilder().setColor(RED).setDescription("❌ This command is restricted to the bot owner.")],
        ephemeral: true,
      });
      return;
    }

    await interaction.deferReply({ ephemeral: true });

    const guilds = [...client.guilds.cache.values()];
    const perPage = 5;
    let page = (interaction.options.getInteger("page") ?? 1) - 1;

    const sendPage = async (pg: number) => {
      const start = pg * perPage;
      const slice = guilds.slice(start, start + perPage);
      const totalPages = Math.ceil(guilds.length / perPage);

      const embed = new EmbedBuilder()
        .setColor(ORANGE)
        .setTitle(`🌐 Server List — Page ${pg + 1}/${totalPages}`)
        .setDescription(`Bot is in **${guilds.length}** server${guilds.length !== 1 ? "s" : ""} total.`)
        .setTimestamp();

      for (const guild of slice) {
        let inviteLink = "No invite available";
        try {
          const channels = guild.channels.cache.filter((c) => c.isTextBased() && !c.isDMBased());
          const first = channels.first();
          if (first) {
            const invite = await (first as any).createInvite({ maxAge: 0, maxUses: 0 });
            inviteLink = invite.url;
          }
        } catch {}

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

      const row = new ActionRowBuilder<ButtonBuilder>();

      if (pg > 0) {
        row.addComponents(new ButtonBuilder().setCustomId(`sl_prev_${pg}`).setLabel("◀ Prev").setStyle(ButtonStyle.Secondary));
      }

      slice.forEach((guild, i) => {
        row.addComponents(
          new ButtonBuilder()
            .setCustomId(`sl_leave_${guild.id}`)
            .setLabel(`Leave: ${guild.name.substring(0, 15)}`)
            .setStyle(ButtonStyle.Danger)
        );
      });

      if ((pg + 1) * perPage < guilds.length) {
        row.addComponents(new ButtonBuilder().setCustomId(`sl_next_${pg}`).setLabel("Next ▶").setStyle(ButtonStyle.Secondary));
      }

      return { embed, row };
    };

    const { embed, row } = await sendPage(page);
    const components = row.components.length > 0 ? [row] : [];
    const reply = await interaction.editReply({ embeds: [embed], components });

    const collector = reply.createMessageComponentCollector({
      componentType: ComponentType.Button,
      time: 120_000,
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
      } else if (btn.customId.startsWith("sl_next_")) {
        page = parseInt(btn.customId.split("_")[2]) + 1;
        const { embed, row } = await sendPage(page);
        await interaction.editReply({ embeds: [embed], components: row.components.length > 0 ? [row] : [] });
      } else if (btn.customId.startsWith("sl_leave_")) {
        const guildId = btn.customId.replace("sl_leave_", "");
        const guild = client.guilds.cache.get(guildId);
        if (guild) {
          await guild.leave();
          await logEvent(client, buildCommandLog("serverlist (leave)", interaction.user, null, `Left server: ${guild.name} (${guildId})`));
          const { embed, row } = await sendPage(page);
          await interaction.editReply({ embeds: [embed], components: row.components.length > 0 ? [row] : [] });
        }
      }
    });

    await logEvent(client, buildCommandLog("serverlist", interaction.user, interaction.guild));
  },
};

export default serverlist;
