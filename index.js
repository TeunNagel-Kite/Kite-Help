require("dotenv").config();
const { Client, Collection } = require("discord.js");

const client = new Client({ intents: 32767 });

// Export client so other modules can require('./index') safely
module.exports = client;

// Global Variables
client.commands = new Collection();
client.slashCommands = new Collection();

// Initializing the project (safe loader for handler)
try {
    const handler = require("./handler");
    if (typeof handler === "function") {
        handler(client);
    } else if (handler && typeof handler.init === "function") {
        handler.init(client);
    } else {
        console.error("handler export is not callable. Export a function or provide an init(client) method.");
        process.exit(1);
    }
} catch (err) {
    console.error("Failed to load handler:", err);
    process.exit(1);
}

// check token and login (sanitized)
const rawToken = process.env.TOKEN;
const token = rawToken ? rawToken.trim().replace(/^Bot\s+/i, '') : '';
if (!token) {
    console.error("Missing or empty TOKEN in .env — open .env and set: TOKEN=your_bot_token (no quotes, no leading 'Bot ').");
    process.exit(1);
}
console.log(`Using token length: ${token.length} characters (masked)`);

client.login(token).then(() => {
    console.log('Login successful');
}).catch(err => {
    console.error('Login failed:', err);
    if (err && /TokenInvalid/i.test(String(err))) {
        console.error("TokenInvalid: reset the token in the Discord Developer Portal and update .env with TOKEN=your_new_token (no quotes).");
    }
    // do not force-exit here; fix token and restart the process manually
});
