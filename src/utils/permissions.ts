import { GuildMember, PermissionResolvable } from "discord.js";
import AllowedUser from "../models/AllowedUser";

const ownerIds = (process.env.OWNER_IDS ?? "").split(",").map((id) => id.trim()).filter(Boolean);

export function isOwner(userId: string): boolean {
  return ownerIds.includes(userId);
}

export async function hasCommandPermission(
  member: GuildMember,
  command: string,
  requiredPermissions: PermissionResolvable[] = []
): Promise<boolean> {
  if (isOwner(member.id)) return true;

  if (requiredPermissions.length > 0 && member.permissions.has(requiredPermissions as PermissionResolvable[])) {
    return true;
  }

  const allowed = await AllowedUser.findOne({
    userId: member.id,
    guildId: member.guild.id,
    command,
  });
  return !!allowed;
}
