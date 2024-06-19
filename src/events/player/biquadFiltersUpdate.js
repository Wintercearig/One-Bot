const { EmbedBuilder } = require('discord.js');

module.exports = async (client, player, queue, oldFilters, newFilters) => {
    const channel = queue.metadata.channel;

    let description = '';

    if (oldFilters) {
        description += `**Old Filters:**\n${JSON.stringify(oldFilters, null, 2)}\n\n`;
    } else {
        description += '**Old Filters:** None\n\n';
    }

    if (newFilters) {
        description += `**New Filters:**\n${JSON.stringify(newFilters, null, 2)}`;
    } else {
        description += '**New Filters:** None';
    }

    const filtersUpdateEmbed = new EmbedBuilder()
        .setColor('#02a355')
        .setTitle('Biquad Filters Updated')
        .setDescription(description)
        .setTimestamp();

    channel.send({ embeds: [filtersUpdateEmbed] });
};
