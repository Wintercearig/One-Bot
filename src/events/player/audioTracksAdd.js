const { EmbedBuilder } = require('discord.js');

module.exports = async (client, player, queue, tracks) => {
    const channel = queue.metadata.channel;

    let tracksList = tracks.slice(0, 5).map((track, index) => `${index + 1}. ${track.title}`).join('\n');
    if (tracks.length > 5) {
        tracksList += `\n...and ${tracks.length - 5} more tracks added`;
    }

    const tracksAddEmbed = new EmbedBuilder()
        .setColor('#12db4e')
        .setTitle('Tracks Added')
        .setDescription(tracksList)
        .setTimestamp();

    channel.send({ embeds: [tracksAddEmbed] }).then(m => {
        setTimeout(() => {
            m.delete().catch(console.error);
        }, 10000); 
    });
};