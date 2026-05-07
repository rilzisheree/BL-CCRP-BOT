import { Client, Events, ActivityType } from "discord.js";

export default function register(client: Client): void {
  client.once(Events.ClientReady, (readyClient) => {
    console.log(`[Bot] Logged in as ${readyClient.user.tag}`);
    console.log(`[Bot] In ${readyClient.guilds.cache.size} server(s)`);

    readyClient.user.setPresence({
      activities: [{ name: "Moderating the Shikai World.", type: ActivityType.Watching }],
      status: "online",
    });
  });
}
