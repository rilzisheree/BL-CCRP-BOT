"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = register;
const discord_js_1 = require("discord.js");
const globalLogger_1 = require("../utils/globalLogger");
function register(client) {
    client.on(discord_js_1.Events.MessageUpdate, async (oldMsg, newMsg) => {
        if (newMsg.author?.bot)
            return;
        if (oldMsg.content === newMsg.content)
            return;
        try {
            const embed = (0, globalLogger_1.buildMessageEditLog)(oldMsg.content ?? "*unavailable*", newMsg.content ?? "*unavailable*", newMsg.author ?? null, newMsg.guild ?? null, newMsg.channel.name ?? "unknown", newMsg.url);
            await (0, globalLogger_1.logEvent)(client, embed);
        }
        catch { }
    });
}
//# sourceMappingURL=messageUpdate.js.map