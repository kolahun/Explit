const mongoose = require("mongoose");

const settlementSchema = new mongoose.Schema(
  {
    groupId: { type: mongoose.Schema.Types.ObjectId, ref: "Group", required: true, index: true },
    fromUser: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    toUser: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    amount: { type: Number, required: true, min: 0.01 },
    status: { type: String, enum: ["pending", "settled"], default: "pending" },
    timestamp: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Settlement", settlementSchema);
