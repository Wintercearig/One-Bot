/* eslint-disable no-unused-vars */
// eslint-disable-next-line no-unused-vars
require('dotenv').config();
const { EmbedBuilder, PermissionsBitField } = require("discord.js"),
BotModel = require('../../../models/Bot.model');

module.exports = async (client, message) => {
	const guildId = message.guild.id;
	const userId = message.author.id;
	if (message.author.bot) return;
	if (!message.guild) return;
	
	// Checks if guild and user exists, else adds to database. Also populates the user and guild objects.
	const guild = await client.getGuildById(guildId);
	const {user}  = await client.getUserById(userId);

	// If the level or xp fields are missing, initialize them.
	if (user.level === undefined || user.xp === undefined) {
		await client.updateUserById(userId, { level: 1, xp: 0 });
	  }

	  console.log(client.xpRequired(user.level));
	  const xpNeeded = client.remainingXP(user);
	  console.log(`You need ${xpNeeded} XP to reach the next level.`);

	  if (user.level < 100) {
		await client.handleMessageXP(client, message);
	  }
	const customPerms = guild?.customPerms || {};

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

    const prefix = message.content.startsWith(`<@!${client.user.id}>`)
        ? `<@!${client.user.id}>`
        : guild.prefix;

	if (!message.content.startsWith(prefix)) return;

	const args = message.content
		.slice(prefix.length)
		.trim()
		.split(/ +/g);
	const command = args.shift().toLowerCase();
	const cmd =
		client.commands.get(command) ||
		client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(command));
		
		if (!cmd) return;

		await BotModel.updateOne(
			{ bot_id: client.user.id },
			{ $inc: { total_used_cmds: 1 } },
			{ upsert: true }
		);

		// Checks if user is a bot owner
		const owners = process.env.owners.split(',');
		if (cmd.ownerOnly && !owners.includes(message.author.id)) {
			return message.reply('This command can only be used by the bot owners!');
		}

		// Check require args
		if (cmd.requiredArgs && args.length < cmd.requiredArgs.length) {
			const cmdArgs = cmd.requiredArgs.map(a => `\`${a}\``).join(', ');
			const cmdExample = `${prefix}${cmd.name} ${cmd.requiredArgs
				.map(a => `<${a}>`)
				.join(' ')}`;

			const embed = new EmbedBuilder()
				.setTitle('Incorrect command usage')
				.setColor('RED')
				.setDescription(`:x: | You must provide more args: ${cmdArgs}`)
				.addFields([{ name: 'Example:', value: cmdExample }]);

			return message.channel.send({ embeds: [embed]});
		}

		// Check bot permissions
		if (cmd.botPermissions && !message.guild.members.me.permissions.has(PermissionsBitField.Flags.Administrator)) {
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
		
		// Custom Perms (user-defined)
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

		if (cmd.nsfwOnly && !message.channel.nsfw) {
			return message.channel.send({
			  content: "This command can only be used in an NSFW channel."
			});
		}
		
		cmd.run(client, message, args);
};