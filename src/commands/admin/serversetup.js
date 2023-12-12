const { 
  ActionRowBuilder,
  ButtonBuilder,
  EmbedBuilder
} = require('discord.js'),
Guild = require('../../../models/Guild.model');

module.exports = {
  name: 'serversetup',
  description: 'Just a basic server setup command.',
  aliases: ['srvrsetup', 'srvrset', 'setup'],
  category: "admin",
  usage: 'serversetup',
  memberPermissions: ['MANAGE_GUILD'],
  run: async (client, message) => {
    const guild = await Guild.findOne({ guild_id: message.guild.id });
    const responseArray  = [];

    const welcomeMessage = new EmbedBuilder()
      .setTitle(guild.config.usedSetup ? 'Welcome back!' : 'Welcome to One-Bot!')
      .setDescription(guild.config.usedSetup
        ? 'You can change your configurations via the config command. If you wish to proceed, hit Start.'
        : `Thank you for adding our bot to your server.
        If this is your first time setting up one bot, continue by pressing Start.`
      )
      .setColor(process.env.theme);
  }
};