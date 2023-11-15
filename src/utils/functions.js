const User = require("../../models/User.model");
const Guild = require("../../models/Guild.model");
const Case = require("../../models/Case.model");
const Logger = require("../modules/Logger");
const { Util } = require("discord.js");
// const { errorLogsChannelId, dashboard } = require("../../config.json");
// const jwt = require("jsonwebtoken");
const fs = require("fs");

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

async function addCase(guildId, userId, moderator, action, reason) {
  try {
    // Find the guild's document or create a new one if it doesn't exist
    let guildCase = await Case.findOne({ guildId: guildId });

    if (!guildCase) {
      guildCase = new Case({
        guildId: guildId,
        cases: new Map(),
        caseCounter: 1, // Initialize the global case counter
      });
    }

    // Find the user's cases map or create a new one if it doesn't exist
    let userCases = guildCase.cases.get(userId);

    if (!userCases) {
      userCases = new Map();
      guildCase.cases.set(userId, userCases);
    }

    // Increment the global case counter
    const caseId = guildCase.caseCounter;

    // Create a new case entry and add it to the user's cases
    const newCase = {
      moderator: moderator,
      action: action,
      reason: reason,
      timestamp: Date.now(),
    };

    userCases.set(caseId, newCase);

    // Increment the global case counter for the next case
    guildCase.caseCounter++;

    // Save the updated guildCase document
    await guildCase.save();

    return newCase;
  } catch (e) {
    console.error(e);
  }
}

async function getLatestCaseNumber(guildId, userId) {
  // Find the guild's document
  const guildCase = await Case.findOne({ guildId: guildId });

  if (!guildCase) {
    return null; // Guild not found
  }

  // Find the user's cases map
  const userCases = guildCase.cases.get(userId);

  if (!userCases) {
    return null; // User not found
  }

  // Find the latest case number for the user
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
      throw Error("'data' must be an object");
    }

    const user = await getUserById(userId);

    if (!user) {
      await addUser(userId);
    }

    await User.findOneAndUpdate({ user_id: userId }, data);
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

const calculateUserXp = (xp) => Math.floor(0.1 * Math.sqrt(xp));

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
  toCapitalize,
  calculateUserXp,
  getUserById,
  addGuild,
  addUser,
  removeUser,
  updateUserById,
  getGuildById,
  updateGuildById,
  removeGuild,
  addWarning,
  removeUserWarnings,
  findMember,
  getGuildLang,
  getLanguages,
  // handleApiRequest,
  parseMessage,
  createWebhook,
  getWebhook,
  escapeMarkdown,
  findOrCreateMutedRole,
  updateMuteChannelPerms,
  // checkAuth,
  formatNumber,
  createStarboard,
  findRole,
  formattedDate,
  addCase,
  getLatestCaseNumber
};
