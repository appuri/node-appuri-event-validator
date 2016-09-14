const crypto = require('crypto'),
      moment = require('moment'),
      validSqlRegex = /^[a-z0-9_]+$/,
      entypeRegex = /^[a-z0-9_]{1,20}$/,
      evnameRegex = /^(@set|[a-z0-9_]{1,40})$/,
      reservedWords = new Set(require('./reserved-words'))

function validateEvent(opts, event) {
  var errors = []

  const entities = ['user', 'account']

  if (!event || typeof event !== 'object' || typeof event.entype !== 'string' || typeof event.evname !== 'string') {
    return ['Event must be an object with the entype and evname specified']
  }

  entities.forEach(e => {

    if (event.entype === e && (event.enid == null && event[`${e}_id`] == null) ) {
      errors.push(`you must specify ${e}_id if entype is ${e} otherwise you must specify the enid`)
    }
  })

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
  if (event.ts != null && !moment(event.ts, moment.ISO_8601, true).isValid()) {
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
module.exports.normalizeId = (id, toLower) => {
  var result
  if (id) {
    result = String(id)
    if (toLower !== false) {
      result = result.toLowerCase()
    }
    if(result.length > 40) {
      const md5Sum = crypto.createHash('md5')
      md5Sum.update(result)
      result = md5Sum.digest('hex')
    }
  }

  return result
}

// returns an array of body keys that are reserved SQL words
// not needed since we now quote column names in Redshift
module.exports.reservedWords = e => Object.keys(e.body).filter(k => reservedWords.has(k.toUpperCase()))

module.exports.hasReservedWords = e => module.exports.reservedWords(e).length > 0
