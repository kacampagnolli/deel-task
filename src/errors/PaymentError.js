function PaymentError(message) {
  this.message = message;
}
PaymentError.prototype = new Error();

module.exports = PaymentError;
