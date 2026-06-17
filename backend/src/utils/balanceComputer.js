const Expense = require("../models/Expense");
const Settlement = require("../models/Settlement");
const { parseMoneyToPaise, paiseToAmount } = require("./money");

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

/**
 * Compute balances for all members of a group.
 *
 * For each expense:
 *   - If paidBy array exists and has entries, credit each payer by their contribution
 *   - Otherwise, credit the single payer by the full amount
 *   - Debit each member by their split share
 *
 * For each settled settlement:
 *   - Credit the fromUser (they paid their debt)
 *   - Debit the toUser (they received payment)
 *
 * @param {ObjectId} groupId
 * @param {Array<ObjectId>} memberIds
 * @returns {Promise<Array<{userId: string, balance: number}>>}
 */
async function computeBalances(groupId, memberIds) {
  const balancePaiseByUser = new Map(memberIds.map((id) => [id.toString(), 0]));
  const expenses = await Expense.find({ groupId });
  const settledPayments = await Settlement.find({ groupId, status: "settled" });

  expenses.forEach((expense) => {
    const expenseAmountPaise = expense.amountInPaise || parseMoneyToPaise(expense.amount);

    // Credit payers
    if (Array.isArray(expense.paidBy) && expense.paidBy.length > 0) {
      // Multi-payer: credit each payer by their actual contribution
      expense.paidBy.forEach((entry) => {
        addBalance(balancePaiseByUser, entry.user.toString(), entry.amountInPaise);
      });
    } else {
      // Single payer: credit the full amount
      addBalance(balancePaiseByUser, expense.payer.toString(), expenseAmountPaise);
    }

    // Debit each member by their split share
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

module.exports = { computeBalances };
