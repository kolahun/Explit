const { parseMoneyToPaise, paiseToAmount } = require("./money");

const EXPENSE_CATEGORIES = ["Food", "Travel", "Rent", "Entertainment", "Miscellaneous"];
const SPLIT_METHODS = ["EQUAL", "EXACT", "PERCENTAGE"];
const FULL_PERCENTAGE_BASIS_POINTS = 10000;

function normalizeId(value) {
  return String(value);
}

function parsePercentageToBasisPoints(value) {
  const numericValue = typeof value === "string" ? Number(value.trim()) : Number(value);
  if (!Number.isFinite(numericValue) || numericValue <= 0) {
    throw new Error("Percentages must be valid numbers greater than zero");
  }

  return Math.round(numericValue * 100);
}

function validateMembers(memberIds, payer, selectedUserIds) {
  if (!memberIds.includes(normalizeId(payer))) {
    throw new Error("Payer must belong to the group");
  }

  if (selectedUserIds.length === 0) {
    throw new Error("At least one member must be included in the split");
  }

  if (new Set(selectedUserIds).size !== selectedUserIds.length) {
    throw new Error("Each split member can only appear once");
  }

  if (selectedUserIds.some((userId) => !memberIds.includes(userId))) {
    throw new Error("Split members must belong to the group");
  }
}

function buildEqualShares(totalPaise, selectedUserIds) {
  const baseSharePaise = Math.floor(totalPaise / selectedUserIds.length);
  const remainderPaise = totalPaise % selectedUserIds.length;

  return selectedUserIds.map((userId, index) => {
    const amountInPaise = baseSharePaise + (index < remainderPaise ? 1 : 0);
    const percentage = Number(((amountInPaise / totalPaise) * 100).toFixed(2));

    return {
      user: userId,
      amountInPaise,
      amount: paiseToAmount(amountInPaise),
      percentage
    };
  });
}

function buildExactShares(totalPaise, splitEntries) {
  const shares = splitEntries.map((entry) => {
    const amountInPaise = parseMoneyToPaise(entry.amount);

    return {
      user: normalizeId(entry.userId),
      amountInPaise,
      amount: paiseToAmount(amountInPaise)
    };
  });

  const totalSharesPaise = shares.reduce((sum, share) => sum + share.amountInPaise, 0);
  if (totalSharesPaise !== totalPaise) {
    throw new Error("Exact split amounts must add up to the total expense");
  }

  return shares.map((share) => ({
    ...share,
    percentage: Number(((share.amountInPaise / totalPaise) * 100).toFixed(2))
  }));
}

function buildPercentageShares(totalPaise, splitEntries) {
  const parsedEntries = splitEntries.map((entry) => ({
    user: normalizeId(entry.userId),
    basisPoints: parsePercentageToBasisPoints(entry.percentage)
  }));

  const totalBasisPoints = parsedEntries.reduce((sum, entry) => sum + entry.basisPoints, 0);
  if (totalBasisPoints !== FULL_PERCENTAGE_BASIS_POINTS) {
    throw new Error("Percentage split must add up to 100%");
  }

  const computedShares = parsedEntries.map((entry) => {
    const rawPaise = (totalPaise * entry.basisPoints) / FULL_PERCENTAGE_BASIS_POINTS;
    const amountInPaise = Math.floor(rawPaise);

    return {
      user: entry.user,
      basisPoints: entry.basisPoints,
      amountInPaise,
      fractionalRemainder: rawPaise - amountInPaise
    };
  });

  let remainderPaise = totalPaise - computedShares.reduce((sum, share) => sum + share.amountInPaise, 0);
  computedShares
    .sort((left, right) => right.fractionalRemainder - left.fractionalRemainder)
    .forEach((share) => {
      if (remainderPaise <= 0) return;
      share.amountInPaise += 1;
      remainderPaise -= 1;
    });

  return computedShares
    .sort((left, right) => parsedEntries.findIndex((entry) => entry.user === left.user) - parsedEntries.findIndex((entry) => entry.user === right.user))
    .map((share) => ({
      user: share.user,
      amountInPaise: share.amountInPaise,
      amount: paiseToAmount(share.amountInPaise),
      percentage: Number((share.basisPoints / 100).toFixed(2))
    }));
}

function buildPaidByEntries(totalPaise, paidByRaw, memberIds) {
  if (!Array.isArray(paidByRaw) || paidByRaw.length === 0) {
    return [];
  }

  const entries = paidByRaw
    .filter((entry) => {
      const amt = Number(entry.amount);
      return Number.isFinite(amt) && amt > 0;
    })
    .map((entry) => {
      const userId = normalizeId(entry.userId);
      const amountInPaise = parseMoneyToPaise(entry.amount);
      return {
        user: userId,
        amount: paiseToAmount(amountInPaise),
        amountInPaise
      };
    });

  if (entries.length === 0) {
    return [];
  }

  const unknownPayers = entries.filter((entry) => !memberIds.includes(entry.user));
  if (unknownPayers.length > 0) {
    throw new Error("All payers must belong to the group");
  }

  const totalPaidPaise = entries.reduce((sum, entry) => sum + entry.amountInPaise, 0);
  if (totalPaidPaise !== totalPaise) {
    throw new Error("Paid amounts must add up to the total expense");
  }

  return entries;
}

function buildExpensePayload(group, payload) {
  const { amount, payer, category = "Miscellaneous", splitMethod = "EQUAL", splitBetween = [], splitEntries = [], paidBy = [] } = payload;
  const normalizedSplitMethod = String(splitMethod).toUpperCase();

  if (!SPLIT_METHODS.includes(normalizedSplitMethod)) {
    throw new Error("splitMethod must be EQUAL, EXACT, or PERCENTAGE");
  }

  if (!EXPENSE_CATEGORIES.includes(category)) {
    throw new Error("category must be one of the supported expense categories");
  }

  const totalPaise = parseMoneyToPaise(amount);
  const memberIds = group.members.map((memberId) => normalizeId(memberId));

  let selectedUserIds;
  let shares;

  if (normalizedSplitMethod === "EQUAL") {
    selectedUserIds = splitBetween.map(normalizeId);
    validateMembers(memberIds, payer, selectedUserIds);
    shares = buildEqualShares(totalPaise, selectedUserIds);
  } else {
    if (!Array.isArray(splitEntries) || splitEntries.length === 0) {
      throw new Error("splitEntries are required for exact and percentage splits");
    }

    selectedUserIds = splitEntries.map((entry) => normalizeId(entry.userId));
    validateMembers(memberIds, payer, selectedUserIds);
    shares = normalizedSplitMethod === "EXACT"
      ? buildExactShares(totalPaise, splitEntries)
      : buildPercentageShares(totalPaise, splitEntries);
  }

  const paidByEntries = buildPaidByEntries(totalPaise, paidBy, memberIds);

  return {
    payer,
    amount: paiseToAmount(totalPaise),
    amountInPaise: totalPaise,
    category,
    splitMethod: normalizedSplitMethod,
    splitBetween: selectedUserIds,
    splitShares: shares,
    paidBy: paidByEntries
  };
}

module.exports = { buildExpensePayload, EXPENSE_CATEGORIES, SPLIT_METHODS };

