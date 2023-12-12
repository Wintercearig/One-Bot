const Guild = require('../../../models/Guild.model');

require('dotenv').config();
module.exports = {
    name: 'prefix',
    description: 'Sets the prefix for this server.',
    usage: `prefix [newPrefix]`,
    category: "moderation",
    run: async (client, message, args) => {
        message.delete();

        if (!message.member.hasPermission('MANAGE_GUILD')) {
            return message.channel.send('You do not have permission to use this command!').then(m => m.delete({timeout: 10000}));
        }

        const settings = await Guild.findOne({
            guild_id: message.guild.id
        }, (err, guild) => {
            if (err) console.error(err);
            if (!guild) {
                const newGuild = new Guild({
                    guild_id: message.guild.id,
                    prefix: process.env.prefix
                });

                newGuild.save()
                .then(result => console.log(result))
                .catch(err => console.error(err));
            }
        });

        if (args.length < 1) {
            return message.channel.send(`Your current server prefix is \`${settings.prefix}\`
            To change your servers prefix, retype the command but provide a prefix!`).then(m => {
                setTimeout(() => {
                    m.delete().catch(console.error);
                }, 10000); 
            });
        }

        if (args[0] === settings.prefix) {
          return message.channel.send(`The given prefix can't be the same as the prefix that is already set for this server!`).then(m => {
            setTimeout(() => {
                m.delete().catch(console.error);
            }, 10000); 
        });
        }
        
          await settings.updateOne({
              prefix: args[0]
          });

        return message.channel.send(`Your server prefix has been updated to \`${args[0]}\``).then(m => {
            setTimeout(() => {
                m.delete().catch(console.error);
            }, 10000); 
        }).catch(console.error);
    }
};