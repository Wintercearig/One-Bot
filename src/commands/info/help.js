const {
    ActionRowBuilder,
    ButtonBuilder,
    EmbedBuilder,
    StringSelectMenuBuilder,
    StringSelectMenuOptionBuilder
} = require('discord.js'),
Guild = require('../../../models/Guild.model'),
stringSimilarity = require('string-similarity'),
interactionCollectors = {};
module.exports = {
    name: 'help',
    aliases: ['h'],
    category: "info",
    description: 'Displays the help menu',
    cooldown: 5,
    run: async (client, message, args) => {
        if (args[0]) {
            message.delete();
            return getCMD(client, message, args[0]);
            } else {
                message.delete();
              return helpMSG(client, message);
        }
    },
};

/**
 * Sends the main help message.
 * @async
 * @param {Client} client - The Discord client.
 * @param {Message} message - The Discord message.
 */

async function helpMSG(client, message) {
    const previousCollector = interactionCollectors[message.author.id];

    if (previousCollector && previousCollector.messageId) {
        const previousMessage = await message.channel.messages.fetch(previousCollector.messageId).catch(console.error);

        if (previousMessage) {
            previousMessage.delete().catch(console.error);
        } else {
            return;
        }
    }

    const settings = await Guild.findOne({
        guild_id: message.guild.id
    });

    function generateCategoryListing(category, commands) {
        const commandList = commands
            .filter(cmd => cmd.category === category)
            .map(cmd => {
                const commandName = cmd.name || (cmd.data && cmd.data.name);
                if (commandName) {
                    return `\`${commandName}\``;
                }
                return null;
            })
            .filter(Boolean)
            .join(', ');
    
        return commandList.length > 0
            ? { name: `**${category.charAt(0).toUpperCase() + category.slice(1)}**`, value: commandList }
            : { name: `**${category.charAt(0).toUpperCase() + category.slice(1)}:**`, value: 'No commands in this category' };
    }

    const homeButton = new ButtonBuilder()
        .setCustomId('home')
        .setEmoji('<:home:1176028354953097277>')
        .setLabel('Home')
        .setStyle('Secondary')
        .setDisabled(true),
    cmdListButton = new ButtonBuilder()
        .setCustomId('cmdlist')
        .setLabel('Command List')
        .setStyle('Primary')
        .setDisabled(false),
    slashListButton = new ButtonBuilder()
        .setCustomId('slashlist')
        .setLabel('Slash List')
        .setStyle('Secondary')
        .setDisabled(false),
    select = new StringSelectMenuBuilder()
        .setCustomId('helpDropDown')
        .setPlaceholder('Select A Category')
        .addOptions(
            client.categories
                .filter(category => category.toLowerCase() !== 'botowner' && category.toLowerCase() !== 'test')
                .map(category => new StringSelectMenuOptionBuilder() 
                    .setLabel(category)
                    .setValue(category.toLowerCase())
                    .setDescription(`Commands in the ${category} category`)
            )),
    row = new ActionRowBuilder()
        .addComponents(homeButton, cmdListButton, slashListButton),
    row2 = new ActionRowBuilder()
        .addComponents(select),
    HelpEmbed = new EmbedBuilder()
        .setColor(`${process.env.theme}`)
        .setTitle(`${client.user.username} Help Desk`)
        .setTimestamp()
        .setThumbnail(client.user.avatarURL({dynamic: true, size: 1024}))
        .setDescription(`\`${settings.prefix}help [command/category]\` - To view a specific command/category.
        \`${settings.prefix}help /[command] or /[category]\` - To view a specific slash commands/category.
        Use dropdown menu for more info.` + '```ansi\n' + '[2;34m[][0m - [2;31mRequired Argument[0m | [2;34m()[0m - [2;31mOptional Argument[0m[2;36m[0m```')
        .addFields(
            { 
                name: '**[Categories]**', 
                value: 
                client.categories
                .filter(category => category.toLowerCase() !== 'botowner' && category.toLowerCase() !== 'test')
                .map(category => {
                    return `> **${category.charAt(0).toUpperCase() + category.slice(1)}**`;
                })
                .join('\n'),
            },
            {
                name: '<:link:1176026855506202686> Links',
                value: 
                    `> [Support Server](${process.env.supportServer}) | [Invite Me](https://discord.com/oauth2/authorize?client_id=1090748427232624750&permissions=8&scope=bot%20applications.commands) | [Donate](https://www.patreon.com/OfficialOneBot)`
            })
        .setFooter({
            text: message.author.username,
            iconURL: message.author.displayAvatarURL({ dynamic: true, size: 512 }),
          }),
    CmdList = new EmbedBuilder()
        .setColor(`${process.env.theme}`)
        .setTitle(`${client.user.username} Msg Commands List`)
        .setTimestamp()
        .setThumbnail(client.user.avatarURL({dynamic: true, size: 1024}))
        .setDescription(`\`${settings.prefix}help [command/category]\` - To view a specific command/category.` + '```ansi\n' + '[2;34m[][0m - [2;31mRequired Argument[0m | [2;34m()[0m - [2;31mOptional Argument[0m[2;36m[0m```')
          .setFooter({
            text: message.author.username,
            iconURL: message.author.displayAvatarURL({ dynamic: true, size: 512 }),
          }),
    slashCmdList = new EmbedBuilder()
        .setColor(`${process.env.theme}`)
        .setTitle(`${client.user.username} Slash Commands List`)
        .setTimestamp()
        .setThumbnail(client.user.avatarURL({ dynamic: true, size: 1024 }))
        .setDescription(`\`${settings.prefix}help /[command] or /[category]\` - To view a specific slash command/category.`)
        .setFooter({
            text: message.author.username,
            iconURL: message.author.displayAvatarURL({ dynamic: true, size: 512 }),
          }),
          menuBuilder = new EmbedBuilder()
          .setColor(`${process.env.theme}`);
          client.categories
            .filter(category => category.toLowerCase() !== 'botowner' && category.toLowerCase() !== 'test')
            .forEach(category => {
              CmdList.addFields(generateCategoryListing(category, client.commands));
          }),
          client.slashCategories.filter(category => category.toLowerCase() !== 'botowner' && category.toLowerCase() !== 'test')
          .forEach(category => {
              slashCmdList.addFields(generateCategoryListing(category, client.slash));
          });

        CmdList.addFields({
            name: '<:link:1176026855506202686> Links',
            value: 
            `> [Support Server](${process.env.supportServer}) | [Invite Me](https://discord.com/oauth2/authorize?client_id=1090748427232624750&permissions=8&scope=bot%20applications.commands) | [Donate](https://www.patreon.com/OfficialOneBot)`
        });

        slashCmdList.addFields({
            name: '<:link:1176026855506202686> Links',
            value: 
            `> [Support Server](${process.env.supportServer}) | [Invite Me](https://discord.com/oauth2/authorize?client_id=1090748427232624750&permissions=8&scope=bot%20applications.commands) | [Donate](https://www.patreon.com/OfficialOneBot)`
        });

        let response = await message.channel.send({ embeds: [HelpEmbed], components: [row, row2] }),
        filter = (interaction) => {
            return (
              (interaction.isButton() || interaction.isStringSelectMenu()) &&
              interaction.user.id === message.author.id
            );
          },
          collector = response.createMessageComponentCollector({filter, time: 60000 }),
        lastEmbed = HelpEmbed;
        interactionCollectors[message.author.id] = {
            collector: collector,
            messageId: response.id,
        };

        collector.on('collect', async interaction => {
            if(interaction.isButton()) {
                switch (interaction.customId) {
                    case 'home':{
                        homeButton.setDisabled(true);
                        homeButton.setStyle('Secondary');
                        cmdListButton.setDisabled(false);
                        cmdListButton.setStyle('Primary');
                        slashListButton.setDisabled(false);
                        slashListButton.setStyle('Secondary');
                        lastEmbed = HelpEmbed;
                        await interaction.update({ embeds: [HelpEmbed], components: [row, row2] });
                        break;
                    }
                    case 'cmdlist': {
                        homeButton.setDisabled(false);
                        homeButton.setStyle('Primary');
                        cmdListButton.setDisabled(true);
                        cmdListButton.setStyle('Secondary');
                        slashListButton.setDisabled(false);
                        slashListButton.setStyle('Secondary');
                        lastEmbed = CmdList;
                        await interaction.update({ embeds: [CmdList], components: [row, row2] });
                        break;
                    }
                    case 'slashlist': {
                        homeButton.setDisabled(false);
                        homeButton.setStyle('Primary');
                        cmdListButton.setDisabled(false);
                        cmdListButton.setStyle('Secondary');
                        slashListButton.setDisabled(true);
                        slashListButton.setStyle('Secondary');
                        lastEmbed = slashCmdList;
                        await interaction.update({ embeds: [slashCmdList], components: [row, row2] });
                        break;
                    }
                    default: {
                        await interaction.update({ content: 'Invalid custom ID', components: [] });
                    break;
                    }
                }
            } else if (interaction.isStringSelectMenu()) {
                switch (interaction.customId) {
                    case 'helpDropDown': {
                        homeButton.setDisabled(false);
                        homeButton.setStyle('Primary');
                        cmdListButton.setDisabled(false);
                        cmdListButton.setStyle('Secondary');
                        slashListButton.setDisabled(false);
                        slashListButton.setStyle('Secondary');
                        const selectedCategory = interaction.values[0];
                        let category = client.categories.find(cat => cat.toLowerCase() === selectedCategory.toLowerCase());
                        let commandList = client.commands.filter(cmd => cmd.category === category).map(cmd => `<:arrowLeft:1176011742451597373> \`${settings.prefix}${cmd.name}\` - ${cmd.description}`).join('\n'),
                        info = `${commandList.length > 0 ? commandList : 'No commands in this category'}`;
                        let description = await client.getCategoryDescription(category.toLowerCase());
                        menuBuilder
                        .setTitle(category.charAt(0).toUpperCase()+ category.slice(1))
                        .setDescription(description)
                        .setFields({ name: 'Commands', value: info });
                        lastEmbed = menuBuilder;
                        await interaction.update({ embeds: [menuBuilder], components: [row, row2] });
                        break;
                    }
                }
            }
    });

    collector.on('end', async () => {
        const existingMessage = await message.channel.messages.fetch(response.id).catch(() => null);

        if (existingMessage) {
            homeButton.setDisabled(true);
            homeButton.setStyle('Secondary');
            cmdListButton.setDisabled(true);
            cmdListButton.setStyle('Secondary');
            slashListButton.setDisabled(true);
            slashListButton.setStyle('Secondary');
            await existingMessage.edit({ 
                embeds: [lastEmbed.setFooter({ text: 'This help menu expired.' })],
                components: [row]
            });
        } else {
            return;
        }
    });
}

