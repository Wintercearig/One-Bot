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
    */
}, {
  strict: false
});

module.exports = models.User || model("User", userSchema);