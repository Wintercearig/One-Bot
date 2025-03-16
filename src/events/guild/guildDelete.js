module.exports = async (client, guild) => {    
    await client.removeGuild(guild.id);
  };