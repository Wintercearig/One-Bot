const { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');
const chalk = require('chalk');

module.exports = {
  name: 'action',
  aliases: ['act'],
  category: "info",
  description: 'Displays a specified user\'s information.',
  run: async (client, message) => {
    // Create a row of buttons
    const row = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('button1')
          .setLabel('Start')
          .setStyle(ButtonStyle.Primary),
      )
      .addComponents(
        new ButtonBuilder()
          .setCustomId('button2')
          .setLabel('Choice 2')
          .setStyle(ButtonStyle.Secondary),
      );

    // Create a simple MessageEmbed
    const embed = new EmbedBuilder()
      .setTitle('Welcome to the Server!')
      .setDescription(
        `Thank you for adding our bot to your server.
        If this is your first time setting up the discord bot, continue by pressing ` + chalk.blue('Start'))
      .setColor(0x0099ff);

    // Send the MessageEmbed with buttons to a text channel in the server
    const response = await message.reply({ embeds: [embed], components: [row] });

    const collectorFilter = (i) => i.customId;

    try {
      const confirmation = await response.awaitMessageComponent({ filter: collectorFilter, time: 60000 });

      switch (confirmation.customId) {
        case 'button1':{
          let updatedEmbed1 = new EmbedBuilder()
            .setTitle('Updated Embed - Choice 1')
            .setDescription('This is the updated information for Choice 1.')
            .setColor(0x00ff00);

          await confirmation.update({ embeds: [updatedEmbed1], components: [] });
          break;
        }
        case 'button2': {
          let updatedEmbed2 = new EmbedBuilder()
            .setTitle('Updated Embed - Choice 2')
            .setDescription('This is the updated information for Choice 2.')
            .setColor(0xff0000);

          await confirmation.update({ embeds: [updatedEmbed2], components: [] });
          break;
        }
        default: {
          await response.update({ content: 'Invalid custom ID', components: [] });
          break;
        }
      }
    } catch (e) {
        // The awaitMessageComponent call timed out
        const errorE = new EmbedBuilder()
        .setDescription('Interaction has timed out TEST');

         response.edit({ embeds: [errorE]}, { components: [] })
      .then(msg => {
        setTimeout(() => {
          msg.delete();
        }, 10000); // 10 seconds
      });   
    }
  }
};
