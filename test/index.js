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

  it('should show an error for missing account_id for entype=account', () => {

    const event = {
      entype: 'account',
      evname: '@set',
      body: {
        name: 'LiquidPlanner'
      }
    }

    validator(event).should.deep.equal([
      'you must specify account_id if entype is account otherwise you must specify the enid'
    ])
  })

  it('should pass validation if account_id is set for entype=account', () => {

    const event = {
      entype: 'account',
      evname: '@set',
      account_id: '12345',
      body: {
        name: 'LiquidPlanner'
      }
    }

    validator(event).should.be.empty
  })

  it('should show an error for missing user_id for entype=user', () => {

    const event = {
      entype: 'user',
      evname: 'login',
      body: {
        name: 'Bilal Aslam'
      }
    }

    validator(event).should.deep.equal([
      'you must specify user_id if entype is user otherwise you must specify the enid'
    ])
  })

  it('should pass validation if user_id is set for entype=user', () => {

    const event = {
      entype: 'user',
      evname: 'login',
      user_id: '12345',
      body: {
        name: 'Bilal Aslam'
      }
    }

    validator(event).should.be.empty
  })


})
