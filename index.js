/* eslint-disable node/no-extraneous-require */
require('dotenv').config();
// A few things ought to be changed here. Specifically the extremely long and redundant way to retrieve the functions stored in src/utils
const { Client, GatewayIntentBits, Collection, REST} = require("discord.js");

// Check notifications in mongoDB. fix later

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

process.on("unhandledRejection", (error) => {
  console.error("Unhandled Promise Rejection:", error);
});

process.on("uncaughtException", (error) => {
  console.error("Uncaught Exception:", error);
});

process.on("rejectionHandled", (promise) => {
  console.log("Promise rejection handled:", promise);
});

client.slash = new Collection();
client.events = new Collection();

client.slashCategories = fs.readdirSync('./src/slashCommands/');


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