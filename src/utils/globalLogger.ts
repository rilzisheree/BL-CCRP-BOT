import {
  Client,
  EmbedBuilder,
  TextChannel,
  Guild,
  GuildMember,
  User,
} from "discord.js";
import LogChannel from "../models/LogChannel";
import { ORANGE, GRAY, RED } from "./colors";

async function getLogChannel(client: Client): Promise<TextChannel | null> {
  const doc = await LogChannel.findOne();
  if (!doc) return null;
  try {
    const channel = await client.channels.fetch(doc.channelId);
    if (channel && channel.isTextBased() && !channel.isDMBased()) {
      return channel as TextChannel;
    }
  } catch {
    return null;
  }
  return null;
}

export async function logEvent(
  client: Client,
  embed: EmbedBuilder
): Promise<void> {
  try {
    const channel = await getLogChannel(client);
    if (!channel) return;
    await channel.send({ embeds: [embed] });
  } catch (err) {
    console.error("[Logger] Failed to send log:", err);
  }
}

export function buildCommandLog(
  commandName: string,
  user: User,
  guild: Guild | null,
  extra?: string
): EmbedBuilder {
  return new EmbedBuilder()
    .setColor(ORANGE)
    .setTitle("🛠️ Command Used")
    .addFields(
      { name: "Command", value: `\`/${commandName}\``, inline: true },
      { name: "User", value: `${user.tag} (${user.id})`, inline: true },
      {
        name: "Server",
        value: guild ? `${guild.name} (${guild.id})` : "DM",
        inline: true,
      },
      ...(extra ? [{ name: "Details", value: extra }] : [])
    )
    .setTimestamp();
}

export function buildMessageDeleteLog(
  content: string,
  author: User | null,
  guild: Guild | null,
  channelName: string
): EmbedBuilder {
  return new EmbedBuilder()
    .setColor(RED)
    .setTitle("🗑️ Message Deleted")
    .addFields(
      {
        name: "Author",
        value: author ? `${author.tag} (${author.id})` : "Unknown",
        inline: true,
      },
      { name: "Channel", value: `#${channelName}`, inline: true },
      {
        name: "Server",
        value: guild ? `${guild.name} (${guild.id})` : "Unknown",
        inline: true,
      },
      {
        name: "Content",
        value: content.substring(0, 1024) || "*No text content*",
      }
    )
    .setTimestamp();
}

export function buildMessageEditLog(
  oldContent: string,
  newContent: string,
  author: User | null,
  guild: Guild | null,
  channelName: string,
  messageUrl: string
): EmbedBuilder {
  return new EmbedBuilder()
    .setColor(GRAY)
    .setTitle("✏️ Message Edited")
    .setURL(messageUrl)
    .addFields(
      {
        name: "Author",
        value: author ? `${author.tag} (${author.id})` : "Unknown",
        inline: true,
      },
      { name: "Channel", value: `#${channelName}`, inline: true },
      {
        name: "Server",
        value: guild ? `${guild.name} (${guild.id})` : "Unknown",
        inline: true,
      },
      { name: "Before", value: oldContent.substring(0, 512) || "*empty*" },
      { name: "After", value: newContent.substring(0, 512) || "*empty*" }
    )
    .setTimestamp();
}
