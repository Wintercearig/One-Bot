const {
    EmbedBuilder
} = require('discord.js');

module.exports = async (client, player, queue, track) => {
    let color;
    let iconUrl;

    switch (track.source) {
        case 'youtube':
            color = '#FF0000';
            iconUrl = '../../images/youtube-music.png';
            break;
        case 'spotify':
            color = '#1DB954';
            iconUrl = '../../../images/spotify.png';
            break;
        case 'apple':
            color = '#FFFFFF';
            iconUrl = '../../images/applemusic.png';
            break;
        default:
            color = '#000000'; 
            iconUrl = '../../images/default.png';
    }

    const embed1 = new EmbedBuilder()
    .setColor(color)
    .setTitle(track.title)
    .setURL(track.url)
    .setAuthor({ name: ':headphones: | Now Playing'})
    .addFields([
        { name: 'Author', value: track.author, inline: true },
        { name: 'Duration', value: track.duration, inline: true }
    ])
    .setThumbnail(track.thumbnail)
    .setFooter({ text: 'Music provided by ' + track.source });

    queue.metadata.send({ embeds:[embed1]});
};