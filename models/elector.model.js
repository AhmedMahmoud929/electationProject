const mongoose = require("mongoose");

const electorSchema = new mongoose.Schema({
  NID: { type: String, required: true, unique: true },
  fullName: { type: String, required: true },
  job: { type: String, required: true },
  phone: { type: String, required: true },
  electionPlace: { type: String, required: true },
  isElected: { type: Boolean, default: false },
  group: { type: mongoose.Schema.Types.ObjectId, ref: "Group", required: true },
});

const Elector = mongoose.model("Elector", electorSchema);

module.exports = Elector;
