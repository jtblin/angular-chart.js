'use strict'

require('should')
var Dot = require('../index')

describe('_process:', function () {
  describe('Should process modifier', function () {
    describe('if value is a string', function () {
      function up (val) {
        return val.toUpperCase()
      }

      it('using a single modifier', function () {
        Dot._process('k', up).should.eql('K')
      })

      it('using an array of modifiers', function () {
        var v = 'k'
        Dot._process(v, [up]).should.eql('K')
      })
    })

    describe('if value is an object', function () {
      function withReturn (val) {
        val.withReturn = 'return'
        return val
      }

      function noReturn (val) {
        val.noReturn = 'no return'
      }

      it('using a single modifier *with* return', function () {
        var a = {
          test: 1
        }

        var expected = {
          test: 1,
          withReturn: 'return'
        }

        var ret = Dot._process(a, withReturn)
        a.should.eql(expected)
        ret.should.eql(expected)
      })

      it('using a single modifier *without* return', function () {
        var a = {
          test: 1
        }
        var expected = {
          test: 1,
          noReturn: 'no return'
        }
        var ret = Dot._process(a, noReturn)
        a.should.eql(expected)
        ret.should.eql(expected)
      })

      it('using an array of modifiers *with* return and *without* return',
        function () {
          var a = {
            test: 1
          }

          var expected = {
            test: 1,
            withReturn: 'return',
            noReturn: 'no return'
          }

          var ret = Dot._process(a, [withReturn, noReturn])

          a.should.eql(expected)
          ret.should.eql(expected)
        }
      )
    })

    describe('if value is an array', function () {
      function withReturn (val) {
        val.push('return')
        return val
      }

      function noReturn (val) {
        val.push('no return')
      }

      it('using a single modifier *with* return', function () {
        var a = [1]

        var expected = [1, 'return']

        var ret = Dot._process(a, withReturn)
        a.should.eql(expected)
        ret.should.eql(expected)
      })

      it('using a single modifier *without* return', function () {
        var a = [1]

        var expected = [1, 'no return']

        var ret = Dot._process(a, noReturn)
        a.should.eql(expected)
        ret.should.eql(expected)
      })

      it('using an array of modifiers *with* return and *without* return',
        function () {
          var a = [1]

          var expected = [1, 'return', 'no return']

          var ret = Dot._process(a, [withReturn, noReturn])

          a.should.eql(expected)
          ret.should.eql(expected)
        }
      )
    })
  })
})
