/*
 * Long Lasting things for here.
 * Short lasting, in immediate file, with a collector. Example: help.js buttons
 */
module.exports = async (client, interaction) => {

  if (!interaction.isCommand()) return;

  const commandName = interaction.commandName;
  const SL = client.slash.get(commandName);
// SL.data.name
// SL.data.description

  if (!SL) return;
  if (!interaction.guild || !interaction.guild.available) return;
  if (interaction.user.bot) return;

  if (client.slash.has(commandName)) {
      try {
          await SL.execute(interaction);
      } catch (error) {
          console.error(error);
          await interaction.reply({ content: 'There was an error while executing this command! There\'s a chance the dev knows, but text him just in case: fluffydreams.', ephemeral: true });
      }
  }
};