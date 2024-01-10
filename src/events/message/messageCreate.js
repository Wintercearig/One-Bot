/* eslint-disable no-unused-vars */
// eslint-disable-next-line no-unused-vars
require('dotenv').config();
const { EmbedBuilder, PermissionsBitField } = require("discord.js"),
BotModel = require('../../../models/Bot.model'),
UserModel = require('../../../models/User.model'),
Guild = require('../../../models/Guild.model');

module.exports = async (client, message) => {
	const guildId = message.guild.id;
	const userId = message.author.id;
	// Checks if guild exists, else adds to database
	const guild = await client.getGuildById(guildId); 
    let guildData = await Guild.findOne({ guildId: guildId });
	const customPerms = guildData?.customPerms || {};

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

	if (message.content.match(sprefix)) {
		prefix = message.content.match(sprefix);
	} else if (message.content.match(mprefix)) {
		prefix = message.content.match(mprefix)[0];
	}

	if (message.author.bot || message.channel.type === "dm" || !message.content.startsWith(prefix)) return;

	const args = message.content
		.slice(prefix.length)
		.trim()
		.split(/ +/g);
	const command = args.shift().toLowerCase();
	const cmd =
		client.commands.get(command) ||
		client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(command));

	if (!cmd) return;
		
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
		if (cmd.botPermissions && !message.guild.members.me.permissions.has('Administrator')) {
			const neededPermissions = [];
		
			if (message.guild && message.channel) {
				cmd.botPermissions.forEach(perm => {
					const botPermissionsInChannel = message.channel.permissionsFor(message.guild.me);
		
					if (!botPermissionsInChannel || !botPermissionsInChannel.has(perm)) {
						neededPermissions.push(perm);
					}
				});
		
				if (neededPermissions.length > 0) {
					return message.channel.send({ embeds: [client.errorEmbed(neededPermissions, message)]});
				}
			} else {
				console.log("Guild or channel information is not available.");
			}
		}
		

		if (cmd.customPerms) {
			const userPermissions = message.member.permissions,
			hasPermissions = customPerms[cmd.name].filter(perm => userPermissions.has(PermissionsBitField.Flags[perm])),
			neededPermissions = customPerms[cmd.name].filter(perm => !userPermissions.has(PermissionsBitField.Flags[perm]));
			let permissionsMessage;

			if (hasPermissions.length > 0) {
				// User has some required perms
				permissionsMessage = 
				`Perms You Currently Have That Are Required: ${hasPermissions.map(p => `\`${p.toUpperCase()}\``).join(', ')}
				Perms You Still Need: ${neededPermissions.map(p => `\`${p.toUpperCase()}\``).join(', ')}`;
			} else {
				// User has no perms atol atol
				permissionsMessage = `You need: ${neededPermissions.map(p => `\`${p.toUpperCase()}\``).join(', ')} permissions to use this command!`;
			}
			return message.channel.send({
				content: permissionsMessage 
			}).then(m => {
				setTimeout(() => {
					m.delete().catch(console.error);
				}, 10000);
			});
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