const { EmbedBuilder, PermissionsBitField, UserFlagsBitField } = require("discord.js");

module.exports = {
    name: 'whois',
    aliases: ['wi', 'user'],
    category: "info",
    description: "Displays a specified user's information.",
    usage: `whois [user's tag]`,
    run: async (client, message) => {
        const user = message.mentions.users.first() || message.author;
        const member = message.guild.members.cache.get(user.id);
        if (!member) {
            return message.channel.send('User not found in this server.');
        }

        // ✅ Fetch User Flags & Badges
        await user.fetchFlags();
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

        // ✅ Nitro Subscription Tiers
        const nitroTiers = [
            { months: 1, badge: "🟫 **Bronze**" },
            { months: 3, badge: "⚪ **Silver**" },
            { months: 6, badge: "🟡 **Gold**" },
            { months: 12, badge: "🔷 **Platinum**" },
            { months: 24, badge: "💎 **Diamond**" },
            { months: 36, badge: "🍀 **Emerald**" },
            { months: 60, badge: "❤️ **Ruby**" },
            { months: 72, badge: "🔮 **Opal**" }
        ];

        // ✅ Nitro Boost Emojis
        let boostEmojis = [
            '<:Nitro_1_Month:1161997354304536666>',
            '<:Nitro_2_Months:1161997366967144498>',
            '<:Nitro_3_Months:1161997378195304528>',
            '<:Nitro_3_Months:1161997378195304528>',
            '<:Nitro_3_Months:1161997378195304528>',
            '<:Nitro_6_Months:1161997390165852251>',
            '<:Nitro_6_Months:1161997390165852251>',
            '<:Nitro_6_Months:1161997390165852251>',
            '<:Nitro_9_Months:1161997408004214784>',
            '<:Nitro_9_Months:1161997408004214784>',
            '<:Nitro_9_Months:1161997408004214784>',
            '<:Nitro_12_Months:1161997419689541672>',
            '<:Nitro_12_Months:1161997419689541672>',
            '<:Nitro_12_Months:1161997419689541672>',
            '<:Nitro_15_Months:1161997430032703529>',
            '<:Nitro_15_Months:1161997430032703529>',
            '<:Nitro_15_Months:1161997430032703529>',
            '<:Nitro_18_Months:1161997445220274176>',
            '<:Nitro_24_Months:1161997495933620344>'
        ];

        // ✅ Nitro Subscription Calculation
        const boostDate = member.premiumSince;
        console.log(member);
        console.log(member.premiumSince);
        let boostInfo = 'N/A';
        let nitroBadge = '';
        let boostEmoji = '';

        if (boostDate) {
            const currentDate = new Date();
            const boostDateStart = new Date(boostDate);
            const totalMonths = (currentDate.getMonth() - boostDateStart.getMonth()) + (12 * (currentDate.getFullYear() - boostDateStart.getFullYear()));

            boostInfo = `(${totalMonths} month${totalMonths !== 1 ? 's' : ''})`;

            // Assign Nitro Badge (Bronze, Silver, etc.)
            for (const tier of nitroTiers.reverse()) {
                if (totalMonths >= tier.months) {
                    nitroBadge = tier.badge;
                    break;
                }
            }

            // Assign Boost Emoji
            boostEmoji = boostEmojis[Math.min(totalMonths - 1, boostEmojis.length - 1)] || '';

            // Combine Boost Emoji & Nitro Badge
            boostInfo = `${boostEmoji} ${nitroBadge} ${boostInfo}`;
        }

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

        if (!member.user.bot) {
            uinfoembed.addFields({ name: `Nitro Subscription`, value: boostInfo, inline: true });
        }

        message.channel.send({ embeds: [uinfoembed] }).catch(console.error);
    }
};
