const { EmbedBuilder } = require("discord.js");

function BaseEmbed(message) {
  if (!message) {
    throw Error("'message' must be passed down as param! (BaseEmbed)");
  }

  const avatar = message.author.displayAvatarURL({ dynamic: true, size: 512 });
  return new EmbedBuilder()
    .setFooter({text: `${message.author.username}`, iconURL: avatar})
    .setColor(process.env.theme)
    .setTimestamp();
}

module.exports = BaseEmbed;