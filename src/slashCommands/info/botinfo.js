const { SlashCommandBuilder } = require('discord.js');
const { EmbedBuilder, version: djsversion } = require('discord.js');
const { version } = require('../../../package.json');
const { utc } = require('moment');
const os = require('os');
require('dotenv').config();
const Bot = require('../../../models/Bot.model');
const fs = require('fs');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('botinfo')
    .setDescription('Displays the bot\'s status'),
    category: 'info',
  async execute(interaction) {
    const client = interaction.client;

    const settings = await Bot.findOne({ bot_id: '1090748427232624750' });
    const core = os.cpus()[0];
    const categories = fs.readdirSync('./src/commands/');

    function duration(ms) {
      const sec = Math.floor((ms / 1000) % 60).toString();
      const min = Math.floor((ms / (1000 * 60)) % 60).toString();
      const hrs = Math.floor((ms / (1000 * 60 * 60)) % 24).toString();
      const days = Math.floor((ms / (1000 * 60 * 60 * 24)) % 365).toString();

      let durationString = '';

      if (days !== '0') durationString += `${days}d, `;
      if (hrs !== '0') durationString += `${hrs}h, `;
      if (min !== '0') durationString += `${min}m, `;
      if (sec !== '0' || durationString === '') durationString += `${sec}s`;
      return durationString;
    }

    const embed = new EmbedBuilder()
      .setThumbnail(client.user.displayAvatarURL({ dynamic: true, size: 512 }))
      .setColor(process.env.theme)
      .setTitle(`Bot info for __${client.user.username}__`)
      .addFields(
        {
          name: '❮ General ❯', value:
            `**❋ Client:** ${client.user.tag} (${client.user.id})
            **❋ Bot Owner:** fluffydreams
            **❋ Credits:** fluffydreams
            **❋ Bot Invite:** [Click Me](https://discord.com/oauth2/authorize?client_id=1090748427232624750&permissions=8&scope=bot%20applications.commands)
            **❋ Support Server:** [Click Me](${process.env.supportServer})
            **❋ Command Categories:** ${categories.length}
            **❋ MSG Commands:** ${client.commands.size}
            **❋ (/) Commands:** ${client.slash.size}
            **❋ Total Cmds Used:** ${settings.total_used_cmds}
            **❋ Servers:** ${client.guilds.cache.size.toLocaleString()}
            **❋ Users:** ${client.guilds.cache.reduce((a, b) => a + b.memberCount, 0).toLocaleString()}
            **❋ Channels:** ${client.channels.cache.size.toLocaleString()}
            **❋ Creation Date:** ${utc(client.user.createdTimestamp).format('MMMM Do, YYYY, HH:mm:ss')}
            **❋ Node.js:** ${process.version}
            **❋ Bot Version:** v${version}
            **❋ Discord.js:** v${djsversion}
            \u200b`
        })
      .addFields({
        name: '❮ System ❯', value:
          `**❋ Platform:** ${process.platform}
            **❋ Uptime:** ${duration(client.uptime)}
            **❋ CPU:**
            \u3000 Cores: ${os.cpus().length}
            \u3000 Model: ${core.model}
            \u3000 Speed: ${core.speed}MHz`
      })
      .setTimestamp()
      .setFooter({ text: `${interaction.user.username}`, iconURL: interaction.user.displayAvatarURL({ dynamic: true, size: 512 }) });

    await interaction.reply({ embeds: [embed], ephemeral: true }).catch(console.error);
  },
};