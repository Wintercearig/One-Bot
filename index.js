/* eslint-disable node/no-extraneous-require */
require('dotenv').config();

const { Client, GatewayIntentBits, Collection, REST, Routes} = require("discord.js"),
{ connect, connection } = require("mongoose"),
fs = require('fs'),
Logger = require("./src/modules/Logger"),
MongStarboardsManager = require("./src/modules/StarboardsManager"),
{ Player } = require("discord-player"),
{ DefaultExtractors } = require("@discord-player/extractor");


const client = new Client({
  // shards: 'auto',
  intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMembers,
      GatewayIntentBits.GuildIntegrations,
      GatewayIntentBits.GuildPresences,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.GuildModeration,
      GatewayIntentBits.GuildExpressions,
      GatewayIntentBits.GuildWebhooks,
      GatewayIntentBits.GuildInvites,
      GatewayIntentBits.GuildVoiceStates,
      GatewayIntentBits.GuildMessageReactions,
      GatewayIntentBits.MessageContent,
      GatewayIntentBits.GuildScheduledEvents,
  ],
  sweepers: true,
});

// entrypoint for discord-player based application
client.player = new Player(client, {
  skipFFmpeg: false,
  ytdlOptions: {
      quality: 'highestaudio',
      filter: 'audioonly',
      highWaterMark: 1 << 25
  },
});

client.player.extractors.unregisterAll();
client.player.extractors.register(DefaultExtractors, {});

/*
 * This makes it easier to use functions without having to require it from functions.js. 
 * Use client.<func>(args)
 */

const {
  errorEmbed,
  getTrackInfo,
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
  updateUserNotifs,
  sendBotUpdates,
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
  errorEmbed,
  getTrackInfo,
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
  updateUserNotifs,
  sendBotUpdates,
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

process.on("rejectionHandled", (promise) => {
  console.log("Promise rejection handled:", promise);
});

client.commands = new Collection();
client.slash = new Collection();
client.cooldowns = new Collection();
client.events = new Collection();
client.aliases = new Collection();
client.afk = new Map();
// Saves music session event discord message ID's, to actively clean message id's
client.musicSessionStates = new Map();

client.categories = fs.readdirSync('./src/commands/');
client.slashCategories = fs.readdirSync('./src/slashCommands/');
client.logger = Logger;
client.starboardsManager = new MongStarboardsManager(client, {
	storage: false,
});

require("./handlers/commands")(client);
require("./handlers/events")(client);

// useNewUrlParser & useUnifiedTopology are deprecated. These options became default in v4.0.0
connect(process.env.mongoDB)
.then(() => {
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