/**
 * Fetches and displays information about a specific command.
 * @async
 * @param {Client} client - The Discord client.
 * @param {Message} message - The Discord message.
 * @param {string} input - The command to get information for.
 */

  async function getCMD(client, message, input) {
      let embed = new EmbedBuilder(),
      msgCategory = client.categories.find(cat => cat.toLowerCase() === input.toLowerCase()),
      slashCategory = client.slashCategories.find(cat => cat.toLowerCase() === input.toLowerCase()),
      settings = await Guild.findOne({
        guild_id: message.guild.id
    });

    if (msgCategory) {
        let commandList = client.commands.filter(cmd => cmd.category === msgCategory).map(cmd => `<:arrowLeft:1176011742451597373> \`${settings.prefix}${cmd.name}\` - ${cmd.description}`).join('\n'),
        info = `${commandList.length > 0 ? commandList : 'No commands in this category'}`;
        embed
        .setTitle(`${msgCategory.charAt(0).toUpperCase()+ msgCategory.slice(1)}`)
        .setColor(process.env.theme)
        .setFields({ name: 'Commands', value: info });
          let description = await client.getCategoryDescription(msgCategory.toLowerCase());
          embed.setDescription(description);
        return message.channel.send({ embeds: [embed] });
    }

    if (input.startsWith('/')) {
        if (slashCategory) {
            let commandList = client.slash.filter(cmd => cmd.category === slashCategory).map(cmd => `<:arrowLeft:1176011742451597373> \`${settings.prefix}${cmd.name}\` - ${cmd.description}`).join('\n'),
            info = `${commandList.length > 0 ? commandList : 'No commands in this category'}`;
            embed
            .setTitle(`${slashCategory.charAt(0).toUpperCase()+ slashCategory.slice(1)}`)
            .setColor(process.env.theme)
            .setFields({ name: 'Commands', value: info });
              let description = await client.getCategoryDescription(slashCategory.toLowerCase());
              embed.setDescription(description);
            return message.channel.send({ embeds: [embed] });
        }
        const slashCmd = client.slash.get(input.toLowerCase().replace(/^\//, ''));
        if (!slashCmd){
            let allCommands = client.slash.map(cmd => cmd.data.name.toLowerCase()),
            { bestMatch } = stringSimilarity.findBestMatch(input.toLowerCase(), allCommands),
            closestMatch = bestMatch.target,
            similarityScore = bestMatch.rating;
          
            let info = `If you see this, something legit ain't right. Contact the bot dev asap: fluffydreams.`;
          
            info = similarityScore > 0.5
            ? `It appears that I don't have this command\nDid you mean the \`${closestMatch}\` Slash cmd?`
            : `It appears my algorithm doesn't believe this, or a similar, command exists.\nCheck your spelling or run the \`${settings.prefix}help\` command`;
          
            return message.channel.send({embeds: [embed.setColor('#ff0000').setDescription(info)]});
        }

        if (slashCmd.data.name) {
            let nameTxt = '/' + slashCmd.data.name.charAt(0).toUpperCase() + slashCmd.data.name.slice(1);
            if (slashCmd.category) {
                nameTxt = `[${slashCmd.category.charAt(0).toUpperCase() + slashCmd.category.slice(1)}]` + `-${nameTxt}`;
            }
            embed.setTitle(nameTxt);
        }

        if (slashCmd.data.description) embed.setDescription(slashCmd.data.description);
        if (slashCmd.usage) {
            embed.addFields({
              name: '**Usage:**',
              value: `\`${settings.prefix + slashCmd.usage}\``,
              inline: true
            });
        }
        if (slashCmd.cooldown) {
          embed.addFields({
              name: '**CoolDown:**',
              value: `\`${slashCmd.cooldown}\``
          });
        }
        if (slashCmd.customMemPerms) {
            embed.addFields({ 
                name: `**Member Perms Needed:**`, 
                value: slashCmd.customMemPerms.map(m => `\`${m}\``).join(', ')});
        } else if (slashCmd.data.setDefaultMemberPermissions) {
            embed.addFields({ 
                name: `**Member Perms Needed:**`, 
                value: slashCmd.data.setDefaultMemberPermissions.map(m => `\`${m}\``).join(', ')});
        } 
        if (slashCmd.botpermissions) embed.addFields({ 
            name: `**Bot Perms Needed:**`, 
            alue: slashCmd.botpermissions.map(b => `\`${b}\``).join(', ')});
        return message.channel.send({embeds: [embed.setColor(process.env.theme)]});
    } else {
        const cmd = client.commands.get(input.toLowerCase()) || client.commands.get(client.aliases.get(input.toLowerCase()));
        if (!cmd) {
          let allCommands = client.commands.map(cmd => cmd.name.toLowerCase()),
          { bestMatch } = stringSimilarity.findBestMatch(input.toLowerCase(), allCommands),
          closestMatch = bestMatch.target,
          similarityScore = bestMatch.rating;
        
          let info = `If you see this, something legit ain't right. Contact the bot dev asap: fluffydreams.`;
        
          info = similarityScore > 0.5
          ? `It appears that I don't have this command\nDid you mean the \`${closestMatch}\` Msg cmd?`
          : `It appears my algorithm doesn't believe this, or a similar, command exists.\nCheck your spelling or run the \`${settings.prefix}help\` command`;
        
          return message.channel.send({embeds: [embed.setColor('#ff0000').setDescription(info)]});
        }
        if (cmd.name) {
            let nameTxt = `[${cmd.category.charAt(0).toUpperCase() + cmd.category.slice(1)}]` + `-${cmd.name.charAt(0).toUpperCase() + cmd.name.slice(1)}`;
            embed.setTitle(nameTxt);
        }
        if (cmd.description) {
          let descriptionText = cmd.description;
        
          if (cmd.usage) {
            descriptionText = descriptionText + '```ansi\n' +
              '[2;34m[][0m - [2;31mRequired Argument[0m | [2;34m()[0m - [2;31mOptional Argument[0m[2;36m[0m```' +
              '\n\n';
          }
          embed.setDescription(descriptionText);
        }
        if (cmd.aliases) {
          const formattedAliases = cmd.aliases.map(alias => `\`${settings.prefix}${alias}\``);
          embed.addFields({ 
            name: `**Aliases:**`, 
            value: formattedAliases.join(', ')});
        }
        if (cmd.usage) {
            embed.addFields({
              name: '**Usage:**',
              value: `\`${settings.prefix + cmd.usage}\``,
              inline: true
            });
        }
        if (cmd.cooldown) {
          embed.addFields({
              name: '**CoolDown:**',
              value: `\`${cmd.cooldown}\``
          });
        }
        if (cmd.memberPermissions) embed.addFields({ 
            name: `**Member Perms Needed:**`, 
            value: cmd.memberPermissions.map(m => `\`${m}\``).join(', ')});
        if (cmd.botpermissions) embed.addFields({ 
            name: `**Bot Perms Needed:**`, 
            value: cmd.botpermissions.map(b => `\`${b}\``).join(', ')});
        return message.channel.send({embeds: [embed.setColor(process.env.theme)]});
    }
  }