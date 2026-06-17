const asyncHandler = require("express-async-handler");
const Expense = require("../models/Expense");
const Group = require("../models/Group");
const Settlement = require("../models/Settlement");
const User = require("../models/User");
const { computeBalances } = require("../utils/balanceComputer");

const listGroups = asyncHandler(async (req, res) => {
  const groups = await Group.find({ members: req.user._id }).populate("members", "name email");
  const totals = await Expense.aggregate([
    { $match: { groupId: { $in: groups.map((group) => group._id) } } },
    { $group: { _id: "$groupId", totalExpense: { $sum: "$amount" } } }
  ]);
  const totalsByGroup = new Map(totals.map((item) => [item._id.toString(), item.totalExpense]));

  const currentUserId = req.user._id.toString();
  const groupsWithBalances = await Promise.all(
    groups.map(async (group) => {
      const balances = await computeBalances(group._id, group.members.map((m) => m._id || m));
      const userBalance = balances.find((b) => b.userId === currentUserId);

      return {
        ...group.toObject(),
        totalExpense: totalsByGroup.get(group._id.toString()) || 0,
        netBalance: userBalance ? userBalance.balance : 0
      };
    })
  );

  res.json(groupsWithBalances);
});

const createGroup = asyncHandler(async (req, res) => {
  const { name } = req.body;
  if (!name) {
    res.status(400);
    throw new Error("Group name is required");
  }

  const group = await Group.create({ name, members: [req.user._id] });
  await group.populate("members", "name email");
  res.status(201).json({ ...group.toObject(), totalExpense: 0 });
});

const getGroup = asyncHandler(async (req, res) => {
  await req.group.populate("members", "name email");
  res.json(req.group);
});

const addMember = asyncHandler(async (req, res) => {
  const { email } = req.body;
  if (!email) {
    res.status(400);
    throw new Error("Email is required");
  }

  const user = await User.findOne({ email: email.toLowerCase().trim() });
  if (!user) {
    res.status(404);
    throw new Error("User must sign in once before they can be added");
  }

  if (!req.group.members.some((memberId) => memberId.equals(user._id))) {
    req.group.members.push(user._id);
    await req.group.save();
  }

  await req.group.populate("members", "name email");
  res.json(req.group);
});

const removeMember = asyncHandler(async (req, res) => {
  const memberId = req.params.memberId;
  if (memberId === req.user._id.toString()) {
    res.status(400);
    throw new Error("You cannot remove yourself from the group");
  }

  const hasExpenses = await Expense.exists({
    groupId: req.group._id,
    $or: [{ payer: memberId }, { splitBetween: memberId }]
  });

  const hasSettlements = await Settlement.exists({
    groupId: req.group._id,
    $or: [{ fromUser: memberId }, { toUser: memberId }]
  });

  if (hasExpenses || hasSettlements) {
    res.status(400);
    throw new Error("This member has expenses or settlements in the group and cannot be removed");
  }

  req.group.members = req.group.members.filter((id) => id.toString() !== memberId);
  await req.group.save();
  await req.group.populate("members", "name email");
  res.json(req.group);
});

const deleteGroup = asyncHandler(async (req, res) => {
  await Promise.all([
    Expense.deleteMany({ groupId: req.group._id }),
    Settlement.deleteMany({ groupId: req.group._id }),
    Group.deleteOne({ _id: req.group._id })
  ]);

  res.json({ id: req.group._id });
});

module.exports = { listGroups, createGroup, getGroup, addMember, removeMember, deleteGroup };
