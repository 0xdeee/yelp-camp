/**
 * custom error class extending Error class to add message & statusCode params to error obj
 */
class ExpressError extends Error {
  constructor(message, statusCode) {
    super();
    this.message = message;
    this.statusCode = statusCode;
  }
}

module.exports = ExpressError;
