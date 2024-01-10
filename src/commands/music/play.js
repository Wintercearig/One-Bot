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

    const embed = new EmbedBuilder()
    .setColor(process.env.error);

    if(!voiceChannel){
        if(queue){
            return message.channel.send({ embeds: [embed.setDescription(":x: | You are not in a channel, plus it wouldn't matter anyways since I can only play music in one channel, per guild, unless you opt in for premium, which has said feature(In Development).")]});
        } else {
            return message.channel.send({ embeds: [embed.setDescription(":x: | You're not in a voice channel. Join one to get jamming!!")]});
        }
    }

    if (queue && queue.channel.id !== voiceChannel.id) {
        return message.channel.send({ embeds: [embed.setDescription(`:x: | I'm already playing music in a different voice channel!`)]});
    }

    if (voiceChannel.full){
        return message.channel.send({ embeds: [embed.setDescription(':x: | This channel is packed!\nRemove a few people so that I may join.')]});
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
        client.player.play(voiceChannel, searchResult, {
            nodeOptions: {
              metadata: message.channel,
            },
        });

        client.player.events.on('connection', queue => {

        });


    } catch (e) {
        console.error(e);
        message.channel.send({ embeds: [embed.setDescription(`:x: | Something went wrong: ${e.message}`)]});
    }
  }
};