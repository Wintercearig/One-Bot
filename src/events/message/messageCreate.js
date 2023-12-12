/* eslint-disable no-unused-vars */
// eslint-disable-next-line no-unused-vars
require('dotenv').config();
const { EmbedBuilder } = require("discord.js"),
BotModel = require('../../../models/Bot.model'),
UserModel = require('../../../models/User.model'),
Guild = require('../../../models/Guild.model');

module.exports = async (client, message) => {
	const guildId = message.guild.id;
	const userId = message.author.id;
	const guild = await client.getGuildById(guildId);
	const mentions = message.mentions.members;

	if (message.content === `<@${client.user.id}>`) {

		const prefixing = new EmbedBuilder()
			.setTitle(`${client.user.username}`)
			.setThumbnail(client.user.displayAvatarURL({ dynamic: true, size: 512 }))
			.setDescription(
				`*Thank you for pinging me!*
				Did you know that you can use the bots prefix as its own prefix? This is something useful in case you ever forget the bots prefix!
				The bots prefix for this server is \`${
					guild.prefix
				}\`. Try \`${guild.prefix}help\`!
				This message will self destruct in 15 seconds.`
			)
			.setColor(process.env.theme)
			.setTimestamp();

		return message.channel.send({ embeds: [prefixing] }).then((sentMessage) => {
			message.delete();
			setTimeout(() => sentMessage.delete(), 15000);
		});
	}

	const mprefix = new RegExp(`^<@!${client.user.id}>`);
	const sprefix = new RegExp(`${guild.prefix}`);
	let prefix;

	if (message.content.match(mprefix)) {
		prefix = message.content.match(mprefix)[0];
	} else if (message.content.match(sprefix)) {
		prefix = message.content.match(sprefix);
	}

	if (message.author.bot || message.channel.type === "dm" || !message.content.startsWith(prefix)) return;

	const args = message.content
		.slice(prefix.length)
		.trim()
		.split(/ +/g);
	const command = args.shift().toLowerCase();
	const cmd =
		client.commands.get(command) ||
		client.commands.get(client.aliases.get(command));
		if (!cmd) {
			return;
		}

	if (client.commands.has(cmd.name)) {
		const _client =
		(await BotModel.findOne({ bot_id: client.user.id })) ||
		(await BotModel.create({ bot_id: client.user.id }));

	_client.total_used_cmds = (_client.total_used_cmds || 0) + 1;

	_client.save();
		if (cmd.ownerOnly && !process.env.owners.includes(message.author.id)) {
			return message.reply(
				'This command can only be used by the bot owners!'
			);
		}

		if (cmd.requiredArgs && args.length < cmd.requiredArgs.length) {
			const cmdArgs = cmd.requiredArgs.map(a => `\`${a}\``).join(', ');
			const cmdExample = `${prefix}${cmd.name} ${cmd.requiredArgs
				.map(a => `<${a}>`)
				.join(' ')}`;

			const embed = new EmbedBuilder()
				.setTitle('Incorrect command usage')
				.setColor('RED')
				.setDescription(`:x: | You must provide more args: ${cmdArgs}`)
				.addField('Example:', cmdExample);

			return message.channel.send({ embeds: [embed]});
		}

		if (cmd.botPermissions) {
			const neededPermissions = [];
			cmd.botPermissions.forEach(perm => {
				if (!message.channel.permissionsFor(message.guild.me).has(perm)) {
					neededPermissions.push(perm);
				}
			});

			if (neededPermissions[0]) {
				return message.channel.send({ embeds: [client.errorEmbed(neededPermissions, message)]});
			}
		}

		if (guild.customPerms && guild.customPerms[cmd.name]) {
			const neededPermissions = []; guild.customPerms[cmd.name];

			if(!message.member.permissions.has(neededPermissions)){
				return message.channel.send({content: 
					`You need: ${neededPermissions
					.map(p => `\`${p.toUpperCase()}\``)
					.join(', ')} permissions to use this command!`});
			}
		} else if (cmd.memberPermissions) {
			const neededPermissions = [];
			cmd.memberPermissions.forEach(perm => {
				if (!message.member.permissions.has(perm)) {
					neededPermissions.push(perm);
				}
			});

			if (neededPermissions.length > 0) {
				return message.channel.send({content:
					`You need: ${neededPermissions
					.map(p => `\`${p.toUpperCase()}\``)
					.join(', ')} permissions to use this command!`}
				).then(m => {
					setTimeout(() => {
						m.delete().catch(console.error);
					}, 10000); 
				});
			}
		}

		if (cmd.nsfwOnly && cmd.nsfwOnly === true && !message.channel.nsfw) {
			return message.channel.send(
				'This channel is SFW! Please migrate to an NSFW channel!'
			);
		}
		
		cmd.run(client, message, args);
	} else {
		return;
	}
};

