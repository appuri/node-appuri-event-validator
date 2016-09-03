const crypto = require('crypto'),
      moment = require('moment'),
      validSqlRegex = /^[a-z0-9_]+$/,
      entypeRegex = /^[a-z0-9_]{1,20}$/,
      evnameRegex = /^(@set|[a-z0-9_]{1,40})$/,
      reservedWords = new Set(require('./reserved-words'))

function validateEvent(opts, event) {
  var errors = []

  if (event[event.entype === 'user' || !event.entype ? 'user_id' : 'enid'] == null) {
    errors.push('you must specify user_id if entype is `user`, otherwise you must specify the `enid`')
  }
  if (event.user_id != null && (typeof event.user_id !== 'string' || event.user_id.length > 40 || !event.user_id.length)) {
    errors.push('user_id must be a string less than 40 characters long')
  }
  if (event.enid != null && (typeof event.enid !== 'string' || event.enid.length > 40 || !event.enid.length)) {
    errors.push('enid must be a string less than 40 characters long')
  }
  if (!entypeRegex.test(event.entype)) {
    errors.push('entype does not match ' + entypeRegex.toString())
  }
  if (!evnameRegex.test(event.evname)) {
    errors.push('evname does not match ' + evnameRegex.toString())
  }
  if (event.ts != null) {
    const ts = moment(event.ts, moment.ISO_8601, true),
          theDayAfterTomorrow = moment().add(2, 'days').add(-1, 'hour')

    if(!ts.isValid()) {
      errors.push('ts is not a valid ISO timestamp')
    }
  }
  if (event.body != null) {
    if (typeof event.body !== 'object') {
      errors.push('body must be an object')
    } else {
      for (var k in event.body) {
        if (!validSqlRegex.test(k)) {
          errors.push(`Body key ${k} does not match ${validSqlRegex.toString()}`)
        }
        if (reservedWords.has(k.toUpperCase())) {
          if (opts.transformReservedWordKeys) {
            event.body[k + '_'] = event.body[k]
            delete event.body[k]
          } else {
            errors.push(`Body key ${k} is a reserved SQL keyword`)
          }
        }
      }
    }
  }

  return errors
}

module.exports = validateEvent.bind(null, {})

// Convience method if you just need a yes or no answer
module.exports.isValid = e => !validateEvent({}, e).length

// Create a validator with transformation options
module.exports.withOptions = opts => validateEvent.bind(null, opts)

// Validate the events overall length. This is a separate method as it is expensive,
// and often can be avoided when parsing and building the event from a CSV by pre-checking the line length
module.exports.hasValidLength = e => !e.body || Buffer.byteLength(JSON.stringify(e.body), 'utf8') <= 32768

// ensure key will have valid sql name
module.exports.normalizeKey = key => key.replace(/^\$/, '').replace(/[^a-z0-9_]/ig, '_').toLowerCase()

// ensure id will fit in 40 characters
module.exports.normalizeId = id => {
  var result
  if(id) {
    result = id
    if(result.length > 40) {
      const md5Sum = crypto.createHash('md5')
      md5Sum.update(result)
      result = md5Sum.digest('hex')
    }
  }

  return result
}
