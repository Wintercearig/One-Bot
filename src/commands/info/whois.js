const { EmbedBuilder, PermissionsBitField } = require("discord.js");

module.exports = {
    name: 'whois',
    aliases: ['wi', 'user'],
    category: "info",
    description: 'Displays a specified user\'s information.',
    usage: `whois [user's tag]`,
    run: async (client, message) => {

        const user = message.mentions.users.first() || message.author;
        const member = message.guild.members.cache.get(user.id);
        if (!member) {
            // Handle the case where the member is not found (e.g., user is not in the server)
            return message.channel.send('User not found in this server.');
        }

        const flags = {
        /*1<<0*/    Staff: '<:Discord_Employee:1161996758533013524>',
        /*1<<1*/    Partner: '<:Discord_Partner:1161997016591761490>',
        /*1<<2*/    HypeSquad: '<:Hypesquad_Events:1161997201698996224>',
        /*1<<3*/    BugHunterLevel1: '<:Bug_Hunter_lvl_1:1161997228055994409>',
        /*1<<6*/    HypeSquadOnlineHouse1: '<:Bravery_Squad:1161997281214611466>',
        /*1<<7*/    HypeSquadOnlineHouse2: `<:Brilliance_Squad:1161997297329131592>`,
        /*1<<8*/    HypeSquadOnlineHouse3: '<:Balance_Squad:1161997312164372571>',
        /*1<<9*/    PremiumEarlySupporter: '<:Early_Supporter:1161997334322884628>',
        // 1<<10    TeamPseudoUser: '<:Pseudo_User:34255234532532532>',
        /*1<<14*/    BugHunterLevel2: '<:Bug_Hunter_lvl_2:1161997257529368597>',
        /*1<<16*/    VerifiedBot: '<:Verified_Bot:1161997518050181234>',
        /*1<<17*/    VerifiedDeveloper: '<:Verified_Developer:1161997540699418654>', // Early Bot Dev
        /*1<<18*/    CertifiedModerator: '<:Moderator_Alumni:1161997598798909530>',
        /*1<<19*/    BotHttpInteractions: '<:Slash_Command:1161997582382399599>', // Bot supports Slash Commands
        /*1<<22*/    ActiveDeveloper: '<:Active_Developer:1161997566670557234>' // Current Dev Badge
        };

        const userFlags = member.user.flags.toArray();
        const userFlagEmojis = userFlags.length ? userFlags.map(flag => flags[flag]).join(', ') : 'None';

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
           '<:Nitro_18_Months:1161997445220274176>',
           '<:Nitro_18_Months:1161997445220274176>',
           '<:Nitro_18_Months:1161997445220274176>',
           '<:Nitro_18_Months:1161997445220274176>',
           '<:Nitro_18_Months:1161997445220274176>',
           '<:Nitro_24_Months:1161997495933620344>'
        ];
        const boostDate = member.premiumSince;
        let boostInfo = 'N/A';

if (boostDate) {
    const currentDate = new Date();
    const boostDateStart = new Date(boostDate);
    const diffInMonths = (currentDate.getMonth() - boostDateStart.getMonth()) + (12 * (currentDate.getFullYear() - boostDateStart.getFullYear()));

    boostInfo = `(${diffInMonths} month${diffInMonths !== 1 ? 's' : ''})`;

    if (diffInMonths > 0 && diffInMonths <= 23) {
        const emojiIndex = diffInMonths;
        if (emojiIndex < boostEmojis.length) {
            boostInfo = `${boostEmojis[emojiIndex]} ${boostInfo}`;
        }
    }  else if (diffInMonths >= 24) {
        boostInfo = `${boostEmojis[23]} ${boostInfo}}`;
    }
}

        const statusType = {
            online: "https://cdn.discordapp.com/emojis/1162050010779746335.webp?size=80&quality=lossless",
            idle: "https://cdn.discordapp.com/emojis/1162050025459830794.webp?size=80&quality=lossless",
            dnd: "https://cdn.discordapp.com/emojis/1162050036910264431.webp?size=80&quality=lossless",
            offline: "https://cdn.discordapp.com/emojis/1162050051451920575.webp?size=80&quality=lossless",
        };

        const activityType = [
            ':video_game: *Playing*',
            ':movie_camera: **Streaming**',
            ':headphones: **Listening To**',
            ':tv: **Watching**',
            ':technologist: **Custom**',
            ':trophy: **Competing In**'
        ];
            
        const userRegisteredDate = new Intl.DateTimeFormat('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          }).format(user.createdAt);

          const userJoinedDate = new Intl.DateTimeFormat('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          }).format(member.joinedAt);

          const date = new Date();
          const options = {
            weekday: 'short',
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: 'numeric',
            minute: 'numeric',
            timeZoneName: 'long'
          };

        let presenceStatus; // Default value if no activity is found

        if (member.presence && member.presence.activities && member.presence.activities.length > 0) {
            presenceStatus = `${activityType[member.presence.activities[0].type]} ${member.presence.activities[0].name}`;
        } else {
            presenceStatus = 'N/A';
        }

        const formattedDate = new Intl.DateTimeFormat('en-US', options).format(date);
        let nickname = member.nickname || "None";

        const maxRolesToShow = 15;
        const userRoles = [...member.roles.cache
        .filter(role => role.name !== '@everyone') // Exclude @everyone role
        .values()];
        const rolesToDisplay = userRoles.slice(0, maxRolesToShow);
        const roleCount = userRoles.length;
        const rolesField = {
            name: roleCount > maxRolesToShow ? `Roles [${maxRolesToShow} - ${roleCount}]` : `Roles [${roleCount}]`,
            value: roleCount > maxRolesToShow
                ? rolesToDisplay.join(', ') + `\n...and ${roleCount - maxRolesToShow} more`
                : rolesToDisplay.join(', ') || 'None'
        };

        const uinfoembed = new EmbedBuilder()
            .setThumbnail(member.user.displayAvatarURL({ dynamic: true, size: 512 }))
            .setColor(process.env.theme)
            .setAuthor({
                name: `${user.tag} (${member.user.bot ? 'Bot' : member.id === message.guild.ownerId ? 'Server Owner' : member.roles.cache.some(role => role.permissions.has([PermissionsBitField.Flags.Administrator])) ? 'Admin' : 'Member'})`,
                iconURL: member.presence && member.presence.status ? statusType[member.presence.status] : statusType.offline
            })
            .setFooter({text: `${formattedDate}`})
            .addFields(
                { name: `ID`, value: user.id },
                { name: `Nickname`, value: nickname, inline: true },
                { name: `Flags`, value: userFlagEmojis, inline: true},
                { name: `Activity`, value: presenceStatus, inline: true},
                { name: `Member Since`, value: `<:Discord_Logo:1162118477084098600> ${userRegisteredDate} • :earth_americas: ${userJoinedDate}`},
                { name: `Highest Role`, value: member.roles.highest.id === message.guild.id ? 'None' : member.roles.highest.name, inline: true },
                { name: `Hoist Role`, value: member.roles.hoist ? `<@&${member.roles.hoist.id}>` : 'None', inline: true },
                rolesField
    
            );
            if (!member.user.bot) {
                
                uinfoembed.addFields(
                    { name: `Server Booster`, value: boostInfo, inline: true },
                );
            }

        message.channel.send({ embeds: [uinfoembed] }).catch(console.error);
    }
};