'use strict'

const validator = require('../event-validator')

require('chai').should()

const eventWithReservedWords = {
    entype: 'user',
    evname: 'sign_in',
    body: {
        tag: 'campaign',
        case: 123,
        name: 'Bilal'
    }
}

describe('validate event', () => {

  it('should return array of reserved words', () => {

    validator.reservedWords(eventWithReservedWords).should.deep.equal(['tag', 'case'])
  })

  it('should indicate event has reserved words', () => {

    validator.hasReservedWords(eventWithReservedWords).should.be.true
  })

})
