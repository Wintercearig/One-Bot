/* eslint-disable no-mixed-spaces-and-tabs */
const { EmbedBuilder, version: djsversion } = require('discord.js');
const { version } = require('../../../package.json');
const { utc } = require('moment');
const os = require('os');
require('dotenv').config();
const Bot = require('../../../models/Bot.model');
const fs = require('fs');
const path = require('path');

module.exports = {
  name: 'botinfo',
  aliases: ['bot'],
  description: 'Displays the bots status',
  category: "info",
  run: async (client, message) => {
    let loadingMsg = "Bot Info Loading";
    const loadingMessage = await message.channel.send(loadingMsg);

    let dotCount = 0;
    const interval = setInterval(() => {
        dotCount = (dotCount + 1) % 4;
        let dots = ".".repeat(dotCount);
        loadingMessage.edit(`${loadingMsg}${dots}`);
    }, 500);
    await new Promise(resolve => setTimeout(resolve, 3000)); // artificial 3 seconds delay

    const settings = await Bot.findOne({ bot_id: '1090748427232624750'});
	  const core = os.cpus()[0];
    const categories = fs.readdirSync('./src/commands/');
    const memUsage = process.memoryUsage();
    const botDirectory = path.join(__dirname, '../../../');
    const directorySize = getDirectorySize(botDirectory);
    const formattedSize = formatBytes(directorySize);

    clearInterval(interval);

	  const embed = new EmbedBuilder()
		  .setThumbnail(client.user.displayAvatarURL({ dynamic: true, size: 512 }))
		  .setColor(process.env.theme)
      .setTitle(`Bot info for __${client.user.username}__`)
		  .addFields(
        { 
          name: '❮ General ❯', value:
            `**❋ Client:** ${client.user.tag} (${client.user.id})
            **❋ Bot Dev:** fluffydreams
            **❋ Bot Invite:** [Click Me](${process.env.botInvite} "Endless power at your finger tips, muahaha")
            **❋ Support Server:** [Click Me](${process.env.supportServer} "I'll take you to the support server!")
            **❋ Command Categories:** ${categories.length}
			      **❋ Commands:** ${client.commands.size}
            **❋ (/) Commands:** ${client.slash.size}
            **❋ Total Cmds Used:** ${settings.total_used_cmds.toLocaleString()}
			      **❋ Servers:** ${client.guilds.cache.size.toLocaleString()}
			      **❋ Users:** ${client.guilds.cache.reduce((a, b) => a + b.memberCount, 0).toLocaleString()}
			      **❋ Creation Date:** ${utc(client.user.createdTimestamp).format('MMMM Do, YYYY, HH:mm:ss')}
		    	  **❋ Node.js:** ${process.version}
		    	  **❋ Bot Version:** v${version}
		    	  **❋ Discord.js:** v${djsversion}
			  \u200b`
		  })
		  .addFields({ name: '❮ System ❯', value:
			  `**❋ OS:** ${os.type()} (${os.release()})
        **❋ System Uptime:** ${duration(os.uptime() * 1000)}
        **❋ Bot Uptime:** ${duration(client.uptime)}
			  **❋ CPU:**
			  \u3000 Cores: ${os.cpus().length}
			  \u3000 Model: ${core.model}
			  \u3000 Speed: ${core.speed}MHz
        **❋ Memory:**
        \u3000 Total: 32 GB
        \u3000 Free: ${(os.freemem() / 1024 / 1024 / 1024).toFixed(2)} GB
        **❋ Bot Memory Usage:**
        \u3000 Bot Directory Size: ${formattedSize}
        \u3000 RSS: ${(memUsage.rss / 1024 / 1024).toFixed(2)} MB
        \u3000 Heap Total: ${(memUsage.heapTotal / 1024 / 1024).toFixed(2)} MB
        \u3000 Heap Used: ${(memUsage.heapUsed / 1024 / 1024).toFixed(2)} MB
        \u3000 External: ${(memUsage.external / 1024 / 1024).toFixed(2)} MB
        **❋ Architecture:** ${os.arch()}
        **❋ Load Average:** ${os.loadavg().join(' ')}
        \u3000
        **Developed in JS (VsCode) with DJS**`
		  })
		  .setTimestamp()
      .setFooter({text: `${message.author.username}`, iconURL: message.author.displayAvatarURL({ dynamic: true, size: 512 })});
        await loadingMessage.edit({ content: null, embeds: [embed] }).catch(console.error);  },
};

function getDirectorySize(directory) {
  let totalSize = 0;

  function readDirectory(dir) {
    const files = fs.readdirSync(dir);

    for (const file of files) {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);

      if (stat.isDirectory()) {
        readDirectory(filePath);
      } else {
        totalSize += stat.size;
      }
    }
  }

  readDirectory(directory);
  return totalSize;
}

function formatBytes(bytes, decimals = 2) {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

function duration(ms) {
  const sec = Math.floor((ms / 1000) % 60);
  const min = Math.floor((ms / (1000 * 60)) % 60);
  const hrs = Math.floor((ms / (1000 * 60 * 60)) % 24);
  const days = Math.floor(ms / (1000 * 60 * 60 * 24));

  const parts = [];
  if (days) parts.push(`${days}d`);
  if (hrs) parts.push(`${hrs}h`);
  if (min) parts.push(`${min}m`);
  if (sec || parts.length === 0) parts.push(`${sec}s`);

  return parts.join(', ');
}