const { simplifyDebts } = require("../utils/debtSimplifier");

describe("simplifyDebts", () => {
  test("settles a simple one debtor one creditor case", () => {
    const result = simplifyDebts([
      { userId: "alice", balance: 50 },
      { userId: "bob", balance: -50 }
    ]);

    expect(result).toEqual([{ fromUser: "bob", toUser: "alice", amount: 50 }]);
  });

  test("settles multiple users with minimum greedy transactions", () => {
    const result = simplifyDebts([
      { userId: "a", balance: 70 },
      { userId: "b", balance: 30 },
      { userId: "c", balance: -40 },
      { userId: "d", balance: -60 }
    ]);

    expect(result).toHaveLength(3);
    expect(result.reduce((sum, tx) => sum + tx.amount, 0)).toBe(100);
    expect(result).toEqual([
      { fromUser: "d", toUser: "a", amount: 60 },
      { fromUser: "c", toUser: "b", amount: 30 },
      { fromUser: "c", toUser: "a", amount: 10 }
    ]);
  });

  test("ignores zero and sub-cent balances", () => {
    expect(
      simplifyDebts([
        { userId: "a", balance: 0 },
        { userId: "b", balance: 0.004 },
        { userId: "c", balance: -0.004 }
      ])
    ).toEqual([]);
  });

  test("handles decimal money values", () => {
    const result = simplifyDebts([
      { userId: "a", balance: 33.33 },
      { userId: "b", balance: 16.67 },
      { userId: "c", balance: -50 }
    ]);

    expect(result).toEqual([
      { fromUser: "c", toUser: "a", amount: 33.33 },
      { fromUser: "c", toUser: "b", amount: 16.67 }
    ]);
  });
});
