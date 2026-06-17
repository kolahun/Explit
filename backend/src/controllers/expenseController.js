const asyncHandler = require("express-async-handler");
const Expense = require("../models/Expense");
const { sendExpenseCreatedEmail } = require("../services/emailService");
const { buildExpensePayload } = require("../utils/expenseSplit");

async function populateExpense(expense) {
  await expense.populate("payer", "name email");
  await expense.populate("splitBetween", "name email");
  await expense.populate("splitShares.user", "name email");
  await expense.populate("comments.user", "name email");
}

const listExpenses = asyncHandler(async (req, res) => {
  const expenses = await Expense.find({ groupId: req.group._id })
    .sort({ createdAt: -1 })
    .populate("payer", "name email")
    .populate("splitBetween", "name email")
    .populate("splitShares.user", "name email")
    .populate("comments.user", "name email");

  res.json(expenses);
});

const addExpense = asyncHandler(async (req, res) => {
  const { payer } = req.body;
  if (!payer) {
    res.status(400);
    throw new Error("payer is required");
  }

  let expensePayload;
  try {
    expensePayload = buildExpensePayload(req.group, req.body);
  } catch (error) {
    res.status(400);
    throw error;
  }

  const expense = await Expense.create({
    groupId: req.group._id,
    ...expensePayload
  });

  await populateExpense(expense);
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

const updateExpense = asyncHandler(async (req, res) => {
  if (!req.body.payer) {
    res.status(400);
    throw new Error("payer is required");
  }

  const expense = await Expense.findOne({ _id: req.params.expenseId, groupId: req.group._id });
  if (!expense) {
    res.status(404);
    throw new Error("Expense not found");
  }

  let expensePayload;
  try {
    expensePayload = buildExpensePayload(req.group, req.body);
  } catch (error) {
    res.status(400);
    throw error;
  }

  Object.assign(expense, expensePayload);
  await expense.save();
  await populateExpense(expense);

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

const addComment = asyncHandler(async (req, res) => {
  const { text } = req.body;
  if (!text || !text.trim()) {
    res.status(400);
    throw new Error("Comment text is required");
  }

  const expense = await Expense.findOne({ _id: req.params.expenseId, groupId: req.group._id });
  if (!expense) {
    res.status(404);
    throw new Error("Expense not found");
  }

  expense.comments.push({
    user: req.user._id,
    text: text.trim()
  });

  await expense.save();
  await populateExpense(expense);
  res.status(201).json(expense);
});

module.exports = { listExpenses, addExpense, updateExpense, deleteExpense, addComment };
