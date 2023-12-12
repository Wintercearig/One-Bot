const { EmbedBuilder } = require("discord.js");
const fetch = require('node-fetch');

require('dotenv').config();
module.exports = {
    name: 'ping',
    description: 'Check the bot and API latency.',
    aliases: ['pong'],
    category: 'info',
    run: async (client, message) => {
      let circles = {
        green: "<:WifiGood:1174279497705590794>",
        yellow: "<:WifiMid:1174279484053135370>",
        red: "<:WifiBad:1174279464667066378>"
    };

    const [botLatency, apiLatency] = await Promise.all([
      measureLatency(() => { }),
      measureLatency(() => fetch("https://discord.com/api/users/@me"))
    ]);

    const pingMsg = await message.channel.send('Pinging...');
    const gatewayLatency = client.ws.ping === -1 ? "N/A" : client.ws.ping;

    let pembed = new EmbedBuilder()
      .setColor(`${process.env.theme}`)
      .setDescription(
        `Bot Latency: ${formatLatency(botLatency, circles)}
        Discord API: ${formatLatency(apiLatency, circles)}
        Heartbeat: ${formatLatency(gatewayLatency, circles)}`
      )
      .setTimestamp();
      await pingMsg.edit({ content: '', embeds:[pembed] }).catch(console.error);
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
  if (latency === "N/A"){
    return `\`N/A\``;
  } else {
    return `${latency <= 120 ? circles.green : latency <= 200 ? circles.yellow : circles.red} \`${latency}ms\``;
  }
}
