const joi = require('joi'),
      validSqlRegex = /^[a-z0-9_]+$/

function validateEvent(event) {
  const eventResult = joi.validate(event, {
    user_id: joi.string().min(1).max(40).required(),
    entype: joi.string().min(1).max(20).required(),
    evname: joi.string().min(1).max(40).regex(validSqlRegex).required(),
    ts: joi.string().isoDate(),
    body: joi.object().pattern(validSqlRegex, joi.any())
  }, { abortEarly: false, convert: false })

  if (!eventResult.error) {
    const bodyResult = joi.validate(JSON.stringify(event.body), joi.string().min(1).max(32768))

    if (bodyResult.error) {
      eventResult.error = bodyResult.error
    }
  }

  return eventResult
}

module.exports = validateEvent
module.exports.isValid = e => !validateEvent(e).error