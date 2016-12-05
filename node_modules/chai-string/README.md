# chai-string

Matchers for chai to help with common string comparison assertions.

[![Build Status](https://travis-ci.org/onechiporenko/chai-string.png?branch=master)](https://travis-ci.org/onechiporenko/chai-string)
[![Downloads](http://img.shields.io/npm/dm/chai-string.svg)](http://img.shields.io/npm/dm/chai-string.svg)

## Usage

### Browser

```html
<script src="chai.js"></script>
<script src="chai-string.js"></script>
```

### Server

```javascript
var chai = require('chai');
chai.use(require('chai-string'));
```

## Assertions

* startsWith/startWith
* endsWith/endWith
* equalIgnoreCase
* equalIgnoreSpaces
* containIgnoreSpaces
* singleLine
* reverseOf
* palindrome
* entriesCount
* indexOf

All assertions are defined for both the BDD and TDD syntax but some aliases exist to make the assertions look good with both styles.

```javascript
var d1 = 'abcdef',
    d2 = 'abc';

d1.should.startWith.d2
expect(d1).to.startsWith(d2)
assert.startsWith(d1, d2)
```

### startsWith/startWith
```javascript
assert.startsWith('abcdef', 'abc');
expect('abcdef').to.startsWith('abc');
'abcdef'.should.startWith('abc');
```

### endsWith/endWith
```javascript
assert.endsWith('abcdef', 'def');
expect('abcdef').to.endsWith('def');
'abcdef'.should.endWith('def');
```

### equalIgnoreCase
```javascript
assert.equalIgnoreCase('abcdef', 'AbCdEf');
expect('abcdef').to.equalIgnoreCase('AbCdEf');
```

### equalIgnoreSpaces
```javascript
assert.equalIgnoreSpaces('abcdef', 'a\nb\tc\r d  ef');
expect('abcdef').to.equalIgnoreSpaces('a\nb\tc\r d  ef');
```

### containIgnoreSpaces
```javascript
assert.containIgnoreSpaces('abcdefgh', 'a\nb\tc\r d  ef');
expect('abcdefgh').to.containIgnoreSpaces('a\nb\tc\r d  ef');
```

### singleLine
```javascript
assert.singleLine('abcdef');
expect('abcdef').to.be.singleLine();
```

### reverseOf
```javascript
assert.reverseOf('abcdef', 'fedcba');
expect('abcdef').to.be.reverseOf('fedcba');
```

### palindrome
```javascript
assert.palindrome('abccba');
expect('abccba').to.be.palindrome();
```

### entriesCount
```javascript
assert.entriesCount('abcabd', 'ab', 2);
expect('abcabd').to.have.entriesCount('ab', 2);
```

### indexOf
```javascript
assert.indexOf('abcabd', 'ab', 0);
expect('abcabd').to.have.indexOf('ab', 0);
```

## Thanks

Thanks to the [chai-datetime](https://github.com/gaslight/chai-datetime) module for giving me an idea for how to structure and test a chai plugin.
