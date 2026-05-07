import {
  ChatInputCommandInteraction,
  Client,
} from "discord.js";

export interface Command {
  data: { name: string; toJSON(): unknown };
  execute: (interaction: ChatInputCommandInteraction, client: Client) => Promise<void>;
}
