class ExpressError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.message = message;
    this.statusCode = statusCode; // ✅ FIXED
  }
}

module.exports = ExpressError;
