'use strict'

require('should')
var Dot = require('../index')

describe('Should be able to merge:', function () {
  it('to property', function () {
    var link = {
      other: {
        three: 'Three Things',
        four: 'Four Things'
      },
      things: {
        one: 'One Thing',
        two: 'Two Things'
      }
    }

    var expected = {
      things: {
        one: 'One Thing',
        two: 'Two Things',
        three: 'Three Things',
        four: 'Four Things'
      }
    }

    Dot.move('other', 'things', link, true)

    link.should.eql(expected)
  })

  it('to nested property', function () {
    var link = {
      other: {
        three: 'Three Things',
        four: 'Four Things'
      },
      things: {
        one: 'One Thing',
        two: 'Two Things',
        target: {
          im: 'already here'
        }
      }
    }

    var expected = {
      things: {
        one: 'One Thing',
        two: 'Two Things',
        target: {
          im: 'already here',
          three: 'Three Things',
          four: 'Four Things'
        }
      }
    }

    Dot.move('other', 'things.target', link, true)

    link.should.eql(expected)
  })

  it('array to array', function () {
    var link = {
      other: [
        'Three Things',
        'Four Things'
      ],
      things: {
        one: 'One Thing',
        two: 'Two Things',
        target: [
          'already here'
        ]
      }
    }

    var expected = {
      things: {
        one: 'One Thing',
        two: 'Two Things',
        target: [
          'already here',
          'Three Things',
          'Four Things'
        ]
      }
    }

    Dot.move('other', 'things.target', link, true)

    link.should.eql(expected)
  })
})
