"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = register;
const discord_js_1 = require("discord.js");
function register(client) {
    client.once(discord_js_1.Events.ClientReady, (readyClient) => {
        console.log(`[Bot] Logged in as ${readyClient.user.tag}`);
        console.log(`[Bot] In ${readyClient.guilds.cache.size} server(s)`);
        readyClient.user.setPresence({
            activities: [{ name: "over the servers", type: discord_js_1.ActivityType.Watching }],
            status: "online",
        });
    });
}
//# sourceMappingURL=ready.js.map