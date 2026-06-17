const asyncHandler = require("express-async-handler");
const Expense = require("../models/Expense");
const Settlement = require("../models/Settlement");
const { simplifyDebts } = require("../utils/debtSimplifier");
const { parseMoneyToPaise, paiseToAmount } = require("../utils/money");

function addBalance(balancePaiseByUser, userId, deltaPaise) {
  balancePaiseByUser.set(userId, (balancePaiseByUser.get(userId) || 0) + deltaPaise);
}

function getExpenseShares(expense) {
  if (Array.isArray(expense.splitShares) && expense.splitShares.length > 0) {
    return expense.splitShares.map((share) => ({
      userId: share.user.toString(),
      amountInPaise: share.amountInPaise
    }));
  }

  const totalPaise = expense.amountInPaise || parseMoneyToPaise(expense.amount);
  const splitMembers = expense.splitBetween || [];
  const baseSharePaise = Math.floor(totalPaise / splitMembers.length);
  const remainderPaise = totalPaise % splitMembers.length;

  return splitMembers.map((memberId, index) => ({
    userId: memberId.toString(),
    amountInPaise: baseSharePaise + (index < remainderPaise ? 1 : 0)
  }));
}

async function computeBalances(groupId, memberIds) {
  const balancePaiseByUser = new Map(memberIds.map((id) => [id.toString(), 0]));
  const expenses = await Expense.find({ groupId });
  const settledPayments = await Settlement.find({ groupId, status: "settled" });

  expenses.forEach((expense) => {
    const expenseAmountPaise = expense.amountInPaise || parseMoneyToPaise(expense.amount);
    addBalance(balancePaiseByUser, expense.payer.toString(), expenseAmountPaise);
    getExpenseShares(expense).forEach((share) => addBalance(balancePaiseByUser, share.userId, -share.amountInPaise));
  });

  settledPayments.forEach((settlement) => {
    const settlementPaise = parseMoneyToPaise(settlement.amount);
    addBalance(balancePaiseByUser, settlement.fromUser.toString(), settlementPaise);
    addBalance(balancePaiseByUser, settlement.toUser.toString(), -settlementPaise);
  });

  return Array.from(balancePaiseByUser.entries()).map(([userId, balancePaise]) => ({
    userId,
    balance: paiseToAmount(balancePaise)
  }));
}

const getSettlements = asyncHandler(async (req, res) => {
  const balances = await computeBalances(req.group._id, req.group.members);
  const simplified = simplifyDebts(balances);
  const history = await Settlement.find({ groupId: req.group._id })
    .sort({ timestamp: -1 })
    .populate("fromUser", "name email")
    .populate("toUser", "name email");

  await req.group.populate("members", "name email");
  const memberById = new Map(req.group.members.map((member) => [member._id.toString(), member]));

  res.json({
    balances: balances.map(({ userId, balance }) => ({ user: memberById.get(userId), balance })),
    simplified: simplified.map((item) => ({
      ...item,
      fromUser: memberById.get(item.fromUser),
      toUser: memberById.get(item.toUser)
    })),
    history
  });
});

const createSettlement = asyncHandler(async (req, res) => {
  const { fromUser, toUser, amount, status = "settled" } = req.body;
  if (!fromUser || !toUser || !amount) {
    res.status(400);
    throw new Error("fromUser, toUser, and amount are required");
  }

  const memberIds = req.group.members.map((id) => id.toString());
  if (!memberIds.includes(String(fromUser)) || !memberIds.includes(String(toUser))) {
    res.status(400);
    throw new Error("Settlement users must belong to the group");
  }

  const settlement = await Settlement.create({
    groupId: req.group._id,
    fromUser,
    toUser,
    amount: Number(amount),
    status
  });

  await settlement.populate("fromUser", "name email");
  await settlement.populate("toUser", "name email");
  res.status(201).json(settlement);
});

const markSettled = asyncHandler(async (req, res) => {
  const settlement = await Settlement.findOne({ _id: req.params.settlementId, groupId: req.group._id });
  if (!settlement) {
    res.status(404);
    throw new Error("Settlement not found");
  }

  settlement.status = "settled";
  settlement.timestamp = new Date();
  await settlement.save();
  await settlement.populate("fromUser", "name email");
  await settlement.populate("toUser", "name email");
  res.json(settlement);
});

module.exports = { getSettlements, createSettlement, markSettled };
