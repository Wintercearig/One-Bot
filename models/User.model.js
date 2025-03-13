const { model, Schema, models } = require("mongoose");

const userSchema = new Schema({
    user_id: { type: String, required: true },
    /*
    money: { type: Number, default: 2000, min: 0 },
    bank: { type: Number, default: 0, min: 0 },
    level: { type: Number, default: 1, min: 1, max: 100 },
    afk: {
      type: Object,
      default: {
        is_afk: false,
        reason: null,
      },
    },
    inventory: {
      type: Array,
      default: [],
    },
    inventoryValue: { type: Number, default: 0, min: 0 },
    cooldowns: {
      type: Object,
      default: {
        daily: 0,
        weekly: 0,
        monthly: 0,
        yearly: 0,
        tip: 0,
        rob: 0,
        crime: 0,
        work: 0,
        fishing: 0,
        hunting: 0,
        mining: 0,
        woodcutting: 0,
      },  
    },
    reminder: {
      type: Object,
      default: {
        hasReminder: false,
        reminders: [],
      },
    },
    notifications: {
        type: Map,
        of: Boolean,
        default: new Map([
            ['newMessage', true],
            ['eventReminder', true],
            // Add more notification types here
        ])
    }
    blacklisted: { type: Boolean, default: false },
    */
}, {
  strict: false
});

module.exports = models.User || model("User", userSchema);