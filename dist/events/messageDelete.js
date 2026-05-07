"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = register;
const discord_js_1 = require("discord.js");
const globalLogger_1 = require("../utils/globalLogger");
function register(client) {
    client.on(discord_js_1.Events.MessageDelete, async (message) => {
        if (message.author?.bot)
            return;
        try {
            const content = message.content ?? "*Message content unavailable*";
            const embed = (0, globalLogger_1.buildMessageDeleteLog)(content, message.author ?? null, message.guild ?? null, message.channel.name ?? "unknown");
            await (0, globalLogger_1.logEvent)(client, embed);
        }
        catch { }
    });
}
//# sourceMappingURL=messageDelete.js.map