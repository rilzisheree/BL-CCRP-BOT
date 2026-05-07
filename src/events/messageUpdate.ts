import { Client, Events, Message, PartialMessage } from "discord.js";
import { logEvent, buildMessageEditLog } from "../utils/globalLogger";

export default function register(client: Client): void {
  client.on(
    Events.MessageUpdate,
    async (oldMsg: Message | PartialMessage, newMsg: Message | PartialMessage) => {
      if (newMsg.author?.bot) return;
      if (oldMsg.content === newMsg.content) return;

      try {
        const embed = buildMessageEditLog(
          oldMsg.content ?? "*unavailable*",
          newMsg.content ?? "*unavailable*",
          newMsg.author ?? null,
          newMsg.guild ?? null,
          (newMsg.channel as any).name ?? "unknown",
          newMsg.url
        );
        await logEvent(client, embed);
      } catch {}
    }
  );
}
