const { EmbedBuilder } = require("discord.js");
require('dotenv').config();

module.exports = {
  name: 'ban',
  description: 'Bans the mentioned user. Reason is optional!',
  usage: 'ban <user/id> [reason]',
  category: 'moderation',
  memberPermissions: ['BAN_MEMBERS'],
  run: async(client, message, args) => {
    message.delete();
    const guild = await client.getGuildById(message.guild.id);

    let banned = message.mentions.members.first() || message.guild.members.cache.get(args[0]) || message.guild.members.cache.find(m => m.user.username === args[0]) || message.guild.members.cache.find(m => m.user.tag === args[0]) || message.guild.members.cache.find(m => m.user.id === args[0]);

    if (!banned) {
      let baninfoembed = new EmbedBuilder()
        .setTitle("Command: Ban")
        .setDescription(
          `**Description:** Bans an individual
            **Usage:** ban <user/ID> [reason]`
        )
        .setColor(`${process.env.theme}`);
        return message.channel.send({ embeds: [baninfoembed]}).then(m => {
          setTimeout(() => {
              m.delete().catch(console.error);
          }, 10000); 
      });
    }

    let reason = args.slice(1).join(" ");
    if (!reason) reason = "No reason specified";

    if (!banned.bannable) {
        if(banned.id === message.author.id) {
            return message.channel.send(`You can't ban yourself.`).then(m => {
              setTimeout(() => {
                  m.delete().catch(console.error);
              }, 10000); 
          });
        } else {
            let userHighestRole = banned.roles.highest;
            let botMember = message.guild.members.cache.get(client.user.id); // Get the bot's member in the server

            let botHighestRole = botMember.roles.highest;

            if (userHighestRole.comparePositionTo(botHighestRole) >= 0) {
                let notBannable = new EmbedBuilder()
                .setDescription(`:x: | You can't ban this user due to role hierarchy!`)
                .setColor('#FF0000');
                return message.channel.send({ embeds: [notBannable]}).then(m => {
                  setTimeout(() => {
                      m.delete().catch(console.error);
                  }, 10000); 
              }).catch(console.error);
              } else {
                let notBannable = new EmbedBuilder()
                .setDescription(`:x: | This user has a role that prevents them from being banned!`)
                .setColor('#FF0000');
                return message.channel.send({ embeds: [notBannable]}).then(m => {
                  setTimeout(() => {
                      m.delete().catch(console.error);
                  }, 10000); 
              }).catch(console.error);
              }
        }
    }

    message.guild.members.ban(banned, { reason: reason })
    .then(async () => {
        let createdCase = await client.addCase(message.guild.id, message.author.id, banned.id, "banned", reason);

        if (guild.modlogs && guild.modelogs.enabled === true) {
            let modLogsChannelID = guild.modlogs.channelID;
            let modLogsChannel = guild.channels.cache.get(modLogsChannelID);
            if (modLogsChannel) {
                let modlogsEmbed = new EmbedBuilder()
                .setColor('#FF0000')
                .setAuthor({
                    name: ` User Case ${createdCase.caseID} | ${banned.name}`,
                    iconURL: banned.user.displayAvatarURL({ dynamic: true, size: 512 })
                });
                modLogsChannel.send({ embed: modlogsEmbed });
            } else {
                return message.channel.send(`${message.author.id}, the modlogs channel that was set either no longer exists, or something went wrong`).then(m => {
                  setTimeout(() => {
                      m.delete().catch(console.error);
                  }, 10000); 
              });
            }
        } else {
          let bannedInfo = new EmbedBuilder()
          .setColor('#FF0000')
          .setAuthor({
              name: `User Case ${createdCase.caseID} | ${banned.name}`,
              iconURL: banned.user.displayAvatarURL({ dynamic: true, size: 512 })
          });
          message.channel.send({ embed: [bannedInfo] });
        }
    });
  }
};