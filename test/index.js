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

describe('validate event', () => {

  it('should return array of reserved words', () => {
    validator.reservedWords(eventWithReservedWords).should.deep.equal(['tag', 'case'])
  })

  it('should indicate event has reserved words', () => {
    validator.hasReservedWords(eventWithReservedWords).should.be.true
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
