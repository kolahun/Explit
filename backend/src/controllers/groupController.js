const asyncHandler = require("express-async-handler");
const Expense = require("../models/Expense");
const Group = require("../models/Group");
const Settlement = require("../models/Settlement");
const User = require("../models/User");
const { computeBalances } = require("../utils/balanceComputer");

const listGroups = asyncHandler(async (req, res) => {
  const groups = await Group.find({ members: req.user._id }).populate("members", "name email");

  if (groups.length === 0) {
    return res.json([]);
  }

  const groupIds = groups.map((g) => g._id);
  const currentUserId = req.user._id.toString();

  // Bulk fetch: all expenses and settled settlements for all groups in 2 queries (not 2×N)
  const [allExpenses, allSettlements, totalsAgg] = await Promise.all([
    require("../models/Expense").find({ groupId: { $in: groupIds } }).lean(),
    require("../models/Settlement").find({ groupId: { $in: groupIds }, status: "settled" }).lean(),
    require("../models/Expense").aggregate([
      { $match: { groupId: { $in: groupIds } } },
      { $group: { _id: "$groupId", totalExpense: { $sum: "$amount" } } }
    ])
  ]);

  const { parseMoneyToPaise, paiseToAmount } = require("../utils/money");
  const totalsByGroup = new Map(totalsAgg.map((t) => [t._id.toString(), t.totalExpense]));

  // Group expenses and settlements by groupId for O(1) lookup
  const expensesByGroup = new Map();
  const settlementsByGroup = new Map();
  for (const exp of allExpenses) {
    const key = exp.groupId.toString();
    if (!expensesByGroup.has(key)) expensesByGroup.set(key, []);
    expensesByGroup.get(key).push(exp);
  }
  for (const s of allSettlements) {
    const key = s.groupId.toString();
    if (!settlementsByGroup.has(key)) settlementsByGroup.set(key, []);
    settlementsByGroup.get(key).push(s);
  }

  const groupsWithBalances = groups.map((group) => {
    const gid = group._id.toString();
    const expenses = expensesByGroup.get(gid) || [];
    const settlements = settlementsByGroup.get(gid) || [];
    const members = group.members;

    // Compute this group's balance in JS (no extra DB hit)
    const balancePaise = new Map(members.map((m) => [m._id.toString(), 0]));
    for (const exp of expenses) {
      const totalPaise = exp.amountInPaise || parseMoneyToPaise(exp.amount);
      if (Array.isArray(exp.paidBy) && exp.paidBy.length > 0) {
        for (const entry of exp.paidBy) {
          const uid = entry.user.toString();
          balancePaise.set(uid, (balancePaise.get(uid) || 0) + entry.amountInPaise);
        }
      } else {
        const uid = exp.payer.toString();
        balancePaise.set(uid, (balancePaise.get(uid) || 0) + totalPaise);
      }
      // Debit splits
      if (Array.isArray(exp.splitShares) && exp.splitShares.length > 0) {
        for (const share of exp.splitShares) {
          const uid = share.user.toString();
          balancePaise.set(uid, (balancePaise.get(uid) || 0) - share.amountInPaise);
        }
      } else {
        const splitMembers = exp.splitBetween || [];
        const base = Math.floor(totalPaise / splitMembers.length);
        const rem = totalPaise % splitMembers.length;
        splitMembers.forEach((mid, i) => {
          const uid = mid.toString();
          balancePaise.set(uid, (balancePaise.get(uid) || 0) - base - (i < rem ? 1 : 0));
        });
      }
    }
    for (const s of settlements) {
      const sp = parseMoneyToPaise(s.amount);
      const fu = s.fromUser.toString();
      const tu = s.toUser.toString();
      balancePaise.set(fu, (balancePaise.get(fu) || 0) + sp);
      balancePaise.set(tu, (balancePaise.get(tu) || 0) - sp);
    }

    const userBalancePaise = balancePaise.get(currentUserId) || 0;
    return {
      ...group.toObject(),
      totalExpense: totalsByGroup.get(gid) || 0,
      netBalance: paiseToAmount(userBalancePaise)
    };
  });

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
