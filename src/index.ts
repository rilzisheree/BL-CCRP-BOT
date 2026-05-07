import "dotenv/config";
import {
  Client,
  GatewayIntentBits,
  Partials,
  Collection,
  Events,
  ChatInputCommandInteraction,
  EmbedBuilder,
} from "discord.js";
import { connectDatabase } from "./utils/database";
import { Command } from "./utils/types";
import { RED } from "./utils/colors";

import purge from "./commands/purge";
import say from "./commands/say";
import serverlist from "./commands/serverlist";
import globalban from "./commands/globalban";
import unglobalban from "./commands/unglobalban";
import globalbanlist from "./commands/globalbanlist";
import setlogchannel from "./commands/setlogchannel";
import dm from "./commands/dm";
import allowuser from "./commands/allowuser";

import registerReady from "./events/ready";
import registerMessageDelete from "./events/messageDelete";
import registerMessageUpdate from "./events/messageUpdate";
import registerGuildMemberAdd from "./events/guildMemberAdd";

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.DirectMessages,
  ],
  partials: [Partials.Message, Partials.Channel, Partials.GuildMember],
});

const commands = new Collection<string, Command>();

const allCommands: Command[] = [
  purge,
  say,
  serverlist,
  globalban,
  unglobalban,
  globalbanlist,
  setlogchannel,
  dm,
  allowuser,
];

for (const cmd of allCommands) {
  commands.set(cmd.data.name, cmd);
}

registerReady(client);
registerMessageDelete(client);
registerMessageUpdate(client);
registerGuildMemberAdd(client);

client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const command = commands.get(interaction.commandName);
  if (!command) return;

  try {
    await command.execute(interaction as ChatInputCommandInteraction, client);
  } catch (err: any) {
    console.error(`[Bot] Error executing /${interaction.commandName}:`, err);
    const errEmbed = new EmbedBuilder()
      .setColor(RED)
      .setDescription(`❌ An error occurred while executing this command.\n\`\`\`${err.message}\`\`\``);

    try {
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp({ embeds: [errEmbed], ephemeral: true });
      } else {
        await interaction.reply({ embeds: [errEmbed], ephemeral: true });
      }
    } catch {}
  }
});

async function main() {
  const token = process.env.DISCORD_TOKEN;
  if (!token) throw new Error("DISCORD_TOKEN environment variable is not set.");

  await connectDatabase();
  await client.login(token);
}

main().catch((err) => {
  console.error("[Bot] Fatal startup error:", err);
  process.exit(1);
});
