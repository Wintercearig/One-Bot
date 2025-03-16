// Helper: Random triangular distribution for random base XP.
function randomTriangular(min, max, mode) {
  const u = Math.random();
  const c = (mode - min) / (max - min);
  if (u < c) {
    return min + Math.sqrt(u * (max - min) * (mode - min));
  } else {
    return max - Math.sqrt((1 - u) * (max - min) * (max - mode));
  }
}

// Global map to track the timestamps for XP awarding per user.
const xpMessageTimestamps = new Map();

function xpRequired(level) {
  return Math.round(100 * Math.pow(level, 1.5));
  }

/**
 * Calculates the XP to award for a message.
 * - Chooses a random base XP from 1 to 10 (mode 5).
 * - Applies multipliers: doubling if in a voice channel
 * - Applies spam reduction based on the number of messages in the last 3 seconds:
 *     • 1 message => factor = 1.
 *     • 2 messages => factor ≈ log(3)/log(4).
 *     • 3 messages => factor ≈ log(2)/log(4).
 *     • 4 or more messages => factor = 0.
 *
 * The final XP awarded is:
 *
 *  (baseXP + bonus) * multiplier * spamReduction,
 *
 * rounded down to an integer.
 */
function calculateXP(message) {
  // Choose random base XP (from 1 to 10, mode 5).
  const baseXP = Math.round(randomTriangular(1, 10, 5));

  let multiplier = 1;
  
  // Double XP if the user is in a voice channel.
  if (message.member.voice && message.member.voice.channel) {
    multiplier *= 2;
  }
  
  // Spam reduction: count messages sent within the last 3 seconds.
  const now = Date.now();
  const threshold = 3000; // 3 seconds
  let timestamps = xpMessageTimestamps.get(message.author.id) || [];
  timestamps.push(now);
  timestamps = timestamps.filter(ts => now - ts < threshold);
  xpMessageTimestamps.set(message.author.id, timestamps);

  const count = timestamps.length;
  let spamReduction;
  if (count <= 1) {
    spamReduction = 1;
  } else if (count >= 4) {
    spamReduction = 0;
  } else {
    spamReduction = Math.log(4 - count + 1) / Math.log(4);
  }

  return Math.floor(baseXP * multiplier * spamReduction);
}

/**
 * Adds XP to the user's data and handles leveling up.
 * When XP exceeds the threshold for the current level, the user levels up.
 * If the user reaches level 100, their XP is capped at xpRequired(100) and no more XP is added.
 */
function addXP(userData, xpGained) {
  if (!userData) throw new Error("User data is required.");
  
  userData.xp = (userData.xp || 0) + xpGained;
  
  while (userData.xp >= xpRequired(userData.level) && userData.level < 100) {
    userData.xp -= xpRequired(userData.level);
    userData.level++;
  }
  
  if (userData.level >= 100) {
    userData.xp = xpRequired(100);
  }
  
  return userData;
}

/**
 * Returns the remaining XP needed for the user to reach the next level.
 */
function remainingXP(userData) {
  if (!userData) throw new Error("User data is required.");
  return xpRequired(userData.level) - (userData.xp || 0);
}

/**
 * Call this function whenever a message is received that should award XP.
 * Uses client.getUserById (which creates the user if necessary) and
 * client.updateUserById to update the user document.
 */
async function handleMessageXP(client, message) {
  if (message.author.bot) return;
  
  let { user } = await client.getUserById(message.author.id);
  
  const xpAwarded = calculateXP(message, user.level);
  if (xpAwarded === 0) return;
  
  user = addXP(user, xpAwarded);
  await client.updateUserById(user.user_id, user);
}

module.exports = {
  xpRequired,
  calculateXP,
  addXP,
  handleMessageXP,
  remainingXP
};
