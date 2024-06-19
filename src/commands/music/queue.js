const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { useQueue } = require("discord-player");
let lastQueueCollector = {};

module.exports = {
    name: "queue",
    description: "Displays the current queue",
    aliases: ["q"],
    category: "music",
    run: async (client, message) => {
        const voiceChannel = message.member.voice.channel;
        const queue = useQueue(message.guild.id);

        if (!voiceChannel) {
            return message.channel.send("You need to join a voice channel first!");
        }

        if (!queue || !queue.tracks.data.length) {
            return message.channel.send("There is nothing in the queue!");
        }

        if (lastQueueCollector[message.guild.id]) {
            lastQueueCollector[message.guild.id].collector.stop();
            try {
                const oldMessage = await message.channel.messages.fetch(lastQueueCollector[message.guild.id].messageId);
                if (oldMessage) {
                    await oldMessage.delete();
                }
            } catch (error) {
                if (error.code !== 10008) {
                    console.error(error);
                }
            }
        }

        const maxSongsPerPage = 5;
        let page = 0;
        const queueLength = queue.tracks.data.length;
        const totalPages = Math.ceil(queueLength / maxSongsPerPage);

        const generateEmbed = start => {
            const current = queue.tracks.data.slice(start, start + maxSongsPerPage);
            return new EmbedBuilder()
                .setColor(client.getTrackInfo(queue.currentTrack.source).color)
                .setTitle(`♫ | Music Queue - Page ${start / maxSongsPerPage + 1}`)
                .setDescription(`**Currently Playing:** [${queue.currentTrack.title}](${queue.currentTrack.url})\n**Requested By:** ${queue.currentTrack.requestedBy}\n\n` + 
                    current.map((track, i) => `**${start + i + 1}**: [${track.title}](${track.url}) | **${track.author}**\nRequested By: ${track.requestedBy}`).join('\n'))
                .setFooter({ text: `Songs ${start + 1}-${start + current.length} out of ${queue.tracks.data.length}` });
        };

        const queueMessage = await message.channel.send({ embeds: [generateEmbed(0)] });

        if (queueLength > maxSongsPerPage) {
            let buttons = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('previousbtn')
                        .setLabel('Previous')
                        .setStyle(ButtonStyle.Primary)
                        .setDisabled(page === 0),
                    new ButtonBuilder()
                        .setCustomId('nextbtn')
                        .setLabel('Next')
                        .setStyle(ButtonStyle.Primary)
                        .setDisabled(page === totalPages - 1)
                );

            await queueMessage.edit({ components: [buttons] });

            const filter = (i) => i.user.id === message.author.id;
            const collector = queueMessage.createMessageComponentCollector({ filter, time: 60000 });
            lastQueueCollector[message.guild.id] = {
                collector: collector,
                messageId: queueMessage.id
            };

            collector.on('collect', async i => {
                if (i.customId === 'previousbtn' && page > 0) {
                    page--;
                } else if (i.customId === 'nextbtn' && page < totalPages - 1) {
                    page++;
                }

                // Update buttons state for the new page
                buttons.components[0].setDisabled(page === 0);
                buttons.components[1].setDisabled(page >= totalPages - 1);
                await i.update({ embeds: [generateEmbed(page * maxSongsPerPage)], components: [buttons] });
            });

            collector.on('end', async () => {
                try {
                    const existingMessage = await message.channel.messages.fetch(queueMessage.id);
                    if (existingMessage) {
                        await existingMessage.edit({ 
                            embeds: [generateEmbed(0).setFooter({ text: 'This queue menu expired.' })],
                            components: []
                        });
                    }
                } catch (error) {
                    if (error.code !== 10008) {
                        console.error(error);
                    }
                }
            });
        } else {
            lastQueueCollector[message.guild.id] = null;
        }
    }
};
