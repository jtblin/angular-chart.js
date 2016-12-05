(function (test) {
  if (typeof require === "function"&& typeof exports === "object"&& typeof module === "object") {
    // NodeJS
    (function () {
      var chai = require('chai');
      chai.config.includeStack = true;
      test(chai, true);
    }());
  }
  else {
    // Other environment (usually <script> tag): plug in to global chai instance directly.
    test(chai, false);
  }
}(function (chai, testingServer) {

  var should = chai.should();
  var assert = chai.assert;
  var expect = chai.expect;

  if (testingServer) {
    var chai_string = require('../chai-string');
    chai.use(chai_string);
  }

  chai.use(function (chai, utils) {

    var inspect = utils.objDisplay;

    chai.Assertion.addMethod('fail', function (message) {

      var obj = this._obj;
      new chai.Assertion(obj).is.a('function');

      try {
        obj();
      }
      catch (err) {
        this.assert(
          err instanceof chai.AssertionError,
          'expected #{this} to fail, but it threw ' + inspect(err)
        );
        this.assert(
          err.message === message,
          'expected #{this} to fail with ' + inspect(message) + ', but got ' + inspect(err.message)
        );
        return;
      }

      this.assert(false, 'expected #{this} to fail');
    });
  });

  describe('chai-string', function () {

    describe('#startsWith', function () {

      it('should return true', function () {
        var str = 'abcdef',
          prefix = 'abc';
        chai.string.startsWith(str, prefix).should.be.true;
      });

      it('should return false', function () {
        var str = 'abcdef',
          prefix = 'cba';
        chai.string.startsWith(str, prefix).should.be.false;
      });

      it('should return false (2)', function () {
        var str = '12abcdef',
          prefix = 12.0;
        chai.string.startsWith(str, prefix).should.be.false;
      });

      it('check that', function () {
        var obj = { foo: 'hello world' };
        expect(obj).to.have.property('foo').that.startsWith('hello');
      });

    });

    describe('#startWith', function () {

      it('should return true', function () {
        var str = 'abcdef',
          prefix = 'abc';
        str.should.startWith(prefix);
      });

      it('should return false', function () {
        var str = 'abcdef',
          prefix = 'cba';
        str.should.not.startWith(prefix);
      });

      it('should return false (2)', function () {
        var str = '12abcdef',
          prefix = 12.0;
        str.should.not.startWith(prefix);
        chai.string.startsWith(str, prefix).should.be.false;
      });

    });

    describe('#endsWith', function () {

      it('should return true', function () {
        var str = 'abcdef',
          suffix = 'def';
        chai.string.endsWith(str, suffix).should.be.true;
      });

      it('should return false', function () {
        var str = 'abcdef',
          suffix = 'fed';
        chai.string.endsWith(str, suffix).should.be.false;
      });

      it('should return false (2)', function () {
        var str = 'abcdef12',
          suffix = 12.0;
        chai.string.endsWith(str, suffix).should.be.false;
      });

    });

    describe('#endWith', function () {

      it('should return true', function () {
        var str = 'abcdef',
          suffix = 'def';
        str.should.endWith(suffix);
      });

      it('should return false', function () {
        var str = 'abcdef',
          suffix = 'fed';
        str.should.not.endWith(suffix);
      });

      it('should return false (2)', function () {
        var str = 'abcdef12',
          suffix = 12.0;
        str.should.not.endsWith(suffix);
      });

    });

    describe('#equalIgnoreCase', function () {

      it('should return true', function () {
        var str1 = 'abcdef',
          str2 = 'AbCdEf';
        chai.string.equalIgnoreCase(str1, str2).should.be.true;
      });

      it('should return false', function () {
        var str1 = 'abcdef',
          str2 = 'aBDDD';
        chai.string.equalIgnoreCase(str1, str2).should.be.false;
      });

      it('should return false (2)', function () {
        var str1 = 12,
          str2 = '12';
        chai.string.equalIgnoreCase(str1, str2).should.be.false;
      });

      it('should return false (3)', function () {
        var str1 = '12',
          str2 = 12;
        chai.string.equalIgnoreCase(str1, str2).should.be.false;
      });

    });

    describe('#equalIgnoreSpaces', function () {

      it('should return true', function () {
        var str1 = 'abcdef',
          str2 = 'a\nb\tc\r d  ef';
        chai.string.equalIgnoreSpaces(str1, str2).should.be.true;
      });

      it('should return false', function () {
        var str1 = 'abcdef',
          str2 = 'a\nb\tc\r d  efg';
        chai.string.equalIgnoreSpaces(str1, str2).should.be.false;
      });

      it('should return false (2)', function () {
        chai.string.equalIgnoreSpaces('12', 12).should.be.false;
      });

      it('should return false (3)', function () {
        chai.string.equalIgnoreSpaces(12, '12').should.be.false;
      });

    });

    describe('#containIgnoreSpaces', function () {

      it('should return true', function () {
        var str1 = '1234abcdef56',
          str2 = '1234a\nb\tc\r d  ef56';
        chai.string.containIgnoreSpaces(str1, str2).should.be.true;
      });

      it('should return true (2)', function () {
        var str1 = 'abcdef',
          str2 = 'a\nb\tc\r d  ef';
        chai.string.containIgnoreSpaces(str1, str2).should.be.true;
      });

      it('should return false', function () {
        var str1 = 'abdef',
          str2 = 'a\nb\tc\r d  ef';
        chai.string.containIgnoreSpaces(str1, str2).should.be.false;
      });

      it('should return false (2)', function () {
        chai.string.containIgnoreSpaces('12', 12).should.be.false;
      });

      it('should return false (3)', function () {
        chai.string.containIgnoreSpaces(12, '12').should.be.false;
      });
    });

    describe('#singleLine', function() {

      it('should return true', function() {
        var str = 'abcdef';
        chai.string.singleLine(str).should.be.true;
      });

      it('should return false', function() {
        var str = "abc\ndef";
        chai.string.singleLine(str).should.be.false;
      });

      it('should return false (2)', function() {
        chai.string.singleLine(12).should.be.false;
      });

    });

    describe('#reverseOf', function() {

      it('should return true', function () {
        var str1 = 'abcdef',
          str2 = 'fedcba';
        chai.string.reverseOf(str1, str2).should.be.true;
      });

      it('should return false', function () {
        var str1 = 'abcdef',
          str2 = 'aBDDD';
        chai.string.reverseOf(str1, str2).should.be.false;
      });

      it('should return false (2)', function () {
        chai.string.reverseOf('12', 12).should.be.false;
      });

      it('should return false (3)', function () {
        chai.string.reverseOf(12, '12').should.be.false;
      });

    });

    describe('#palindrome', function() {

      it('should return true', function() {
        var str = 'abcba';
        chai.string.palindrome(str).should.be.true;
      });

      it('should return true (2)', function() {
        var str = 'abccba';
        chai.string.palindrome(str).should.be.true;
      });

      it('should return true (3)', function() {
        var str = '';
        chai.string.palindrome(str).should.be.true;
      });

      it('should return false', function() {
        var str = 'abcdef';
        chai.string.palindrome(str).should.be.false;
      });

      it('should return false (2)', function() {
        chai.string.palindrome(12).should.be.false;
      });

    });

    describe('#entriesCount', function() {

      it('should return true', function() {
        var str = 'abcabd',
          substr = 'ab',
          count = 2;
        chai.string.entriesCount(str, substr, count).should.be.true;
      });

      it('should return true (2)', function() {
        var str = 'ababd',
          substr = 'ab',
          count = 2;
        chai.string.entriesCount(str, substr, count).should.be.true;
      });

      it('should return true (3)', function() {
        var str = 'abab',
          substr = 'ab',
          count = 2;
        chai.string.entriesCount(str, substr, count).should.be.true;
      });

      it('should return true (4)', function() {
        var str = 12,
          substr = 'ab',
          count = 0;
        chai.string.entriesCount(str, substr, count).should.be.true;
      });

      it('should return true (5)', function() {
        var str = '12',
          substr = 12,
          count = 0;
        chai.string.entriesCount(str, substr, count).should.be.true;
      });

      it('should return false ', function() {
        var str = '12',
          substr = 12,
          count = 1;
        chai.string.entriesCount(str, substr, count).should.be.false;
      });

    });

    describe('#indexOf', function() {

      it('should return true', function() {
        var str = 'abcabd',
            substr = 'ab',
            index = 0;
        chai.string.indexOf(str, substr, index).should.be.true;
      });

      it('should return true (2)', function() {
        var str = 'abcabd',
            substr = 'ca',
            index = 2;
        chai.string.indexOf(str, substr, index).should.be.true;
      });

      it('should return true (3)', function() {
        var str = 'ababab',
            substr = 'ba',
            index = 1;
        chai.string.indexOf(str, substr, index).should.be.true;
      });

      it('should return true (4)', function() {
        var str = '12',
          substr = 12,
          index = -1;
        chai.string.indexOf(str, substr, index).should.be.true;
      });

      it('should return true (5)', function() {
        var str = 12,
          substr = '12',
          index = -1;
        chai.string.indexOf(str, substr, index).should.be.true;
      });

      it('should return false', function() {
        var str = 'abcaab',
            substr = 'da',
            index = 1;
        chai.string.indexOf(str, substr, index).should.be.false;
      });

      it('should return false (2)', function() {
        var str = '12',
          substr = 12,
          index = 0;
        chai.string.indexOf(str, substr, index).should.be.false;
      });

      it('should return false (3)', function() {
        var str = 12,
          substr = '12',
          index = 0;
        chai.string.indexOf(str, substr, index).should.be.false;
      });

    });


    describe('tdd alias', function () {

      beforeEach(function () {
        this.str = 'abcdef';
        this.str2 = 'a\nb\tc\r d  ef';
      });

      it('.startsWith', function () {
        assert.startsWith(this.str, 'abc');
      });

      it('.notStartsWith', function () {
        assert.notStartsWith(this.str, 'cba');
      });

      it('.notStartsWith (2)', function () {
        assert.notStartsWith('12abc', 12.0);
      });

      it('.endsWith', function () {
        assert.endsWith(this.str, 'def');
      });

      it('.notEndsWith', function () {
        assert.notEndsWith(this.str, 'fed');
      });

      it('.notEndsWith (2)', function () {
        assert.notEndsWith('abc12', 12.0);
      });

      it('.equalIgnoreCase', function () {
        assert.equalIgnoreCase(this.str, 'AbCdEf');
      });

      it('.notEqualIgnoreCase', function () {
        assert.notEqualIgnoreCase(this.str, 'abDDD');
      });

      it('.notEqualIgnoreCase (2)', function () {
        assert.notEqualIgnoreCase('12', 12);
      });

      it('.notEqualIgnoreCase (3)', function () {
        assert.notEqualIgnoreCase(12, '12');
      });

      it('.equalIgnoreSpaces', function () {
        assert.equalIgnoreSpaces(this.str, this.str2);
      });

      it('.notEqualIgnoreSpaces', function () {
        assert.notEqualIgnoreSpaces(this.str, this.str2 + 'g');
      });

      it('.notEqualIgnoreSpaces (2)', function () {
        assert.notEqualIgnoreSpaces('12', 12);
      });

      it('.notEqualIgnoreSpaces (3)', function () {
        assert.notEqualIgnoreSpaces(12, '12');
      });

      it('.containIgnoreSpaces', function () {
        assert.containIgnoreSpaces(this.str, this.str2);
      });

      it('.notContainIgnoreSpaces', function () {
        assert.notContainIgnoreSpaces(this.str, this.str2 + 'g');
      });

      it('.singleLine', function() {
        assert.singleLine(this.str);
      });

      it('.notSingleLine', function() {
        assert.notSingleLine("abc\ndef");
      });

      it('.notSingleLine (2)', function() {
        assert.notSingleLine(12);
      });

      it('.reverseOf', function() {
        assert.reverseOf(this.str, 'fedcba');
      });

      it('.notReverseOf', function() {
        assert.notReverseOf(this.str, 'aaaaa');
      });

      it('.notReverseOf (2)', function() {
        assert.notReverseOf('12', 12);
      });

      it('.notReverseOf (3)', function() {
        assert.notReverseOf(12, '12');
      });

      it('.palindrome', function() {
        assert.palindrome('abcba');
        assert.palindrome('abccba');
        assert.palindrome('');
      });

      it('.notPalindrome', function() {
        assert.notPalindrome(this.str);
      });

      it('.notPalindrome (2)', function() {
        assert.notPalindrome(12);
      });

      it('.entriesCount', function() {
        assert.entriesCount('abcabd', 'ab', 2);
        assert.entriesCount('ababd', 'ab', 2);
        assert.entriesCount('abab', 'ab', 2);
        assert.entriesCount('', 'ab', 0);
        assert.entriesCount(12, 'ab', 0);
        assert.entriesCount('12', 12, 0);
      });

      it('.indexOf', function() {
        assert.indexOf('abcabd', 'ab', 0);
        assert.indexOf('abcabd', 'ca', 2);
        assert.indexOf('ababab', 'ba', 1);
        assert.indexOf('ababab', 'ba', 1);
        assert.indexOf(12, '12', -1);
        assert.indexOf('12', 12, -1);
        expect('ababab').to.have.indexOf('ba', 1);
      });

    });
  });
}));
