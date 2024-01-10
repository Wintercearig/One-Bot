const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: "config",
  description: "Returns the config",
  category: "util",
  usage: "config [general/util]",
  aliases: ["conf", "cfg", "settings"],
  run: async (client, message) => {
    const lang = await client.getGuildLang(message.guild.id),
    { name, id: guildId } = message.guild,
    guild = await client.getGuildById(guildId),
    prefix = guild.prefix,
    announceCh = guild.config?.announce_data?.channel_id ?? null,
    suggestCh = guild.config?.suggest_data?.channel_id ?? null,
    welcomeCh = guild.config?.welcome_data?.channel_id ?? null,
    leaveCh = guild.config?.leave_data?.channel_id ?? null,
    levelMsgs = guild.config?.level_data?.channel_id ?? null,
    antiSpam = guild.config?.anti_spam?.enabled ?? null,
    logCh = guild.config?.audit_data?.channel_id ?? null,
    starCh = guild.config?.starboards_data?.channel_id ?? null,
    welcRole = guild.config?.welcome_data?.role_id ?? null,
    supRole = guild.config?.support_data?.role_id ?? null,
    muteRole = guild.config?.muted_role_id ?? null,
    musicDj = guild.config?.music_dj?.enabled ?? null;
    
    const embed1 = new EmbedBuilder()
      .setTitle(lang.ADMIN.GUILD_CONFIG.replace("{guildName}", name))
      .setColor(`${process.env.theme}`)
      .setDescription(
      `**${lang.GUILD.PREFIX}:** ${prefix}\n` +
      `**${lang.GUILD.STARBOARDS_CHANNEL}** ${!starCh ? lang.GLOBAL.NONE : `<#${starCh}>`}\n` +
      `**${lang.GUILD.SUPPORT_ROLE}** ${!supRole ? lang.GLOBAL.NONE : `<@&${supRole}>`}\n` +
      `**${lang.GUILD.MUTE_ROLE}** ${!muteRole ? lang.GLOBAL.NONE : `<@&${muteRole}>`}\n` +
      `**${lang.GUILD.ANNOUNCE_CHANNEL}:** ${!announceCh ? lang.GLOBAL.NONE : `<#${announceCh}>`}\n` +
      `**${lang.GUILD.SUGGEST_CHANNEL}:** ${!suggestCh ? lang.GLOBAL.NONE : `<#${suggestCh}>`}\n` +
      `**${lang.GUILD.WELCOME_CHANNEL}:** ${!welcomeCh ? lang.GLOBAL.NONE : `<#${welcomeCh}>`}\n` +
      `**${lang.GUILD.LEAVE_CHANNEL}:** ${!leaveCh ? lang.GLOBAL.NONE : `<#${leaveCh}>`}\n` +
      `**${lang.GUILD.AUDIT_CHANNEL}:** ${!logCh ? lang.GLOBAL.NONE : `<#${logCh}>`}\n` +
      `**${lang.GUILD.WELCOME_ROLE}:** ${!welcRole ? lang.GLOBAL.NONE : `<@&${welcRole}>`}\n` +
      `**${lang.GUILD.LEVEL_UP_MESSAGES}:** ${!levelMsgs ? lang.GLOBAL.NONE : `<#${levelMsgs}>`}\n` +
      `**${lang.GUILD.ANTI_SPAM}**  ${!antiSpam ? lang.GLOBAL.DISABLED : lang.GLOBAL.ENABLED}`
      )
      .setThumbnail(message.guild.iconURL({ dynamic: true, size: 1024 }));
    return message.channel.send({ embeds: [embed1]});
    
  },
};
