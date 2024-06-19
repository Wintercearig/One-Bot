const { EmbedBuilder } = require('discord.js');

module.exports = async (client, player, queue, tracks) => {
    const channel = queue.metadata.channel;

    let tracksList = tracks.slice(0, 5).map((track, index) => `${index + 1}. ${track.title}`).join('\n');
    if (tracks.length > 5) {
        tracksList += `\n...and ${tracks.length - 5} more tracks removed`;
    }

    const tracksRemoveEmbed = new EmbedBuilder()
        .setColor('#732628')
        .setTitle('Tracks Removed')
        .setDescription(tracksList)
        .setTimestamp();

    channel.send({ embeds: [tracksRemoveEmbed] });
};
