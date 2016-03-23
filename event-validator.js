const validSqlRegex = /^[a-z0-9_]+$/,
      entypeRegex = /^[a-z0-9_]{1,20}$/,
      evnameRegex = /^(@set|[a-z0-9_]{1,40})$/,
      isoRegex = /(\d{4})-(\d{2})-(\d{2})T((\d{2}):(\d{2}):(\d{2}))\.(\d{3})Z/

function validateEvent(event) {
  var errors = []

  if (event[event.entype === 'user' ? 'user_id' : 'enid'] == null) {
    errors.push('you must specify user_id if entype is `user`, otherwise you must specify the `enid`')
  }
  if (event.user_id != null && (typeof event.user_id !== 'string' || event.user_id.length > 40 || !event.user_id.length)) {
    errors.push('user_id must be a string less than 40 characters long')
  }
  if (!entypeRegex.test(event.entype)) {
    errors.push('entype does not match ' + entypeRegex.toString())
  }
  if (!evnameRegex.test(event.evname)) {
    errors.push('evname does not match ' + evnameRegex.toString())
  }
  if (event.ts != null && !isoRegex.test(event.ts)) {
    errors.push('ts is not a valid ISO timestamp')
  }
  if (event.body != null) {
    if (typeof event.body !== 'object') {
      errors.push('body must be an object')
    } else {
      for (var k in event.body) {
        if (!validSqlRegex.test(k)) {
          errors.push(`Body key ${k} does not match ${validSqlRegex.toString()}`)
        }
      }
    }
  }

  return errors
}

module.exports = validateEvent
module.exports.isValid = e => !validateEvent(e).length
module.exports.hasValidLength = e => !e.body || JSON.stringify(e.body).length < 32768