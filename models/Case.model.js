const { model, Schema, models } = require("mongoose");

const caseSchema = new Schema({
  guild_id: { type: String, required: true },
  cases: {
  }
});

module.exports = models.Guild || model("Case", caseSchema);
