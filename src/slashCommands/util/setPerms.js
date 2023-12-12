const { SlashCommandBuilder } = require('discord.js');
const stringSimilarity = require('string-similarity');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('setperms')
    .setDescription('Set custom permissions for a command')
    .addStringOption(option =>
      option
        .setName('command')
        .setDescription('The command to set permissions for')
        .setRequired(true),
    )
    .addStringOption(option =>
      option
        .setName('permissions')
        .setDescription('The permissions to set (comma-separated)')
        .setRequired(true),
    ),
    category: 'util',
  async execute(client, interaction) {
    const guildId = interaction.guild.id;
    const guild = await client.getGuildById(guildId);

    const command = interaction.options.getString('command');

    let allCommands = client.commands.map(cmd => cmd.name.toLowerCase());

    /*
    Sim rating is greater than 0.5, sends what the bot believes they meant, like an autocorrect
    Else if rating is practically 0, then the algorithm couldn't find a best match.
    */
    stringSimilarity.findBestMatch(command.toLowerCase(), allCommands).bestMatch.rating > 0.5
      ? interaction.reply(
          `It appears that I don't have this command\nDid you mean: \`${stringSimilarity.findBestMatch(
            command.toLowerCase(),
            allCommands,
          ).bestMatch.target}\`?`,
        )
      : interaction.reply(
          `It appears my algorithm doesn't believe this, or a similar command, exists.\nCheck your spelling or run the \`${guild.prefix}help\` command`,
        );

    // return interaction.reply({embeds: [embed.setColor('#ff0000').setDescription(info)]});
    const permissionsInput = interaction.options.getString('permissions');
    const userPermissions = permissionsInput.split(',').map(permission => permission.trim());

    const validPermissions = [
      'CreateInstantInvite', 'KickMembers', 'BanMembers',
      'Administrator', 'ManageChannels', 'ManageGuild',
      'AddReactions', 'ViewAuditLog', 'PrioritySpeaker',
      'Stream', 'ViewChannel', 'SendMessages',
      'SendTTSMessages', 'ManageMessages', 'EmbedLinks',
      'AttachFiles', 'ReadMessageHistory', 'MentionEveryone',
      'UseExternalEmojis', 'ViewGuildInsights', 'Connect',
      'Speak', 'MuteMembers', 'DeafenMembers',
      'MoveMembers', 'UseVAD', 'ChangeNickname',
      'ManageNicknames', 'ManageRoles', 'ManageWebhooks',
      'ManageEmojisAndStickers', 'ManageGuildExpressions', 'UseApplicationCommands',
      'RequestToSpeak', 'ManageEvents', 'ManageThreads',
      'CreatePublicThreads', 'CreatePrivateThreads', 'UseExternalStickers',
      'SendMessagesInThreads', 'UseEmbeddedActivities', 'ModerateMembers',
      'ViewCreatorMonetizationAnalytics', 'UseSoundboard', 'UseExternalSounds',
      'SendVoiceMessages',
    ];

    // Find the closest matches for each user-provided permission
    const closestPermMatch = userPermissions.map(permission =>
      stringSimilarity.findBestMatch(permission, validPermissions).bestMatch.target,
    );
  },
};
