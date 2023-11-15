const { EmbedBuilder } = require("discord.js");

require('dotenv').config();
module.exports = {
    name: 'ping',
    description: 'Check the bot and API latency.',
    category: 'info',
    run: async (client, message) => {
      // Calculate the round-trip latency (ping) between the bot and the user
      let circles = {
        green: "🟢",
        yellow: "🟡",
        red: "🔴"
    };
    const msg = await message.channel.send(`🏓 Pinging....`);
    let ping = msg.createdTimestamp - message.createdTimestamp;
    let formattedDate = client.formattedDate();

    let pembed = new EmbedBuilder()
      .setColor(`${process.env.theme}`)
      .setTitle("🏓 Pong!")
      .setThumbnail(message.guild.iconURL({ dynamic: true, size: 512 }))
      .setDescription(`${client.ws.ping <= 200 ? circles.green : client.ws.ping <= 400 ? circles.yellow : circles.red} **| :** ${client.ws.ping}ms\n\n` +
      `\n${ping <= 200 ? circles.green : ping <= 400 ? circles.yellow : circles.red} **| RoundTrip:** ${ping} ms`)
      .setTimestamp()
      .setFooter({text: `${formattedDate}`});
  
      msg.edit({ content: '', embeds:[pembed] }).catch(console.error);
  },
};
  