const { 
    EmbedBuilder 
} = require('discord.js');

module.exports = async (client, player, queue, track) => {
    const channel = queue.metadata.channel;

    if (queue.currentTrack && queue.tracks.size >= 1) {
        const addedToQueue = new EmbedBuilder()
            .setColor(client.getTrackInfo(track.source).color)
            .setTitle(track.title)
            .setURL(track.url)
            .setAuthor({ name: `♫ | Track Queued - Position ${queue.tracks.size}`, iconURL: client.getTrackInfo(track.source).iconUrl})
            .addFields([
                { name: 'Author', value: track.author, inline: true },
                { name: 'Duration', value: track.duration, inline: true },
                { name: 'Requested By', value: track.requestedBy ? track.requestedBy.username : 'Unknown', inline: true }
            ])
            .setThumbnail(track.thumbnail)
            .setFooter({ text: 'Music provided by ' + track.source });

        return channel.send({ embeds: [addedToQueue]}).then(m => {
            setTimeout(() => {
                m.delete().catch(console.error);
            }, 10000); 
        });
    }
};