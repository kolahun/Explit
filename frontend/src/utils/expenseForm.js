export const EXPENSE_CATEGORIES = ["Food", "Travel", "Rent", "Entertainment", "Miscellaneous"];

export const SPLIT_METHOD_OPTIONS = [
  { value: "EQUAL", label: "Equal split", description: "Split the bill evenly across selected members." },
  { value: "EXACT", label: "Exact amounts", description: "Assign precise rupee amounts to each included member." },
  { value: "PERCENTAGE", label: "Percentages", description: "Split by weighted percentages that total 100%." }
];

function buildEntry(memberId, valuesByUser = {}, percentagesByUser = {}) {
  return {
    userId: memberId,
    amount: valuesByUser[memberId] ?? "",
    percentage: percentagesByUser[memberId] ?? ""
  };
}

function buildPaidByEntry(memberId, amountsByUser = {}) {
  return {
    userId: memberId,
    amount: amountsByUser[memberId] ?? ""
  };
}

export function createDefaultExpenseDraft(group) {
  const memberIds = group.members.map((member) => member._id);

  return {
    amount: "",
    payer: memberIds[0] || "",
    category: "Miscellaneous",
    splitMethod: "EQUAL",
    splitBetween: memberIds,
    splitEntries: memberIds.map((memberId) => buildEntry(memberId)),
    isMultiPayer: false,
    paidByEntries: memberIds.map((memberId) => buildPaidByEntry(memberId))
  };
}

export function createExpenseDraftFromExpense(expense, group) {
  const memberIds = group.members.map((member) => member._id);
  const shareAmountByUser = Object.fromEntries(
    (expense.splitShares || []).map((share) => [share.user._id || share.user, share.amount.toFixed(2)])
  );
  const sharePercentageByUser = Object.fromEntries(
    (expense.splitShares || []).map((share) => [share.user._id || share.user, share.percentage.toFixed(2)])
  );

  const hasMultiPayer = Array.isArray(expense.paidBy) && expense.paidBy.length > 0;
  const paidByAmountByUser = hasMultiPayer
    ? Object.fromEntries(expense.paidBy.map((entry) => [entry.user._id || entry.user, entry.amount.toFixed(2)]))
    : {};

  return {
    amount: expense.amount.toFixed(2),
    payer: expense.payer._id,
    category: expense.category || "Miscellaneous",
    splitMethod: expense.splitMethod || "EQUAL",
    splitBetween: expense.splitBetween.map((member) => member._id),
    splitEntries: memberIds.map((memberId) => buildEntry(memberId, shareAmountByUser, sharePercentageByUser)),
    isMultiPayer: hasMultiPayer,
    paidByEntries: memberIds.map((memberId) => buildPaidByEntry(memberId, paidByAmountByUser))
  };
}

export function syncDraftMembers(draft, members) {
  const memberIds = members.map((member) => member._id);
  const selectedMemberIds = draft.splitBetween.filter((memberId) => memberIds.includes(memberId));
  const nextSplitBetween = selectedMemberIds.length > 0 ? selectedMemberIds : memberIds;
  const amountByUser = Object.fromEntries(draft.splitEntries.map((entry) => [entry.userId, entry.amount]));
  const percentageByUser = Object.fromEntries(draft.splitEntries.map((entry) => [entry.userId, entry.percentage]));
  const paidByAmountByUser = Object.fromEntries((draft.paidByEntries || []).map((entry) => [entry.userId, entry.amount]));

  return {
    ...draft,
    payer: memberIds.includes(draft.payer) ? draft.payer : memberIds[0] || "",
    splitBetween: nextSplitBetween,
    splitEntries: memberIds.map((memberId) => buildEntry(memberId, amountByUser, percentageByUser)),
    paidByEntries: memberIds.map((memberId) => buildPaidByEntry(memberId, paidByAmountByUser))
  };
}

export function toggleSplitMember(currentSplitBetween, memberId) {
  return currentSplitBetween.includes(memberId)
    ? currentSplitBetween.filter((id) => id !== memberId)
    : [...currentSplitBetween, memberId];
}

export function buildExpensePayload(draft) {
  const payload = {
    amount: Number(draft.amount),
    payer: draft.payer,
    category: draft.category,
    splitMethod: draft.splitMethod
  };

  if (draft.splitMethod === "EQUAL") {
    payload.splitBetween = draft.splitBetween;
  } else {
    payload.splitEntries = draft.splitEntries
      .filter((entry) => draft.splitBetween.includes(entry.userId))
      .map((entry) => ({
        userId: entry.userId,
        ...(draft.splitMethod === "EXACT"
          ? { amount: Number(entry.amount) }
          : { percentage: Number(entry.percentage) })
      }));
  }

  if (draft.isMultiPayer) {
    payload.paidBy = (draft.paidByEntries || [])
      .filter((entry) => {
        const amt = Number(entry.amount);
        return Number.isFinite(amt) && amt > 0;
      })
      .map((entry) => ({
        userId: entry.userId,
        amount: Number(entry.amount)
      }));
  }

  return payload;
}
