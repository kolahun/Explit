class BinaryHeap {
  constructor(compare) {
    this.items = [];
    this.compare = compare;
  }

  size() {
    return this.items.length;
  }

  push(value) {
    this.items.push(value);
    this.bubbleUp(this.items.length - 1);
  }

  pop() {
    if (this.items.length === 0) return null;
    if (this.items.length === 1) return this.items.pop();

    const top = this.items[0];
    this.items[0] = this.items.pop();
    this.bubbleDown(0);
    return top;
  }

  bubbleUp(index) {
    while (index > 0) {
      const parent = Math.floor((index - 1) / 2);
      if (this.compare(this.items[parent], this.items[index]) <= 0) break;
      [this.items[parent], this.items[index]] = [this.items[index], this.items[parent]];
      index = parent;
    }
  }

  bubbleDown(index) {
    while (true) {
      const left = index * 2 + 1;
      const right = index * 2 + 2;
      let best = index;

      if (left < this.items.length && this.compare(this.items[best], this.items[left]) > 0) {
        best = left;
      }
      if (right < this.items.length && this.compare(this.items[best], this.items[right]) > 0) {
        best = right;
      }
      if (best === index) break;

      [this.items[index], this.items[best]] = [this.items[best], this.items[index]];
      index = best;
    }
  }
}

function roundMoney(value) {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

/**
 * Greedily matches the largest debtor with the largest creditor.
 * Positive balance means user should receive money; negative means user owes money.
 *
 * @param {Array<{userId: string, balance: number}>} balances
 * @returns {Array<{fromUser: string, toUser: string, amount: number}>}
 */
function simplifyDebts(balances) {
  const creditors = new BinaryHeap((a, b) => b.amount - a.amount);
  const debtors = new BinaryHeap((a, b) => b.amount - a.amount);

  balances.forEach(({ userId, balance }) => {
    const amount = roundMoney(Math.abs(balance));
    if (amount < 0.01) return;
    if (balance > 0) creditors.push({ userId, amount });
    if (balance < 0) debtors.push({ userId, amount });
  });

  const transactions = [];

  while (creditors.size() > 0 && debtors.size() > 0) {
    const creditor = creditors.pop();
    const debtor = debtors.pop();
    const amount = roundMoney(Math.min(creditor.amount, debtor.amount));

    transactions.push({
      fromUser: debtor.userId,
      toUser: creditor.userId,
      amount
    });

    const creditorRemainder = roundMoney(creditor.amount - amount);
    const debtorRemainder = roundMoney(debtor.amount - amount);

    if (creditorRemainder >= 0.01) creditors.push({ ...creditor, amount: creditorRemainder });
    if (debtorRemainder >= 0.01) debtors.push({ ...debtor, amount: debtorRemainder });
  }

  return transactions;
}

module.exports = { simplifyDebts, BinaryHeap };
