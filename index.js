const { Client, GatewayIntentBits, Collection } = require("discord.js");
const fs = require("fs");
require("dotenv").config();

const client = new Client({
  intents: [
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
  ],
});

const prefix = "$";

client.commands = new Collection();

const commandFiles = fs
  .readdirSync("./Commands/")
  .filter((file) => file.endsWith(".js"));
for (const file of commandFiles) {
  const command = require(`./Commands/${file}`);

  client.commands.set(command.name, command);
}

client.once("ready", () => {
  console.log("Hacking bot is online!");
});

client.on("messageCreate", (message) => {
  if (!message.content.startsWith(prefix) || message.author.bot) return;

  const args = message.content.slice(prefix.length).split(/[ \n]+/);
  const command = args.shift().toLowerCase();

  if (command === "marco") {
    client.commands.get("marco").execute(message, args);
  } else if (command === "brute") {
    client.commands.get("brute").execute(message, args);
  }
});

client.login(process.env.token);
