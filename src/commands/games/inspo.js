const { EmbedBuilder } = require('discord.js');
const axios = require('axios');

module.exports = {
  name: 'inspire',
  aliases: ['inspo', 'inspiration', 'deepquotes', 'quote', 'quotes'],
  description: 'Get an inspirational quote',
  category: 'utility',
  run: async (client, message) => {
    try {
      const response = await axios.get('https://zenquotes.io/api/random');
      const [quote] = response.data;

      const embed = new EmbedBuilder()
        .setDescription(`*${quote.q}*\n-${quote.a}`);

      message.channel.send({ embeds: [embed] });
    } catch (error) {
      console.error('Error fetching inspirational quote:', error);
      message.channel.send('An error occurred while fetching an inspirational quote.');
    }
  },
};
