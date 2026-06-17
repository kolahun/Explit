const asyncHandler = require("express-async-handler");
const Settlement = require("../models/Settlement");
const { simplifyDebts } = require("../utils/debtSimplifier");
const { computeBalances } = require("../utils/balanceComputer");

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
