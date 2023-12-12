const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('test')
    .setDescription('Get information about a user')
    .addUserOption(option =>
      option
        .setName('target')
        .setDescription('The user to get information about')
        .setRequired(true)
    )
    .addBooleanOption(option =>
      option
        .setName('show-avatar')
        .setDescription('Whether to show the avatar')
    )
    .addStringOption(option =>
      option
        .setName('custom-message')
        .setDescription('A custom message to include in the response')
    ),
    category: 'info',
  async execute(interaction) {
    const targetUser = interaction.options.getUser('target');
    const showAvatar = interaction.options.getBoolean('show-avatar');
    const customMessage = interaction.options.getString('custom-message');

    let response = `Information about ${targetUser.username}:`;

    if (showAvatar) {
      response += `\nAvatar: ${targetUser.displayAvatarURL()}`;
    }

    if (customMessage) {
      response += `\nCustom Message: ${customMessage}`;
    }

    await interaction.reply(response);
  },
};