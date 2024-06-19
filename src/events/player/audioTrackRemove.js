const { EmbedBuilder } = require('discord.js');

module.exports = async (client, player, queue, track) => {
    const channel = queue.metadata.channel;

    const trackRemovedEmbed = new EmbedBuilder()
        .setColor('#732628')
        .setTitle('Track Removed')
        .setDescription(`**${track.title}** by *${track.author}* has been removed from the queue.`)
        .setTimestamp();

    channel.send({ embeds: [trackRemovedEmbed] }).then(m => {
        setTimeout(() => {
            m.delete().catch(console.error);
        }, 10000); 
    });
};
