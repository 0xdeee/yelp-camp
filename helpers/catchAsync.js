/*
 * This method takes a function as input and returns the same function with catch added to this.
 * This way we dont have to write catch() to catch API error or schema error for all routes separately
 */

module.exports = function (fn) {
  return function (req, res, next) {
    fn(req, res, next).catch((error) => next(error));
  };
};
