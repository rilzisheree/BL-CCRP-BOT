import { Client, Events, GuildMember, EmbedBuilder } from "discord.js";
import GlobalBan from "../models/GlobalBan";
import { logEvent, buildCommandLog } from "../utils/globalLogger";
import { RED } from "../utils/colors";

export default function register(client: Client): void {
  client.on(Events.GuildMemberAdd, async (member: GuildMember) => {
    try {
      const ban = await GlobalBan.findOne({ userId: member.id });
      if (!ban) return;

      await member.ban({ reason: `[GlobalBan] ${ban.reason}` });

      try {
        await member.send({
          embeds: [
            new EmbedBuilder()
              .setColor(RED)
              .setTitle("🔨 You are Globally Banned")
              .setDescription(
                `You are globally banned from all servers using this bot.\n\n**Reason:** ${ban.reason}`
              )
              .setTimestamp(),
          ],
        });
      } catch {}

      await logEvent(
        client,
        new EmbedBuilder()
          .setColor(RED)
          .setTitle("🔨 GlobalBan Auto-Applied")
          .setDescription(
            `Globally banned user **${member.user.tag}** tried to join **${member.guild.name}** and was auto-banned.`
          )
          .addFields({ name: "Reason", value: ban.reason })
          .setTimestamp()
      );
    } catch {}
  });
}
