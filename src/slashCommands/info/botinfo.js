const { EmbedBuilder, SlashCommandBuilder, version: djsversion } = require('discord.js');
const { version } = require('../../../package.json');
const { utc } = require('moment');
const os = require('os');
require('dotenv').config();
const Bot = require('../../../models/Bot.model');
const fs = require('fs');
const path = require('path');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('botinfo')
        .setDescription('Displays a cohesive Report of the bots internals.'),
        category: 'info',
    async execute(interaction) {
        await interaction.deferReply();

        const directorySize = await calculateDirectorySize(path.join(__dirname, '../../../'));
        const formattedSize = formatBytes(directorySize);

        const settings = await Bot.findOne({ bot_id: '1090748427232624750'});
        const core = os.cpus()[0];
        const categories = fs.readdirSync('./src/commands/');
        const memUsage = process.memoryUsage();

        const embed = new EmbedBuilder()
            .setThumbnail(interaction.client.user.displayAvatarURL({ dynamic: true, size: 512 }))
            .setColor(process.env.theme)
            .setTitle(`Bot info for __${interaction.client.user.username}__`)
            .addFields(
                { 
                    name: '❮ General ❯', 
                    value: `**❋ Client:** ${interaction.client.user.tag} (${interaction.client.user.id})
                            **❋ Bot Dev:** fluffydreams
                            **❋ Bot Invite:** [Click Me](${process.env.botInvite} "Endless power at your finger tips, muahaha")
                            **❋ Support Server:** [Click Me](${process.env.supportServer} "I'll take you to the support server!")
                            **❋ Command Categories:** ${categories.length}
                            **❋ Commands:** ${interaction.client.commands.size}
                            **❋ (/) Commands:** ${interaction.client.slash.size}
                            **❋ Total Cmds Used:** ${settings.total_used_cmds.toLocaleString()}
                            **❋ Servers:** ${interaction.client.guilds.cache.size.toLocaleString()}
                            **❋ Users:** ${interaction.client.guilds.cache.reduce((a, b) => a + b.memberCount, 0).toLocaleString()}
                            **❋ Creation Date:** ${utc(interaction.client.user.createdTimestamp).format('MMMM Do, YYYY, HH:mm:ss')}
                            **❋ Node.js:** ${process.version}
                            **❋ Bot Version:** v${version}
                            **❋ Discord.js:** v${djsversion}`
                },
                { 
                    name: '❮ System ❯', 
                    value: `**❋ OS:** ${os.type()} (${os.release()})
                            **❋ System Uptime:** ${duration(os.uptime() * 1000)}
                            **❋ Bot Uptime:** ${duration(interaction.client.uptime)}
                            **❋ CPU:**
                            \u3000 Cores: ${os.cpus().length}
                            \u3000 Model: ${core.model}
                            \u3000 Speed: ${core.speed}MHz
                            **❋ Memory:**
                            \u3000 Total: ${formatBytes(os.totalmem())}
                            \u3000 Free: ${formatBytes(os.freemem())}
                            **❋ Bot Memory Usage:**
                            \u3000 Bot Directory Size: ${formattedSize}
                            \u3000 RSS: ${formatBytes(memUsage.rss)}
                            \u3000 Heap Total: ${formatBytes(memUsage.heapTotal)}
                            \u3000 Heap Used: ${formatBytes(memUsage.heapUsed)}
                            \u3000 External: ${formatBytes(memUsage.external)}
                            **❋ Architecture:** ${os.arch()}
                            **❋ Load Average:** ${os.loadavg().join(' ')}`
                }
            )
            .setTimestamp()
            .setFooter({text: `${interaction.user.username}`, iconURL: interaction.user.displayAvatarURL({ dynamic: true, size: 512 })});

        await interaction.editReply({ content: null, embeds: [embed] });
    }
};

async function calculateDirectorySize(directory) {
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
