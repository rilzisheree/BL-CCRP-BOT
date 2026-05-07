import { Client, Events, Message, PartialMessage } from "discord.js";
import { logEvent, buildMessageDeleteLog } from "../utils/globalLogger";

export default function register(client: Client): void {
  client.on(Events.MessageDelete, async (message: Message | PartialMessage) => {
    if (message.author?.bot) return;

    try {
      const content = message.content ?? "*Message content unavailable*";
      const embed = buildMessageDeleteLog(
        content,
        message.author ?? null,
        message.guild ?? null,
        (message.channel as any).name ?? "unknown"
      );
      await logEvent(client, embed);
    } catch {}
  });
}
