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
    announceCh = guild.announce_data ? guild.announce_data.channel_id : null,
    suggestCh = guild.suggest_data ? guild.suggest_data.channel_id : null,
    welcomeCh = guild.welcome_data ? guild.welcome_data.channel_id : null,
    leaveCh = guild.leave_data ? guild.leave_data.channel_id : null,
    levelMsgs = guild.level_data ? guild.level_data.channel_id : null,
    antiSpam = guild.anti_spam ? guild.anti_spam.enabled : null,
    logCh = guild.audit_data ? guild.audit_data.channel_id : null,
    starCh = guild.starboards_data ? guild.starboards_data.channel_id : null,
    welcRole = guild.welcome_data ? guild.welcome_data.role_id : null,
    supRole = guild.support_data ? guild.support_data.role_id : null,
    staffNotify = guild.staff_notifier ? guild.staff_notifier : null,
    muteRole = guild.muted_role_id ? guild.muted_role_id : null;
    
    const embed1 = new EmbedBuilder()
      .setTitle(lang.ADMIN.GUILD_CONFIG.replace("{guildName}", name))
      .setColor(`${process.env.theme}`)
      .setDescription(
      `**${lang.GUILD.PREFIX}:** ${prefix}\n` +
      `**${lang.GUILD.STARBOARDS_CHANNEL}** ${!starCh ? lang.GLOBAL.NONE : `<#${starCh}>`}\n` +
      `**Support Role:** ${!supRole ? lang.GLOBAL.NONE : `<@&${supRole}>`}\n` +
      `**Staff Notifer:** ${!staffNotify ? 'Disabled' : "Enabled"}\n` +
      `**Mute Role:** ${!muteRole ? lang.GLOBAL.NONE : `<@&${muteRole}>`}\n` +
      `**${lang.GUILD.ANNOUNCE_CHANNEL}:** ${!announceCh ? lang.GLOBAL.NONE : `<#${announceCh}>`}\n` +
      `**${lang.GUILD.SUGGEST_CHANNEL}:** ${!suggestCh ? lang.GLOBAL.NONE : `<#${suggestCh}>`}\n` +
      `**${lang.GUILD.WELCOME_CHANNEL}:** ${!welcomeCh ? lang.GLOBAL.NONE : `<#${welcomeCh}>`}\n` +
      `**${lang.GUILD.LEAVE_CHANNEL}:** ${!leaveCh ? lang.GLOBAL.NONE : `<#${leaveCh}>`}\n` +
      `**${lang.GUILD.AUDIT_CHANNEL}:** ${!logCh ? lang.GLOBAL.NONE : `<#${logCh}>`}\n` +
      `**${lang.GUILD.WELCOME_ROLE}:** ${!welcRole ? lang.GLOBAL.NONE : `<@&${welcRole}>`}\n` +
      `**${lang.GUILD.LEVEL_UP_MESSAGES}:** ${!levelMsgs ? lang.GLOBAL.NONE : `<#${levelMsgs}>`}\n` +
      `**Anti-Spam:**  ${!antiSpam ? "Disabled" : "Enabled"}`
      )
      .setThumbnail(message.guild.iconURL({ dynamic: true, size: 1024 }));
    return message.channel.send({ embeds: [embed1]});
    
  },
};
