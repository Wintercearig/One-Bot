const { EmbedBuilder } = require('discord.js');

module.exports = async (client, player, queue, oldFilters, newFilters) => {
    const channel = queue.metadata.channel;

    const formatEqualizerBands = (bands) => bands.map(band => `Band ${band.band}: ${band.gain} dB`).join('\n') || 'None';

    const oldFiltersDescription = formatEqualizerBands(oldFilters);
    const newFiltersDescription = formatEqualizerBands(newFilters);

    const equalizerUpdateEmbed = new EmbedBuilder()
        .setColor('#0099ff')
        .setTitle('Equalizer Updated')
        .setDescription('The equalizer configuration has been updated.')
        .addFields(
            { name: 'Previous Configuration', value: oldFiltersDescription, inline: true },
            { name: 'New Configuration', value: newFiltersDescription, inline: true }
        )
        .setTimestamp();

    channel.send({ embeds: [equalizerUpdateEmbed] });
};
