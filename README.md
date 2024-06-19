# GITHUB
[![CodeFactor](https://www.codefactor.io/repository/github/wintercearig/one-bot/badge/main)](https://www.codefactor.io/repository/github/wintercearig/one-bot/overview/main)

1- Commit your changes to your branch.

2- Go to GitHub and submit a pull request to have your branch merged with Main

3- Pull from Main into Your_Branch periodically to stay up to date with Main Branch
-----------------------------------------------------------------------------------------------------
[node-fetch] -
const headers = {
      'User-Agent': 'YourApp/0.1 by YourRedditUsername'
    };
    fetch('https://www.reddit.com/r/memes/random/.json', { headers })
    .then(response => response.json())
node-fetch is hell. 'got' npm is the way to go. it's simpler, easier to use, and faster (in my opinion)

[Discord-Opus] - To install discord opus, ensure python, nodejs, npm (node package manager), and most importantly, "Desktop Development with c++" Workload from Visual Studio 2022 or newer is installed, or else it will not install.

Do NOT update Node_Module "chalk" past v"^4.1.2". 
Newer versions use TS, which won't work with this program, rendering many features, such as custom errors, useless.

Probably Useful
https://discord.com/developers/docs/reference

-Slash CMD Localization Stuff
id	Indonesian	        Bahasa Indonesia
da	Danish	                Dansk
de	German	                Deutsch
en-GB	English, UK	        English, UK
en-US	English, US	        English, US
es-ES	Spanish	                Español
fr	French	                Français
hr	Croatian	        Hrvatski
it	Italian	                Italiano
lt	Lithuanian	        Lietuviškai
hu	Hungarian	        Magyar
nl	Dutch	                Nederlands
no	Norwegian	        Norsk
pl	Polish	                Polski
pt-BR	Portuguese, Brazilian	Português do Brasil
ro	Romanian, Romania	Română
fi	Finnish	                Suomi
sv-SE	Swedish	                Svenska
vi	Vietnamese	        Tiếng Việt
tr	Turkish	                Türkçe
cs	Czech	                Čeština
el	Greek	                Ελληνικά
bg	Bulgarian	        български
ru	Russian	                Pусский
uk	Ukrainian	        Українська
hi	Hindi	                हिन्दी
th	Thai	                ไทย
zh-CN	Chinese, China	        中文
ja	Japanese	        日本語
zh-TW	Chinese, Taiwan	        繁體中文
ko	Korean	                한국어

.setNameLocalizations({
	pl: 'pies',
	de: 'hund',
})
.setDescriptionLocalizations({
	pl: 'Słodkie zdjęcie pieska!',
	de: 'Poste ein niedliches Hundebild!',
})
.setDefaultMemberPermissions()

- Easy Discord Permissions List
    const { PermissionsBitField } = require("discord.js");

    let permissionsArray = [];

    Object.keys(PermissionsBitField.Flags).forEach(permission => {
        permissionsArray.push(permission);
    });
    
    console.log(permissionsArray.join(', '));

FOR REFERENCE:
(46) Perms
CreateInstantInvite, KickMembers, BanMembers, Administrator, ManageChannels, ManageGuild, AddReactions, ViewAuditLog, PrioritySpeaker, Stream, ViewChannel, SendMessages, SendTTSMessages, ManageMessages, EmbedLinks, AttachFiles, ReadMessageHistory, MentionEveryone, UseExternalEmojis, ViewGuildInsights, Connect, Speak, MuteMembers, DeafenMembers, MoveMembers, UseVAD, ChangeNickname, ManageNicknames, ManageRoles, ManageWebhooks, ManageEmojisAndStickers, ManageGuildExpressions, UseApplicationCommands, RequestToSpeak, ManageEvents, ManageThreads, CreatePublicThreads, CreatePrivateThreads, UseExternalStickers, SendMessagesInThreads, UseEmbeddedActivities, ModerateMembers, ViewCreatorMonetizationAnalytics, UseSoundboard, UseExternalSounds, SendVoiceMessages

- To be disputed
// Function to add custom permissions to a command
async function addCustomPermissions(guildId, commandName, permissions) {
  const guild = await Guild.findOne({ guildId });

  if (guild) {
    guild.customPerms = guild.customPerms || {};
    guild.customPerms[commandName] = permissions;
    await guild.save();
  } else {
    const newGuild = new Guild({
      guildId,
      customPerms: { [commandName]: permissions }
    });
    await newGuild.save();
  }
}

- C:\Recovery\OEM\Wimage\Skin\icons for icons
- Auto delete message after certain amount of time
.then(m => {
          setTimeout(() => {
              m.delete().catch(console.error);
          }, 10000); 
      });

- Collector Stuff
collector.stop()
collector.resetTimer()
      filter = (interaction) => {
        return (
          (interaction.isButton() || interaction.isStringSelectMenu()) &&
          interaction.user.id === message.author.id 
        );
      };
or just filter: message.user.id === message.author.id, vice versa

- Example of cool thing for recognizing Best Match of something (Found in help.js)

        const stringSimilarity = require('string-similarity');

        let allCommands = client.commands.map(cmd => cmd.name.toLowerCase()),
        { bestMatch } = stringSimilarity.findBestMatch(input.toLowerCase(), allCommands),
        closestMatch = bestMatch.target,
        similarityScore = bestMatch.rating;
      
        let info = `If you see this, something legit ain't right. Contact the bot dev asap: fluffydreams.`;
      
        info = similarityScore > 0.5
        ? `It appears that I don't have this command\nDid you mean: \`${settings.prefix}${closestMatch}\` ?`
        : `It appears my algorithm doesn't believe this, or a similar, command exists.\nCheck your spelling or run the \`${settings.prefix}help\` command`;
      
        return message.channel.send({embeds: [embed.setColor('#ff0000').setDescription(info)]});

- Dupes
        To avoid Duplicates and put into array, example is:
        const input = [...new Set(client.commands.map(cmd => cmd.category))];
        "new Set()" filters out duplicate values, leaving only unique values. Without "new Set()"
        the output of input could be ['admin', 'utility', 'admin', 'fun', 'utility']

-----------------------------------------------------------------------------------------------------

        This code calculates the input number, (Decimal Number)
        and does the necessary calculations with divisionResult
        To be deleted, changed, and implimented into math.js in future updates.
        (Lets the code output have a certain number of decimal numbers)

        function divide(x, by) {
        return `${x / by}.${(Number(x % by) / Number(by)).toFixed(4).slice(x >= 0n === by >= 0n ? 2 : 3)}`
        }

        console.log(divide(76561198395997581n, 16n))
-----------------------------------------------------------------------------------------------------
        In order to continue a timed thing such as mute, when the bot comes online
        it reads all guild warnings time, does the necessary calculations to determine
        how much time is left, and continues a new timer based on whats left, in discord, else
        it deletes the timer automatically and runs the proper command, such as unmuting said person
-----------------------------------------------------------------------------------------------------
        Have discord bot have a cache system to retrieve said information that is
        frequented by discord bot or users, as to prevent rate limiting
-----------------------------------------------------------------------------------------------------
        Impliment a feature where the discord bot periodically (every month) checks
        if a certain node module has an update, then it checks if the update is required
        and installs the update
-----------------------------------------------------------------------------------------------------
# .env File
prefix = "-"
token = "bot token"
mongoDB = "mongodb connection"
theme = "#9fe3ed"
owners = "your user id", "someone elses", "or another", "and another", "or yet another"
supportServer = "your server invite link"