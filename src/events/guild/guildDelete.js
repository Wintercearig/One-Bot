const { removeGuild } = require("../../utils/functions");
  const { EmbedBuilder } = require("discord.js");

  module.exports = async (client, guild) => {    
    const owner = await guild.fetchOwner();

    let ownerDm = new EmbedBuilder()
    .setColor(`${process.env.theme}`)
    .setDescription(`As all chapters have their final pages, I appreciate the moments we've shared. Your server has been a part of a remarkable story, and I wish you continued success on the next exciting chapters of your Discord journey.
    Thank you for having me, and may your community thrive evermore!
    
    Warm regards,
    One Bot and the Dev Team`);
    owner.send({ embeds: [ownerDm]});
      await removeGuild(guild.id);
    };