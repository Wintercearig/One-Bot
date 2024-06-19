const { EmbedBuilder } = require('discord.js');

module.exports = async (client, player, queue) => {
    const embed = new EmbedBuilder();
    const sessionState = client.musicSessionStates.get(queue.guild.id);

    // Check if the queue is empty (bot finished playing)
    if (!queue.tracks.size) {
        embed.setDescription(`
            My job here is done, leaving now!
            If you want me to stay in the channel 24/7, you need premium!
            ${process.env.experimental}
            `);
    } else {
        // Bot was manually disconnected
        // or an error caused the bot to leave
        embed.setDescription(`
            I've been disconnected from the channel.
            If this was a mistake, just call me back!`);
    }

    sessionState.message.edit({ embeds: [embed], components: [] });

    client.musicSessionStates.delete(queue.guild.id);

};
