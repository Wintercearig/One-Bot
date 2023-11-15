const { Client, GatewayIntentBits, Collection } = require("discord.js");

require('dotenv').config();
const { connect, connection } = require("mongoose");
const fs = require('fs');
const Logger = require("./src/modules/Logger");
const MongStarboardsManager = require("./src/modules/StarboardsManager");

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildIntegrations,
        GatewayIntentBits.GuildPresences,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildModeration,
        GatewayIntentBits.GuildEmojisAndStickers,
        GatewayIntentBits.GuildWebhooks,
        GatewayIntentBits.GuildInvites,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildScheduledEvents,
    ]
});

//DO NOT TOUCH UNLESS ADDING OR DELETING NECESSARY FUNCTIONS
const {
  toCapitalize,
  calculateUserXp,
  getUserById,
  addGuild,
  addUser,
  removeUser,
  updateUserById,
  getGuildById,
  updateGuildById,
  removeGuild,
  addWarning,
  removeUserWarnings,
  findMember,
  getGuildLang,
  getLanguages,
  // handleApiRequest,
  parseMessage,
  createWebhook,
  getWebhook,
  escapeMarkdown,
  findOrCreateMutedRole,
  updateMuteChannelPerms,
  // checkAuth,
  formatNumber,
  createStarboard,
  findRole,
  formattedDate,
  addCase,
  getLatestCaseNumber
} = require('./src/utils/functions');

[
  toCapitalize,
  calculateUserXp,
  getUserById,
  addGuild,
  addUser,
  removeUser,
  updateUserById,
  getGuildById,
  updateGuildById,
  removeGuild,
  addWarning,
  removeUserWarnings,
  findMember,
  getGuildLang,
  getLanguages,
  // handleApiRequest,
  parseMessage,
  createWebhook,
  getWebhook,
  escapeMarkdown,
  findOrCreateMutedRole,
  updateMuteChannelPerms,
  // checkAuth,
  formatNumber,
  createStarboard,
  findRole,
  formattedDate,
  addCase,
  getLatestCaseNumber
].forEach((func) => {
  client[func.name] = func;
});

// Event handler for unhandled promise rejections
process.on("unhandledRejection", (error) => {
  console.error("Unhandled Promise Rejection:", error);
  // You can take additional actions here, such as sending a message or logging to a file.
});

// Event handler for uncaught promise exceptions
process.on("uncaughtException", (error) => {
    console.error("Uncaught Exception:", error);
    // You can take additional actions here, such as sending a message or logging to a file.
});

client.commands = new Collection();
client.slash = new Collection();
client.events = new Collection();
client.aliases = new Collection();
client.afk = new Map();
client.categories = fs.readdirSync('./src/commands/');
client.logger = Logger;
client.starboardsManager = new MongStarboardsManager(client, {
	storage: false,
});

require("./handlers/commands")(client);
require("./handlers/events")(client);

connect(process.env.mongoDB, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log(`Connected to port: ${connection.port}`);
}).catch((err) => {
  console.log('Unable to connect to MongoDB Database.\nError: ' + err);
});

client.login(process.env.token);