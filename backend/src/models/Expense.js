const mongoose = require("mongoose");

const expenseCommentSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    text: { type: String, required: true, trim: true, maxlength: 1000 },
    timestamp: { type: Date, default: Date.now }
  },
  { _id: true }
);

const expenseShareSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    amount: { type: Number, required: true, min: 0 },
    amountInPaise: { type: Number, required: true, min: 1 },
    percentage: { type: Number, required: true, min: 0.01, max: 100 }
  },
  { _id: false }
);

const expenseSchema = new mongoose.Schema(
  {
    groupId: { type: mongoose.Schema.Types.ObjectId, ref: "Group", required: true, index: true },
    payer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    amount: { type: Number, required: true, min: 0.01 },
    amountInPaise: { type: Number, required: true, min: 1 },
    category: {
      type: String,
      enum: ["Food", "Travel", "Rent", "Entertainment", "Miscellaneous"],
      default: "Miscellaneous"
    },
    splitMethod: {
      type: String,
      enum: ["EQUAL", "EXACT", "PERCENTAGE"],
      default: "EQUAL"
    },
    splitBetween: [{ type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }],
    splitShares: { type: [expenseShareSchema], default: [] },
    comments: { type: [expenseCommentSchema], default: [] }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Expense", expenseSchema);
