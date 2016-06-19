'use strict'

/* jshint -W030 */

require('should')
var Dot = require('../index')

describe('Dotted Array notation', function () {
  var src

  beforeEach(function () {
    src = {
      path: [{
        'longitude': 5.512482166290283,
        'latitude': 52.5006217956543
      }, {
        'longitude': 5.512370586395264,
        'latitude': 52.50059509277344
      }, {
        'longitude': 5.512370586395264,
        'latitude': 52.50059509277344
      }]
    }
  })

  function runVariant (type) {
    var v = function (v) {
      if (type === 'bracket') {
        // rewrite some.prop.1 to some.prop[1]
        return v.replace(/\.(-?\d+)/g, '[$1]')
      } else {
        return v
      }
    }

    describe('can pick', function () {
      it('index', function () {
        Dot.pick(v('path.0'), src).should.eql(src.path[0])
        Dot.pick(v('path.2'), src).should.eql(src.path[2])
        ;(typeof Dot.pick(v('path.9'), src)).should.eql('undefined')
      })

      it('negative index', function () {
        Dot.pick(v('path.-1'), src).should.eql(src.path[2])
        Dot.pick(v('path.-2'), src).should.eql(src.path[1])
        Dot.pick(v('path.-3'), src).should.eql(src.path[0])
        ;(typeof Dot.pick(v('path.-9'), src)).should.eql('undefined')
      })

      it('non-array `-` prefixed properties', function () {
        var src = {
          path: {
            '-1': 'test1',
            '-2': 'test2',
            '-3': 'test3',
            '----key': 'test4'
          }
        }
        Dot.pick(v('path.-1'), src).should.eql('test1')
        Dot.pick(v('path.-2'), src).should.eql('test2')
        Dot.pick(v('path.-3'), src).should.eql('test3')
        Dot.pick(v('path.----key'), src).should.eql('test4')
        ;(typeof Dot.pick(v('path.-9'), src)).should.eql('undefined')
      })

      it('multiple indexes', function () {
        var src = {
          I: [
            {am: [{nes: ['ted']}]},
            {me: 'too'}
          ]
        }

        Dot.pick(v('I.0'), src).should.eql(src.I[0])
        Dot.pick(v('I.0.am'), src).should.eql(src.I[0].am)
        Dot.pick(v('I.0.am.0'), src).should.eql(src.I[0].am[0])
        Dot.pick(v('I.0.am.0.nes'), src).should.eql(src.I[0].am[0].nes)
        Dot.pick(v('I.0.am.0.nes.0'), src).should.eql('ted')
        Dot.pick(v('I.1.me'), src).should.eql('too')
      })
    })

    describe('can set', function () {
      it('index at target', function () {
        var obj = {path: []}

        Dot.set(v('path.0'), 'test', obj)
        Dot.set(v('path.1'), 'test2', obj)

        obj.path.should.be.an.Array
        obj.should.eql({path: ['test', 'test2']})
      })

      it('index and set undefined for empty indices', function () {
        var obj = {path: []}

        Dot.set(v('path.0'), 'test', obj)
        Dot.set(v('path.2'), 'test2', obj)

        obj.path.should.be.an.Array

        // array will have an undefined index.
        JSON.stringify(obj)
          .should.eql(
          JSON.stringify({path: ['test', undefined, 'test2']})
        )

        // to json will converted it to null
        JSON.stringify(obj).should.eql('{"path":["test",null,"test2"]}')
      })

      it('index and overwrite existing values', function () {
        var obj = {path: ['still', 'shall', 'be', 'gone', 'here']}

        Dot.set(v('path.1'), 'x', obj)
        Dot.set(v('path.2'), 'xx', obj)
        Dot.set(v('path.3'), 'xxx', obj)

        obj.should.eql({path: ['still', 'x', 'xx', 'xxx', 'here']})
      })
    })

    describe('can remove', function () {
      it('indexes one by one leaving traces', function () {
        var obj = {path: ['still', 'shall', 'really', 'be', 'gone', 'here']}

        Dot.remove(v('path.1'), obj)
        Dot.remove(v('path.2'), obj)
        Dot.del(v('path.3'), obj) // use alias
        Dot.del(v('path.4'), obj)

        // array will have an undefined index.
        JSON.stringify(obj)
          .should.eql(
          JSON.stringify({
            path: [
              'still', undefined, undefined, undefined, undefined, 'here'
            ]
          })
        )

        // to json will converted it to null
        JSON.stringify(obj).should.eql(
          '{"path":["still",null,null,null,null,"here"]}'
        )
      })

      it('array of indexes leaving no traces', function () {
        var obj = {path: ['still', 'shall', 'really', 'be', 'gone', 'here']}

        Dot.remove([
          v('path.1'),
          v('path.2'),
          v('path.3'),
          v('path.4')], obj)

        JSON.stringify(obj).should.eql('{"path":["still","here"]}')
      })
    })
  }

  describe('with dot notation', function () {
    runVariant()
  })

  // extra logic no real benefit.
  describe('with bracket notation', function () {
    runVariant('bracket')
  })
})
