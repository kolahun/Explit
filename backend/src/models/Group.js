const mongoose = require("mongoose");

const groupSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true }]
  },
  { timestamps: true }
);

// Compound index for querying groups by member (most frequent dashboard query)
groupSchema.index({ members: 1 });

module.exports = mongoose.model("Group", groupSchema);
