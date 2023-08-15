const mongoose = require("mongoose");

const adminSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true },
    fullName: { type: String, required: true },
    password: { type: String, required: true },
    isAdmin: { type: Boolean, default: false },
    isSuperAdmin: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("admin", adminSchema);
