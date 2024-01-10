/*const { 
    ActionRowBuilder, 
    ModalBuilder, 
    TextInputBuilder, 
    TextInputStyle, 
    ButtonBuilder, 
    EmbedBuilder } = require('discord.js');
*/

module.exports = {
    name: 'test',
    description: 'test',
    category: "info",
    usage: 'test',
    ownerOnly: true,
    run: async (client, message) => {
        const guildId = message.guild.id;
        const guild = await client.getGuildById(guildId);

        console.log(guild.customPerms);

/*
    const modal = new ModalBuilder()
        .setCustomId('myModal')
        .setTitle('My Modal');

    const favoriteColorInput = new TextInputBuilder()
        .setCustomId('favoriteColorInput')
        .setLabel("What's your favorite color?")
        .setStyle(TextInputStyle.Short);

    const firstActionRow = new ActionRowBuilder().addComponents(favoriteColorInput);

    modal.addComponents(firstActionRow);

    const homeButton = new ButtonBuilder()
        .setCustomId('model')
        .setEmoji('<:home:1176028354953097277>')
        .setLabel('Home')
        .setStyle('Secondary');
    const row = new ActionRowBuilder()
        .addComponents(homeButton),
        HelpEmbed = new EmbedBuilder()
        .setColor(`${process.env.theme}`)
        .setTitle(`<:OneBotPFP:1175958595624517632> ${client.user.username} Help Desk`)
        .setTimestamp()
        .setDescription('tis a test. Press the button and find out');

        let response = await message.channel.send({ embeds: [HelpEmbed], components: [row] }),
        filter = (interaction) => {
            // Check if the interaction is from the same user who initiated the command
            return (
              (interaction.isButton() || interaction.isStringSelectMenu() || interaction.is) &&
              interaction.user.id === message.author.id
            );
          },
          collector = response.createMessageComponentCollector({filter, time: 60000 });
        
          collector.on('collect', async interaction => {
                switch (interaction.customId) {
                    case 'model':{
                        await interaction.showModal(modal);

                        const submitted = await interaction.awaitModalSubmit({
                            time: 60000,
                            filter: i => i.user.id === interaction.user.id,
                          });

                        if (submitted){
                            submitted.reply('I received the submit');
                            collector.stop();
                        }
                        break;
                    }
                }
        });
        */
    }
};