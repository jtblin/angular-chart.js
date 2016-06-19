'use strict'

/* jshint -W030 */

require('should')
var Dot = require('../index')

describe('Pick:', function () {
  it('Should be able to pick a value', function () {
    var obj = {
      'some': 'value',
      'already': 'set'
    }

    var val = Dot.pick('some', obj)

    val.should.eql('value')
  })

  it('Should be able to pick dotted value', function () {
    var obj = {
      'some': {
        'other': 'value'
      }
    }

    var val = Dot.pick('some.other', obj)

    val.should.eql('value')
  })

  it('Should be able to pick null properties', function () {
    var obj = {
      'some': null
    }

    var val = Dot.pick('some', obj)

    ;(val === null).should.be.true
  })

  it('Should return undefined when picking an non-existing value', function () {
    var obj = {
      'some': null
    }

    var val = Dot.pick('other', obj)

    ;(val === undefined).should.be.true
  })

  it('Should return undefined when picking an non-existing dotted value',
    function () {
      var obj = {
        'some': null
      }

      var val = Dot.pick('some.other', obj)

      ;(val === undefined).should.be.true
    }
  )

  it("Should check down the object's prototype chain", function () {
    var obj = {
      'some': {
        'other': 'value'
      }
    }

    var objIns = Object.create(obj)

    objIns.should.have.property('some')

    var val = Dot.pick('some.other', objIns)
    val.should.be.a.String
  })
})
