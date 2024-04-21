function DepositAmountError(amount, maxAmount) {
  this.message = "Deposit amount exceeds the maximum allowed amount";
  this.amount = amount;
  this.maxAmount = maxAmount;
}
DepositAmountError.prototype = new Error();

module.exports = DepositAmountError;
