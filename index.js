require('dotenv').config();

const { Client, GatewayIntentBits, Collection, REST, Routes} = require("discord.js"),
{ connect, connection } = require("mongoose"),
fs = require('fs'),
Logger = require("./src/modules/Logger"),
MongStarboardsManager = require("./src/modules/StarboardsManager");

const client = new Client({
  // shards: 'auto',
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
  ],
  sweepers: true,
});

//DO NOT TOUCH UNLESS ADDING OR DELETING NECESSARY FUNCTIONS
const {
  getCategoryDescription,
  toCapitalize,
  calculateUserXp,
  getUserById,
  checkUserPermissions,
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
  getCategoryDescription,
  toCapitalize,
  calculateUserXp,
  getUserById,
  checkUserPermissions,
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

process.on("unhandledRejection", (error) => {
  console.error("Unhandled Promise Rejection:", error);
});

process.on("uncaughtException", (error) => {
  console.error("Uncaught Exception:", error);
});

process.on("warning", (warning) => {
  console.warn("Node.js Warning:", warning);
});

//This one's just for fun
process.on("rejectionHandled", (promise) => {
  console.log("Promise rejection handled:", promise);
});

client.commands = new Collection();
client.slash = new Collection();
client.events = new Collection();
client.aliases = new Collection();
client.afk = new Map();
client.categories = fs.readdirSync('./src/commands/');
client.slashCategories = fs.readdirSync('./src/slashCommands/');
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

// Loads all slash commands.
const rest = new REST().setToken(process.env.token);
const commands = client.slash.map((command) => command.data.toJSON());
(async () => {
  try {
    console.log(`Started refreshing ${commands.length} application (/) commands.`);

    const data = await rest.put(
      Routes.applicationGuildCommands('1090748427232624750', '997715341679530154'),
      { body: commands },
    );
    console.log(`Successfully reloaded ${data.length} application (/) commands.`);
  } catch (error) {
    console.error(error);
  }
})();

client.login(process.env.token);