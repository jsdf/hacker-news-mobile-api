var StandardError = require('standard-error')

class NotFoundError extends StandardError {}

module.exports = NotFoundError