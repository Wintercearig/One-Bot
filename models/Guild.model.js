const { model, Schema, models } = require("mongoose");

const guildSchema = new Schema({
  guild_id: { type: String, required: true },
  prefix: { type: String, default: "-" },
  // store: { type: Array, default: null },
  // blacklistedwords: { type: Array, default: [] },
  // disabled_commands: { type: Array, default: [] },
  // disabled_categories: { type: Array, default: [] },
  // panel_chan_id: { type: String, default: null },
  // panel_msg_id: { type: String, default: null },
  /*anti_spam: {
    type: Object,
    default: {
      enabled: false,
      warnThreshold: 3,
			kickThreshold: 5,
			banThreshold: 7,
			muteThreshold:4,

			maxInterval: 2000,
			maxDuplicatesInterval: 2000,

			maxDuplicatesWarn: 7,
			maxDuplicatesKick: 10,
			maxDuplicatesBan: 10,
			maxDuplicatesMute: 9,

			modLogsEnabled: false,
      modLogsChannelName: { type: String, default: null },

			warnMessage: '{@user}, Please stop spamming or else you will be muted.',
			muteMessage: '**{user_tag}** has been muted for spamming.',
			kickMessage: '**{user_tag}** has been kicked for spamming.',
			banMessage: '**{user_tag}** has been banned for spamming.',

			errorMessages: true,
			kickErrorMessage: 'Could not kick **{user_tag}** because of improper permissions.',
			banErrorMessage: 'Could not ban **{user_tag}** because of improper permissions.',
			muteErrorMessage: 'Could not mute **{user_tag}** because of improper permissions or the mute role couldn\'t be found.',

			ignoredMembers: [],
			ignoredRoles: [],
			ignoredChannels: [],
			ignoredPermissions:[],
			ignoreBots: true,

			warnEnabled: true,
			kickEnabled: true,
			muteEnabled: true,
			banEnabled: true,

			deleteMessagesAfterBanForPastDays: 1,
			verbose: false,
			debug: false,
			removeMessages: true,

			removeBotMessages: false,
			removeBotMessagesAfter: 10000,
    },
  },
  announce_data: {
    type: Object,
    default: {
      enabled: false,
      channel_id: null,
    },
   },
  suggest_data: {
    type: Object, 
    default: {
      enabled: false,
      channel_id: null,
    },
  },
  level_data: {
    type: Object,
    default: { 
      message: "Congrats to {user.tag} for advancing to level {newLevel}!", 
      enabled: false,
      channel_id: null,
    },
  },
  support_data: {
    type: Object,
    default: {
      enabled: false,
      role_id: null,
    },
  },
  starboards_data: {
    type: Object,
    default: {
      enabled: false, 
      channel_id: null, 
      emoji: "⭐" 
    },
  },
  // mod logs info such as ban, mute, etc
  
  mod_logs: {
    type: Object,
    default: {
      enabled: false,
      channel_id: null,
    },
  },
  warnings:{
    type: Object,
    default: {
      user_id: null,
      reason: null,
      date: null
    },
  },
  muted_role_id: { type: String, default: null },
  muteInfo: {
    type: Object,
    default: {
      user_id: null,
      time: null,
      ends_at: null,
      reason: null,
    },
  },
  banInfo: {
    type: Object,
    default: {
      user_id: null,
      reason: null
    },
  },
  */
});

module.exports = models.Guild || model("Guild", guildSchema);