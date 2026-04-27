const mongoose = require("mongoose");

const expenseSchema = new mongoose.Schema(
  {
    groupId: { type: mongoose.Schema.Types.ObjectId, ref: "Group", required: true, index: true },
    payer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    amount: { type: Number, required: true, min: 0.01 },
    splitBetween: [{ type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }]
  },
  { timestamps: true }
);

module.exports = mongoose.model("Expense", expenseSchema);
