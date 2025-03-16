const User = require("../../models/User.model");
const Guild = require("../../models/Guild.model");
const Case = require("../../models/Case.model");
const Logger = require("../modules/Logger");
const { Util } = require("discord.js");
const BaseEmbed = require("../modules/BaseEmbed");
// const { errorLogsChannelId, dashboard } = require("../../config.json");
// const jwt = require("jsonwebtoken");
const fs = require("fs");

const errorEmbed = (permissions, message) => {
  return BaseEmbed(message)
    .setTitle("Woah!")
    .setDescription(`❌ I need ${permissions.map((p) => `\`${p}\``).join(", ")} permissions!`)
    .setColor(process.env.error);
};

function getTrackInfo(track) {
  let color;
  let iconUrl;

  switch (track) {
      case 'youtube':
          color = '#FF0000';
          iconUrl = 'https://github.com/Wintercearig/One-Bot/blob/main/src/images/youtube-music.png?raw=true';
          break;
      case 'spotify':
          color = '#1DB954';
          iconUrl = 'https://github.com/Wintercearig/One-Bot/blob/main/src/images/spotify.png?raw=true';
          break;
      case 'apple':
          color = '#FFFFFF';
          iconUrl = 'https://github.com/Wintercearig/One-Bot/blob/main/src/images/applemusic.png?raw=true';
          break;
      default:
          color = '#000000';
          iconUrl = 'https://github.com/Wintercearig/One-Bot/blob/main/src/images/default.png?raw=true';
  }

  return {
      color: color,
      iconUrl: iconUrl,
  };
}

function formattedDate() {
  const date = new Date();
  const options = {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      timeZoneName: 'long'
  };

  return new Intl.DateTimeFormat('en-US', options).format(date);
}

async function getCategoryDescription(category) {
  const categoryLower = category.toLowerCase();
  switch (categoryLower) {
    case 'admin':
      return 'Take charge. Command your server with precision. Manage settings, enforce policies, and ensure smooth operation. Admin controls for ultimate authority.';
    case 'economy':
      return 'Keep the money flowing. Manage your virtual currency, earn rewards, and engage in economic activities to enhance the interactive and dynamic experience.';
    case 'games':
      return 'Dive into the world of fun and entertainment. Enjoy various interactive and engaging games, including classics and unique experiences, to have a great time with fellow server members.';
    case 'giveaway':
      return 'Join the excitement! Win awesome prizes, participate in generous giveaways, and celebrate victories with fellow server members. Your chance to claim fantastic rewards awaits!';
    case 'info':
      return 'Discover server insights, user details, and valuable information. Use commands to check server status and access helpful details.';
    case 'level':
      return 'Climb the ranks! Engage in activities, earn experience, and level up. Show off your achievements, compete with server members, and unlock new perks. Elevate your status and enjoy the journey in the Level category!';
    case 'moderation':
      return ' Maintain order effortlessly. Access powerful tools to manage members and ensure a harmonious server environment. Empower yourself with moderation commands for effective server management.';
    case 'music':
      return 'Groove to the beat! Enjoy melodies, play, skip, and control tunes. Share your favorite tracks with fellow server members in the Music category!';
    case 'tickets':
      return 'Swift support! Manage tickets for efficient issue resolution. Enhance your server support experience with the Tickets category!';
    case 'util':
      return 'Handy utilities at your fingertips. Explore commands for various tasks, ensuring convenience and efficiency. Simplify server management with the Util category';
    default:
      return 'No category description available.';
  }
}

async function addCase(guildId, userId, moderator, action, reason) {
  try {
    let guildCase = await Case.findOne({ guildId: guildId });

    if (!guildCase) {
      guildCase = new Case({
        guildId: guildId,
        cases: new Map(),
        caseCounter: 1,
      });
    }

    let userCases = guildCase.cases.get(userId);

    if (!userCases) {
      userCases = new Map();
      guildCase.cases.set(userId, userCases);
    }

    const caseId = guildCase.caseCounter;

    const newCase = {
      moderator: moderator,
      action: action,
      reason: reason,
      timestamp: Date.now(),
    };

    userCases.set(caseId, newCase);

    guildCase.caseCounter++;

    await guildCase.save();

    return newCase;
  } catch (e) {
    console.error(e);
  }
}

async function getLatestCaseNumber(guildId, userId) {
  const guildCase = await Case.findOne({ guildId: guildId });

  if (!guildCase) {
    return null;
  }

  const userCases = guildCase.cases.get(userId);

  if (!userCases) {
    return null;
  }

  let latestCaseNumber = 0;
  for (const caseNumber of userCases.keys()) {
    if (caseNumber > latestCaseNumber) {
      latestCaseNumber = caseNumber;
    }
  }

  return latestCaseNumber;
}

async function getUserById(userId) {
  try {
    let user = await User.findOne({ user_id: userId });
    
    if (!user) {
      user = await addUser({
        user_id: userId
      });
    }

    return {
      user
    };
  } catch (e) {
    console.error(e);
  }
}

async function checkUserPermissions(member, requiredPermissions) {
	return requiredPermissions.every(permission => member.hasPermission(permission));
}

async function addUser(userId) {
  try {
    const user = new User({ user_id: userId });

    await user.save();

    return user;
  } catch (e) {
    console.error(e);
  }
}

async function updateUserById(userId, data) {
  try {
    if (typeof data !== "object") {
      throw new Error("'data' must be an object");
    }
    
    const updatedUser = await User.findOneAndUpdate(
      { user_id: userId },
      { $set: data },
      { new: true, upsert: true }
    );
    return updatedUser;
  } catch (e) {
    console.error(e);
  }
}

async function removeUser(userId) {
  try {
    await User.findOneAndDelete({ user_id: userId});
  } catch (e) {
    console.error(e);
  }
}

async function getGuildById(guildId) {
  try {
    let guild = await Guild.findOne({ guild_id: guildId });

    if (!guild) {
      guild = await addGuild(guildId);
    }

    return guild;
  } catch (e) {
    Logger.error("GET_GUILD_BY_ID", e.stack || e);
  }
}

async function updateGuildById(guildId, settings) {
  try {
    if (typeof settings !== "object") {
      throw Error("'settings' must be an object");
    }

    // check if guild exists
    const guild = await getGuildById(guildId);

    if (!guild) {
      await addGuild(guildId);
    }

    await Guild.findOneAndUpdate(guildId, settings);
  } catch (e) {
    console.error(e);
  }
}

async function updateUserNotifs(userId, notifType, isEnabled) {
  try {
    const normalizedNotifType = notifType.toLowerCase();
    let update = {};

    const user = await User.findOne({ user_id: userId });
    if (!user) {
      const newUser = new User({
        user_id: userId,
        notifications: normalizedNotifType
      });
      await newUser.save();

    } else {
      if (isEnabled) {
        update = { $addToSet: { notifications: normalizedNotifType } };
      } else {
        update = { $pull: { notifications: normalizedNotifType } };
      }

      await User.findOneAndUpdate(
        { user_id: userId },
        update,
        { returnDocument: 'after' }
      );
    }
  } catch (error) {
    console.log('Error updating user notif settings', error);
  }
}

async function sendBotUpdates(client, notificationMessage) {
  try {
    // Fetch users from the database who have 'bot updates' enabled
    const usersWithBotUpdates = await User.find({ notifications: { $in: ['botupdates'] } });

    // Send a DM to each user
    for (const user of usersWithBotUpdates) {
      try {
        const recipient = await client.users.fetch(user.user_id);
        await recipient.send(notificationMessage);
      } catch (error) {
        console.error(`Could not send message to user ${user.user_id}:`, error);
      }
    }
  } catch (error) {
    console.error('Error sending bot updates notifications:', error);
  }
}

async function addGuild(guildId) {
  try {
    const guild = new Guild({ guild_id: guildId });

    await guild.save();

    return guild;
  } catch (e) {
    console.error(e);
  }
}

async function removeGuild(guildId) {
  try {
    await Guild.findOneAndDelete({ guild_id: guildId });
  } catch (e) {
    console.error(e);
  }
}

async function addWarning(userId, guildId, reason) {
  try {
    const guild = await Guild.findOne({ guild_id: guildId });

    const newWarning = {
      user_id: userId,
      reason: reason,
      date: Date.now()
    };

    guild.warnings.push(newWarning);
    await guild.save();

  } catch (e) {
    console.error(e);
  }
}

async function removeUserWarnings(userId, guildId) {
  try {
    await Guild.findOneAndUpdate({ guild_id: guildId, warnings: { user_id: userId } });
  } catch (e) {
    console.error(e);
  }
}

async function findMember(message, args, allowAuthor) {
  let member;

  member = message.guild.member(
    message.mentions.users.first() ||
      message.guild.members.cache.get(args[0]) ||
      message.guild.members.cache.find((m) => m.user.id === args[0]) ||
      message.guild.members.cache.find((m) => m.user.tag === args[0])
  );

  if (!member) {
    member = message.guild.member(
      await message.guild.members.fetch(args[0]).catch(() => (member = null))
    );
  }

  if (!member && allowAuthor) {
    member = message.member;
  }

  return member;
}

async function findRole(message, arg) {
  return (
    message.mentions.roles.first() ||
    message.guild.roles.cache.get(arg) ||
    message.guild.roles.cache.find((r) => r.name === arg) ||
    message.guild.roles.cache.find((r) => r.name.startsWith(arg)) ||
    (await message.guild.roles.fetch(arg))
  );
}

async function getGuildLang(guildId) {
  try {
    const guild = await getGuildById(guildId);

    return require(`../locales/${guild.locale || "english"}`);
  } catch (e) {
    console.error(e);
  }
}

const toCapitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1);

function getLanguages() {
  return fs
    .readdirSync("./src/locales/")
    .filter((f) => f.endsWith(".js"))
    .map((la) => la.slice(0, -3));
}

function formatNumber(n) {
  return n.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,");
}

async function createWebhook(client, channelId, oldChannelId) {
  const channel = client.channels.cache.get(channelId);
  if (!channel) return;
  if (!channel.permissionsFor(client.user.id).has("MANAGE_WEBHOOKS")) return;

  if (oldChannelId) {
    const w = await channel.fetchWebhooks();
    w.find((w) => w.name === `one-bot-logs`).delete();
  }

  await channel.createWebhook(`one-bot-logs`, {
    avatar: client.user.displayAvatarURL({ format: "webp" }),
  });
}

async function getWebhook(guild) {
  if (!guild.me.hasPermission(["MANAGE_WEBHOOKS"])) return;
  const w = await guild.fetchWebhooks();
  const g = await getGuildById(guild.id);
  if (!g) return; 
  const webhook = w.find((w) => w.name === `one-bot-logs`);
  if (!webhook) return null;

  return webhook;
}

function parseMessage(message, user, msg) {
  const newMessage = message
    .split(" ")
    .map((word) => {
      const { username, tag, id, discriminator, createdAt } = user;
      let w = word;

      w = w
        .replace("{user}", user)
        .replace("{user.tag}", escapeMarkdown(tag))
        .replace("{user.username}", escapeMarkdown(username))
        .replace("{user.discriminator}", discriminator)
        .replace("{user.id}", id)
        .replace("{user.createdAt}", new Date(createdAt).toLocaleString());

      if (msg) {
        w.replace("{guild.id}", msg.guild.id)
          .replace("{guild.name}", escapeMarkdown(msg.guild.name))
          .replace("{message.author}", msg.author)
          .replace("{message.author.id}", msg.author.id)
          .replace("{message.author.tag}", escapeMarkdown(msg.author.tag))
          .replace(
            "{message.author.username}",
            escapeMarkdown(escapeMarkdown(msg.author.username))
          );
      }

      return w;
    })
    .join(" ");

  return newMessage;
}

function escapeMarkdown(m) {
  return Util.escapeMarkdown(m, {
    codeBlock: true,
    spoiler: true,
    inlineCode: true,
    inlineCodeContent: true,
    codeBlockContent: true,
  });
}

async function findOrCreateMutedRole(guild) {
  const { muted_role_id } = await getGuildById(guild.id);
  return (
    guild.roles.cache.find((r) => r.id === muted_role_id) ||
    guild.roles.cache.find((r) => r.name === "muted") ||
    (await guild.roles.create({
      data: {
        name: "muted",
        color: "GRAY",
      },
      reason: "Mute a user",
    }))
  );
}

function updateMuteChannelPerms(guild, memberId, perms) {
  guild.channels.cache.forEach((channel) => {
    channel.updateOverwrite(memberId, perms).catch((e) => {
      Logger.error("mute_user", e.stack || e);
    });
  });
}

async function createStarboard(client, channel, options, deleteOld) {
  if (deleteOld) {
    client.starboardsManager.delete(deleteOld);
  }

  await client.starboardsManager.create(channel, {
    // eslint-disable-next-line node/no-unsupported-features/es-syntax
    ...options,
    selfStar: true,
    starEmbed: true,
    attachments: true,
    resolveImageUrl: true,
  });
}

/* async function handleApiRequest(path, token, method) {
  try {
    const bearer =
      token.type === "Bearer" ? jwt.verify(token.data, dashboard.jwtSecret) : token.data;

    if (!bearer) {
      return { error: "invalid_token" };
    }

    const res = await fetch(`${dashboard.discordApiUrl}${path}`, {
      method,
      headers: {
        Authorization: `${token.type} ${bearer}`,
      },
      scope: "guilds",
    });
    return await res.json();
  } catch (e) {
    return { error: "invalid_token" };
  }
}

async function checkAuth(req) {
  const token = req.cookies.token || req.headers.auth;
  const data = await handleApiRequest("/users/@me", {
    type: "Bearer",
    data: token,
  });

  if (data.error) {
    return Promise.reject(data.error);
  } else {
    return Promise.resolve("Authorized");
  }
}

function encode(obj) {
  let string = "";

  for (const [key, value] of Object.entries(obj)) {
    if (!value) continue;
    string += `&${encodeURIComponent(key)}=${encodeURIComponent(value)}`;
  }

  return string.substring(1);
}
*/

module.exports = {
  addCase,
  addGuild,
  addUser,
  addWarning,
  checkUserPermissions,
  // checkAuth,
  createStarboard,
  createWebhook,
  //encode,
  errorEmbed,
  escapeMarkdown,
  findMember,
  findOrCreateMutedRole,
  findRole,
  formattedDate,
  formatNumber,
  getCategoryDescription,
  getGuildById,
  getGuildLang,
  getLanguages,
  getLatestCaseNumber,
  getTrackInfo,
  getUserById,
  getWebhook,
  // handleApiRequest,
  parseMessage,
  removeGuild,
  removeUser,
  removeUserWarnings,
  sendBotUpdates,
  toCapitalize,
  updateGuildById,
  updateMuteChannelPerms,
  updateUserById,
  updateUserNotifs
};
