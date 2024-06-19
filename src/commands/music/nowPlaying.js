const {
    EmbedBuilder
} = require('discord.js');
const { useQueue } = require("discord-player");

module.exports = {
    name: "nowplaying",
    description: "Shows info about the current playing song",
    category: "music",
    aliases: ["np", "currentsong"],
    run: async (client, message) => {
        const voiceChannel = message.member.voice.channel;
        const queue = useQueue(message.guild.id);
        const track = queue?.currentTrack;
        console.log(queue);
        
        if (!voiceChannel) {
            return message.channel.send("You need to join a voice channel first!");
        } else if(!queue) {
            return message.channel.send("You need to play a song to use this command.");
        }

        const embed = new EmbedBuilder()
        .setColor(client.getTrackInfo(track.source).color)
        .setAuthor({ name: '♫ | Now Playing', iconURL: client.getTrackInfo(track.source).iconUrl})
        .setTitle(track.title)
        .setURL(track.url)
        .setDescription(
            `**Requested by:** ${track.requestedBy.toString()}
            **Views:** ${track.views ? client.formatNumber(track.views) : "N/A" }
        ${queue.node.createProgressBar()}`)
        .addFields([
            { name: 'Author', value: track.author, inline: true },
            { name: 'Duration', value: track.duration, inline: true }
        ])
        .setThumbnail(track.thumbnail)
        .setFooter({ text: 'Music provided by ' + track.source });

        if (queue.tracks.data.length > 0) {
            const nextTrack = queue.tracks.data[0];
            embed.addFields({ name: 'Up Next', value: `${nextTrack.title}\n**Requested By:** ${nextTrack.requestedBy.toString()}` });
        }
        return message.channel.send({ embeds: [embed]});
    }
};