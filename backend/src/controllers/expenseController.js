const asyncHandler = require("express-async-handler");
const Expense = require("../models/Expense");
const { sendExpenseCreatedEmail } = require("../services/emailService");

const listExpenses = asyncHandler(async (req, res) => {
  const expenses = await Expense.find({ groupId: req.group._id })
    .sort({ createdAt: -1 })
    .populate("payer", "name email")
    .populate("splitBetween", "name email");

  res.json(expenses);
});

const addExpense = asyncHandler(async (req, res) => {
  const { amount, payer, splitBetween } = req.body;
  if (!amount || !payer || !Array.isArray(splitBetween) || splitBetween.length === 0) {
    res.status(400);
    throw new Error("amount, payer, and splitBetween are required");
  }

  const memberIds = req.group.members.map((id) => id.toString());
  const selectedIds = splitBetween.map(String);

  if (!memberIds.includes(String(payer)) || selectedIds.some((id) => !memberIds.includes(id))) {
    res.status(400);
    throw new Error("Payer and split members must belong to the group");
  }

  const expense = await Expense.create({
    groupId: req.group._id,
    payer,
    amount: Number(amount),
    splitBetween: selectedIds
  });

  await expense.populate("payer", "name email");
  await expense.populate("splitBetween", "name email");
  await req.group.populate("members", "name email");

  const recipients = req.group.members
    .filter((member) => member.email !== expense.payer.email)
    .map((member) => member.email);

  sendExpenseCreatedEmail({
    recipients,
    groupName: req.group.name,
    payerName: expense.payer.name,
    amount: expense.amount
  }).catch((error) => console.error("Expense email failed:", error.message));

  res.status(201).json(expense);
});

function validateExpenseMembers(group, payer, splitBetween) {
  const memberIds = group.members.map((id) => id.toString());
  const selectedIds = splitBetween.map(String);

  if (!memberIds.includes(String(payer)) || selectedIds.some((id) => !memberIds.includes(id))) {
    return false;
  }

  return true;
}

const updateExpense = asyncHandler(async (req, res) => {
  const { amount, payer, splitBetween } = req.body;
  if (!amount || !payer || !Array.isArray(splitBetween) || splitBetween.length === 0) {
    res.status(400);
    throw new Error("amount, payer, and splitBetween are required");
  }

  if (!validateExpenseMembers(req.group, payer, splitBetween)) {
    res.status(400);
    throw new Error("Payer and split members must belong to the group");
  }

  const expense = await Expense.findOne({ _id: req.params.expenseId, groupId: req.group._id });
  if (!expense) {
    res.status(404);
    throw new Error("Expense not found");
  }

  expense.amount = Number(amount);
  expense.payer = payer;
  expense.splitBetween = splitBetween.map(String);
  await expense.save();
  await expense.populate("payer", "name email");
  await expense.populate("splitBetween", "name email");

  res.json(expense);
});

const deleteExpense = asyncHandler(async (req, res) => {
  const expense = await Expense.findOneAndDelete({ _id: req.params.expenseId, groupId: req.group._id });
  if (!expense) {
    res.status(404);
    throw new Error("Expense not found");
  }

  res.json({ id: expense._id });
});

module.exports = { listExpenses, addExpense, updateExpense, deleteExpense };
