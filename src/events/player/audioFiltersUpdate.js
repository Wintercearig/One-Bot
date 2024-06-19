const { EmbedBuilder } = require('discord.js');

module.exports = async (client, player, queue, oldFilters, newFilters) => {
    const channel = queue.metadata.channel;

    let description = '';

    if (oldFilters.length > 0) {
        description += `**Old Filters:**\n${oldFilters.join(', ')}\n\n`;
    } else {
        description += '**Old Filters:** None\n\n';
    }

    if (newFilters.length > 0) {
        description += `**New Filters:**\n${newFilters.join(', ')}`;
    } else {
        description += '**New Filters:** None';
    }

    const filtersUpdateEmbed = new EmbedBuilder()
        .setColor('#02a355')
        .setTitle('Audio Filters Updated')
        .setDescription(description)
        .setTimestamp();

    channel.send({ embeds: [filtersUpdateEmbed] });
};
