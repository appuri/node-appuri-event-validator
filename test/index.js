'use strict'

require('chai').should()

const validator = require('../event-validator')
const eventWithReservedWords = {
  entype: 'user',
  evname: 'sign_in',
  body: {
    tag: 'campaign',
    case: 123,
    name: 'Bilal'
  }
}
const basicValidationFailure = ['Event must be an object with the entype and evname specified']

describe('validate event', () => {

  it('should return array of reserved words', () => {
    validator.reservedWords(eventWithReservedWords).should.deep.equal(['tag', 'case'])
  })

  it('should indicate event has reserved words', () => {
    validator.hasReservedWords(eventWithReservedWords).should.be.true
  })

  it('should fail for non-objects', function() {
    validator().should.deep.equal(basicValidationFailure)
    validator('hi').should.deep.equal(basicValidationFailure)
  })

  it('should fail if entype or evname is not specified as a string', function() {
    validator({}).should.deep.equal(basicValidationFailure)
    validator({ evname: 'login' }).should.deep.equal(basicValidationFailure)
    validator({ evname: 'login', entype: 3 }).should.deep.equal(basicValidationFailure)
  })

  it('should fail if the entype is too long, short, or has invalid characters', function() {
    validator({ evname: 'login', entype: '' }).should.deep.equal(['entype does not match /^[a-z0-9_]{1,20}$/'])
    validator({ evname: 'login', entype: '사용자' }).should.deep.equal(['entype does not match /^[a-z0-9_]{1,20}$/'])
    validator({ evname: 'login', entype: new Array(41).fill('a').join('') }).should.deep.equal(['entype does not match /^[a-z0-9_]{1,20}$/'])
  })

  it('should fail validation for missing account_id for entype=account', () => {
    validator({
      entype: 'account',
      evname: '@set',
      body: {
        name: 'LiquidPlanner'
      }
    }).should.deep.equal([
      'you must specify account_id if entype is account otherwise you must specify the enid'
    ])
  })

  it('should pass validation if account_id is set for entype=account', () => {
    validator({
      entype: 'account',
      evname: '@set',
      account_id: '12345',
      body: {
        name: 'LiquidPlanner'
      }
    }).should.be.empty
  })

  it('should pass validation if enid is set for entype=account', () => {
    validator({
      entype: 'account',
      evname: '@set',
      enid: '12345',
      body: {
        name: 'LiquidPlanner'
      }
    }).should.be.empty
  })

  it('should show an error for missing user_id for entype=user', () => {
    validator({
      entype: 'user',
      evname: 'login',
      body: {
        name: 'Bilal Aslam'
      }
    }).should.deep.equal([
      'you must specify user_id if entype is user otherwise you must specify the enid'
    ])
  })

  it('should pass validation if user_id is set for entype=user', () => {
    validator({
      entype: 'user',
      evname: 'login',
      user_id: '12345',
      body: {
        name: 'Bilal Aslam'
      }
    }).should.be.empty
  })

  it('should pass validation if enid is set for entype=user', () => {
    validator({
      entype: 'user',
      evname: 'login',
      enid: '12345',
      body: {
        name: 'Bilal Aslam'
      }
    }).should.be.empty
  })

  it('should fail if the enid or user_id is too long', () => {
    validator({
      entype: 'user',
      evname: 'ate_chips',
      user_id: 'bigdudeonthecouchwithatenpouldbagofdoritosthatshouldbedoingyogaorbarorcrossfit'
    }).should.deep.equal([
      'user_id must be a string less than 40 characters long'
    ])
  })

  it('should fail if timestamp is not valid', () => {
    validator({
      entype: 'user',
      evname: 'ate_chips',
      user_id: 'user-1',
      ts: 'some date'
    }).should.deep.equal([
      'ts is not a valid ISO timestamp'
    ])

    validator({
      entype: 'user',
      evname: 'ate_chips',
      user_id: 'user-1',
      ts: '05/13/2016'
    }).should.deep.equal([
      'ts is not a valid ISO timestamp'
    ])

    validator({
      entype: 'user',
      evname: 'ate_chips',
      user_id: 'user-1',
      ts: '13-05-2016 13:20:42'
    }).should.deep.equal([
      'ts is not a valid ISO timestamp'
    ])
  })

  it('should pass if the timestamp is valid ISO 8601 timestamp', function() {
    validator({
      entype: 'user',
      evname: 'login',
      user_id: 'user-1',
      ts: '2016-09-13T05:41:35.640Z'
    }).should.be.empty

    validator({
      entype: 'user',
      evname: 'login',
      user_id: 'user-1',
      ts: '2007-04-05T12:30-02:00'
    }).should.be.empty

    validator({
      entype: 'user',
      evname: 'login',
      user_id: 'user-1',
      ts: '2016-09-13'
    }).should.be.empty
  })
})

describe('normalizeId', function() {
  it('should leave lowercase ids as is', function() {
    validator.normalizeId('foobar안녕!').should.equal('foobar안녕!')
  })

  it('should lowercase by default', function() {
    validator.normalizeId('CUTE멍멍이_123').should.equal('cute멍멍이_123')
  })

  it('should not lowercase if requested', function() {
    validator.normalizeId('CUTE멍멍이_123', false).should.equal('CUTE멍멍이_123')
  })

  it('should lowercase then hash long ids', function() {
    validator.normalizeId('someREALLYlongemail@somereallycooldomainohyeah.org').should.equal('9f093e950b00655a8060ad9c99c982f8')
  })

  it('should hash long ids without lowercasing them if requested', function() {
    validator.normalizeId('someREALLYlongemail@somereallycooldomainohyeah.org', false).should.equal('d64dec624070f7fe198426a62ad818fe')
  })
})
