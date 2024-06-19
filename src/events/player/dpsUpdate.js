const { EmbedBuilder } = require('discord.js');

module.exports = async (client, player, queue, oldFilters, newFilters) => {
    const oldFiltersList = oldFilters.length > 0 ? oldFilters.join(', ') : 'None';
    const newFiltersList = newFilters.length > 0 ? newFilters.join(', ') : 'None';
    const channel = queue.metadata.channel;

    const dspUpdateEmbed = new EmbedBuilder()
        .setColor('#02a355')
        .setTitle('DSP Filters Updated')
        .addFields(
            { name: 'Previous Filters', value: oldFiltersList, inline: true },
            { name: 'Current Filters', value: newFiltersList, inline: true }
        )
        .setTimestamp();

    channel.send({ embeds: [dspUpdateEmbed] });
};
