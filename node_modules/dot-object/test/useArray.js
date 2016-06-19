'use strict'

require('should')
var Dot = require('../index')

describe('useArray:', function () {
  var dotObject, arrayObject, object
  var arrayObjectExpected, objectExpected, dotObjectExpected

  beforeEach(function () {
    dotObject = {
      'a.0': 'value'
    }
    dotObjectExpected = {
      'a.0': 'value'
    }
    arrayObject = {
      a: ['value']
    }
    arrayObjectExpected = {
      a: ['value']
    }
    object = {
      a: {
        '0': 'value'
      }
    }
    objectExpected = {
      a: {
        '0': 'value'
      }
    }
  })

  it('default is using array ', function () {
    var dotLocal = require('../index')
    arrayObjectExpected.should.eql(dotLocal.object(dotObject))
  })
  it('Should convert dot using arrays ', function () {
    Dot.useArray = true
    arrayObjectExpected.should.eql(Dot.object(dotObject))
  })
  it('Should convert dot not using arrays ', function () {
    Dot.useArray = false
    objectExpected.should.eql(Dot.object(dotObject))
  })
  it('Should convert object using arrays ', function () {
    Dot.useArray = true
    arrayObjectExpected.should.eql(Dot.object(dotObject))
  })
  it('Should convert dot using arrays and convert back equals source', function () {
    Dot.useArray = true
    dotObjectExpected.should.eql(Dot.dot(Dot.object(dotObject)))
  })
  it('Should convert object using arrays and convert back equals source', function () {
    Dot.useArray = true
    arrayObjectExpected.should.eql(Dot.object(Dot.dot(object)))
  })
  it('Should convert dot not using arrays and convert back equals source', function () {
    Dot.useArray = false
    dotObjectExpected.should.eql(Dot.dot(Dot.object(dotObject)))
  })
  it('Should convert object not using arrays and convert back equals source', function () {
    Dot.useArray = false
    objectExpected.should.eql(Dot.object(Dot.dot(arrayObject)))
  })
})
