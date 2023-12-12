const { addGuild } = require("../../utils/functions");
const { EmbedBuilder } = require("discord.js");

module.exports = async (client, guild) => {
    await addGuild(guild.id);
    const owner = await guild.fetchOwner();

      let ownerDm = new EmbedBuilder()
      .setColor(`${process.env.theme}`)
      .setTitle(`Hello, Server Owner!`)
      .setDescription(`Thank you for welcoming me to your server!
      I'm a versatile Discord bot here to enhance your community.
      My default prefix is \`-\`, and I recommend using \`-setup\` for configurations. Explore \`-settings\`, \`-disable\`, \`-enable\`, and \`-help\` for more.
      I offer moderation commands, including auto-moderation, and exciting updates are on the horizon, including an advanced economy and leveling system.
      Your feedback is crucial, and I'm eager to evolve with your community. Join our support server for updates: https://discord.gg/z3fYrfhjb5.
      Together, let's build a thriving and secure environment! 🚀`);
      owner.send({ embeds: [ownerDm]});
  };
