const { EmbedBuilder } = require('discord.js');

module.exports = async (client, player, queue) => {
    const channel = queue.metadata.channel;
    const startedByUser = queue.metadata.startedBy;

    // Fetch the voice state of the bot and the author
    const botVoiceState = await queue.guild.members.me.voice;
    const authorVoiceState = await queue.guild.members.fetch(startedByUser.id).then(member => member.voice);

    // Determine the appropriate channel descriptions based on whether they're in a category
    const botChannelDescription = botVoiceState.channel?.parent
        ? `${botVoiceState.channel.parent.name} -> ${botVoiceState.channel.toString()}`
        : botVoiceState.channel?.toString();

    const authorChannelDescription = authorVoiceState.channel?.parent
        ? `${authorVoiceState.channel.parent.name} -> ${authorVoiceState.channel.toString()}`
        : authorVoiceState.channel?.toString();

    // Determine the message description based on the bot's presence in a channel
    const description = botVoiceState.channel
        ? `👍| Already in channel: ${botChannelDescription}\n💿| Activating player...`
        : `👍| Joined: ${authorChannelDescription}\n📄| Bounded in: ${channel.toString()}`;

    const embed = new EmbedBuilder()
        .setColor(process.env.success)
        .setDescription(description)
        .setFooter({ text: `Started By: ${startedByUser.username}` });

    const sentMessage = await channel.send({ embeds: [embed] });
    client.musicSessionStates.set(queue.guild.id, { message: sentMessage });
};