const {
    EmbedBuilder
} = require('discord.js');
const { useQueue } = require("discord-player");

module.exports = {
  name: "play",
  description: "Play a song",
  aliases: ["p"],
  category: "music",
  botPermissions: ['ViewChannel', 'Connect', 'Speak'],
  usage: "<youtube link | song name>",
  run: async (client, message, args) => {
    let query = args.join(" ");
    const voiceChannel = message.member.voice.channel;
    const queue = useQueue(message.guild.id);
    const member = message.guild.members.cache.get(message.author.id);
    await message.delete();

    const embed = new EmbedBuilder()
    .setColor(process.env.error);

    if(!voiceChannel){
        return message.channel.send({ embeds: [embed.setDescription(":x: | You're not in a voice channel. Join one to get jamming!!")]});
    }

    if (queue && queue.channel.id !== voiceChannel.id) {
        return message.channel.send({ embeds: [embed.setDescription(`:x: | I'm already playing music in a different voice channel!`)]});
    }

    if (voiceChannel.full){
        return message.channel.send({ embeds: [embed.setDescription(':x: | This channel is packed!\nRemove someone or change the user limit so that I may join.')]});
    }

    if(message.member.voice.deaf){
        return message.channel.send({ embeds: [embed.setDescription(`:x: | You can't run this command while deafened!`)]});
    }

    if (message.guild.members.me?.voice?.mute){
        return message.channel.send({ embeds: [embed.setDescription(':x: | Please unmute me before playing.')]});
    }

    if (!query) {
        return message.channel.send({ 
            embeds: [embed.setDescription(':x: | You must provide a link or song name!')
        ]});
    }

    const searchResult = await client.player
    .search(query, { requestedBy: member})
    .catch(() => null);

    if (!searchResult?.hasTracks()){
        return message.channel.send({ embeds: [embed.setDescription(`:x: | No track found for: ${query}`)]});
    }

    try {
        // Player events are in src/events/player
        client.player.play(voiceChannel, searchResult, {
            nodeOptions: {
              metadata: { // Very necessary for player events n such
                channel: message.channel,
                startedBy: message.author
              },
              voiceChannel: voiceChannel // How the bot plays music/connects to said channel
            },
            selfDeaf: true,
            volume: 80,
            leaveOnEnd: false,
            leaveOnStop: false,
            leaveOnEmpty: true,
            connectionTimeout: 30000
        });
    } catch (e) {
        console.error(e);
        message.channel.send({ embeds: [embed.setDescription(`:x: | Something went wrong: ${e.message}`)]});
    }
  }
};