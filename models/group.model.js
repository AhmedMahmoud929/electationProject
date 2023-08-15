const mongoose = require("mongoose");

const groupSchema = new mongoose.Schema({
  name: { type: String, required: true },
  electors: [{ type: mongoose.Schema.Types.ObjectId, ref: "Elector" }],
});

const Group = mongoose.model("Group", groupSchema);

module.exports = Group;
