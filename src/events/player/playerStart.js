const { 
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle 
    } = require('discord.js');

module.exports = async (client, player, queue, track) => {
    const sessionState = client.musicSessionStates.get(queue.guild.id),
    timeMs = queue.node.totalDuration,
    durationMs = track.duration;

    // Default Embed sent when player starts
    const embed = new EmbedBuilder()
    .setColor(client.getTrackInfo(track.source).color)
    .setTitle(track.title)
    .setURL(track.url)
    .setAuthor({ name: '♫ | Now Playing', iconURL: client.getTrackInfo(track.source).iconUrl})
    .addFields([
        { name: 'Author', value: track.author, inline: true },
        { name: 'Duration', value: track.duration, inline: true },
        { name: 'Requested By', value: track.requestedBy ? track.requestedBy.username : 'Unknown', inline: true }
    ])
    .setThumbnail(track.thumbnail)
    .setFooter({ text: 'Music provided by One Bot from ' + track.source });

    const rewindButton = new ButtonBuilder()
        .setCustomId('rewind_track')
        .setEmoji('⏮')
        .setStyle(ButtonStyle.Secondary),
    rewind10Button = new ButtonBuilder()
        .setCustomId('rewind_10')
        .setEmoji('⏪')
        .setStyle(ButtonStyle.Secondary),
    pause_playButton = new ButtonBuilder()
        .setCustomId('pause_play')
        .setEmoji('⏸')
        .setStyle(ButtonStyle.Primary),
    forward_10Button = new ButtonBuilder()
        .setCustomId('forward_10')
        .setEmoji('⏩')
        .setStyle(ButtonStyle.Secondary),
    fast_forwardButton = new ButtonBuilder()
        .setCustomId('fast_forward')
        .setEmoji('⏭️')
        .setStyle(ButtonStyle.Secondary),
    loop = new ButtonBuilder()
        .setCustomId('loop_track')
        .setEmoji('🔁')// red for off (0), grey for song (1), green for queue (2), blue for autoplay (3)
        .setStyle(ButtonStyle.Danger);

    const row1 = new ActionRowBuilder() // Playback
        .addComponents(rewindButton, rewind10Button, pause_playButton, forward_10Button, fast_forwardButton),
    row2 = new ActionRowBuilder() // Queue Mastery
        .addComponents(loop);

    let response = await sessionState.message.edit({ embeds:[embed], components: [row1, row2]}),
    filter = (interaction) => {
        return (
          (interaction.isButton() || interaction.isStringSelectMenu()) &&
          interaction.user.id === track.requestedBy.id
        );
      },
    collector = response.createMessageComponentCollector({filter, time: timeMs });

    collector.on('collect', async interaction => {
        if(interaction.isButton()) {
            let currentPositionMs;
            if (queue.node.getTimestamp) {
                currentPositionMs = queue.node.getTimestamp().current.value;
            }
            switch (interaction.customId) {
                case 'rewind_track': {
                    if (currentPositionMs > 10000) {
                        queue.node.seek(0);
                        await interaction.update({ embeds: [embed.setFooter({ text: 'Music provided by One Bot from ' + track.source})]});
                    } else {
                        if (queue.repeatMode > 0){
                            return interaction.channel.send("Unable to rewind to previous track. Queue/Track is currently looped.").then(m => {
                                setTimeout(() => {
                                    m.delete().catch(console.error);
                                }, 10000); 
                            });
                        } else if (!queue.history.tracks.size > 0){
                            return interaction.channel.send("Unable to rewind to previous track. No previous track found.").then(m => {
                                setTimeout(() => {
                                    m.delete().catch(console.error);
                                }, 10000); 
                            });
                        }
                        await queue.history.back();
                        return interaction.update({ embeds: [embed.setFooter({ text: 'Music provided by One Bot from ' + track.source})]});
                    }
                    break;
                }
                case 'rewind_10':{
                    if(currentPositionMs > 10000) {
                        queue.node.seek(currentPositionMs - 10000);
                    } else {
                        queue.node.seek(0);
                    }
                    await interaction.update({ embeds: [embed.setFooter({ text: 'Music provided by One Bot from ' + track.source})]});
                    break;
                }
                case 'pause_play':{
                    if(queue.node.setPaused()){
                        queue.node.setPaused(false);
                        pause_playButton.setEmoji('⏸');
                    } else {
                        queue.node.setPaused(true);
                        pause_playButton.setEmoji('▶️');
                    }
                    await interaction.update({ embeds: [embed], components: [row1, row2] });
                    break;
                }
                case 'forward_10':{
                    if (currentPositionMs + 10000 >= durationMs) {
                        await interaction.deferReply();
                        if (queue.tracks.length > 0) {
                            queue.node.skip();
                            await interaction.editReply('Skipping to the next track...').then(m => {
                                setTimeout(() => {
                                    m.delete().catch(console.error);
                                }, 10000); 
                            });
                        } else {
                            await interaction.editReply('Reached the end of the queue.').then(m => {
                                setTimeout(() => {
                                    m.delete().catch(console.error);
                                }, 10000); 
                            });
                        }
                    } else {
                        queue.node.seek(currentPositionMs + 10000);
                        await interaction.update({ embeds: [embed.setFooter({ text: 'Fast-forwarded 10 seconds.' })] });
                    }
                    break;
                }
            }
        }
    });
};