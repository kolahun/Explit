const PAISE_PER_RUPEE = 100;

function parseMoneyToPaise(value) {
  const numericValue = typeof value === "string" ? Number(value.trim()) : Number(value);
  if (!Number.isFinite(numericValue) || numericValue <= 0) {
    throw new Error("Amount must be a valid number greater than zero");
  }

  return Math.round(numericValue * PAISE_PER_RUPEE);
}

function paiseToAmount(paise) {
  return Number((Number(paise) / PAISE_PER_RUPEE).toFixed(2));
}

module.exports = { parseMoneyToPaise, paiseToAmount, PAISE_PER_RUPEE };
