const { SlashCommandBuilder } = require('discord.js');
const { EmbedBuilder } = require('discord.js');
const fetch = require('node-fetch');

require('dotenv').config();

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Check the bot and API latency.'),
  category: 'info',
  async execute(interaction) {
    const circles = {
      green: "<:WifiGood:1174279497705590794>",
      yellow: "<:WifiMid:1174279484053135370>",
      red: "<:WifiBad:1174279464667066378>"
    };

    const [botLatency, apiLatency] = await Promise.all([
      measureLatency(() => { }),
      measureLatency(() => fetch("https://discord.com/api/users/@me"))
    ]);

    const pingMsg = await interaction.reply('Pinging...');
    const gatewayLatency = interaction.client.ws.ping === -1 ? "N/A" : interaction.client.ws.ping;

    const pembed = new EmbedBuilder()
      .setColor(`${process.env.theme}`)
      .setDescription(
        `Bot Latency: ${formatLatency(botLatency, circles)}
        Discord API: ${formatLatency(apiLatency, circles)}
        Heartbeat: ${formatLatency(gatewayLatency, circles)}`
      )
      .setTimestamp();

    await pingMsg.edit({ content: '', embeds: [pembed] }).catch(console.error);
  },
};

async function measureLatency(action) {
  const start = Date.now();
  await action();
  const end = Date.now();
  const latency = end - start;
  return latency;
}

function formatLatency(latency, circles) {
  if (latency === "N/A") {
    return `\`N/A\``;
  } else {
    return `${latency <= 120 ? circles.green : latency <= 200 ? circles.yellow : circles.red} \`${latency}ms\``;
  }
}
