const { EmbedBuilder, PermissionsBitField, UserFlagsBitField } = require("discord.js");

module.exports = {
    name: 'whois',
    aliases: ['wi', 'user'],
    category: "info",
    description: "Displays a specified user's information.",
    usage: `whois [user's tag]`,
    run: async (client, message) => {
        const user = message.mentions.users.first() || message.author;
        const member = await message.guild.members.fetch(user.id);
        if (!member) {
            return message.channel.send('User not found in this server.');
        }

        // ✅ Fetch User Flags & Badges
        await user.fetch();
        const userFlags = new UserFlagsBitField(user.flags.bitfield);

        // ✅ Discord Profile Badges & Emojis
        const badgeEmojis = {
            Staff: '<:Discord_Employee:1161996758533013524>',
            Partner: '<:Discord_Partner:1161997016591761490>',
            HypeSquad: '<:Hypesquad_Events:1161997201698996224>',
            BugHunterLevel1: '<:Bug_Hunter_lvl_1:1161997228055994409>',
            HypeSquadOnlineHouse1: '<:Bravery_Squad:1161997281214611466>',
            HypeSquadOnlineHouse2: `<:Brilliance_Squad:1161997297329131592>`,
            HypeSquadOnlineHouse3: '<:Balance_Squad:1161997312164372571>',
            PremiumEarlySupporter: '<:Early_Supporter:1161997334322884628>',
            BugHunterLevel2: '<:Bug_Hunter_lvl_2:1161997257529368597>',
            VerifiedBot: '<:Verified_Bot:1161997518050181234>',
            VerifiedDeveloper: '<:Verified_Developer:1161997540699418654>',
            CertifiedModerator: '<:Moderator_Alumni:1161997598798909530>',
            BotHttpInteractions: '<:Slash_Command:1161997582382399599>',
            ActiveDeveloper: '<:Active_Developer:1161997566670557234>'
        };

        // ✅ Extract User Profile Badges
        const userBadgeList = userFlags.toArray().map(flag => badgeEmojis[flag] || flag);
        const userBadges = userBadgeList.length ? userBadgeList.join(' ') : 'None';

        // ✅ User Status Emojis
        const statusIcons = {
            online: "🟢",
            idle: "🌙",
            dnd: "⛔",
            offline: "⚪"
        };
        const userStatus = member.presence?.status || "offline";
        const statusEmoji = statusIcons[userStatus];

        // ✅ Embed Construction
        const uinfoembed = new EmbedBuilder()
            .setThumbnail(user.displayAvatarURL({ dynamic: true, size: 512 }))
            .setColor(process.env.theme)
            .setAuthor({
                name: `${statusEmoji} ${user.tag} (${member.user.bot ? 'Bot' : member.id === message.guild.ownerId ? 'Server Owner' : member.permissions.has(PermissionsBitField.Flags.Administrator) ? 'Admin' : 'Member'})`
            })
            .setTimestamp()
            .addFields(
                { name: `ID`, value: user.id },
                { name: `Nickname`, value: member.nickname || "None", inline: true },
                { name: `Badges`, value: userBadges, inline: false },
                { name: `Member Since`, value: `<:Discord_Logo:1162118477084098600> ${user.createdAt.toDateString()} • :earth_americas: ${member.joinedAt.toDateString()}` }
            );

        message.channel.send({ embeds: [uinfoembed] }).catch(console.error);
    }
};
