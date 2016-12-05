# bump-regex
[![Build Status](https://travis-ci.org/stevelacy/bump-regex.png?branch=master)](https://travis-ci.org/stevelacy/bump-regex)
[![NPM version](https://badge.fury.io/js/bump-regex.png)](http://badge.fury.io/js/bump-regex)

> bump regex with semver

## Information

<table>
<tr>
<td>Package</td><td>bump-regex</td>
</tr>
<tr>
<td>Description</td>
<td>bump regex with semver</td>
</tr>
<tr>
<td>Node Version</td>
<td>>= 0.9</td>
</tr>
</table>

## Usage

#### Install

```sh
$ npm install --save bump-regex
```

```js

var bump = require('bump-regex');

bump('version: "0.1.2"', function(err, out) {
  // => 'version: "0.1.3"'
});
```

## Options

### options.type
Semver version type to bump

    Type: `String`
    Default: `patch`
    Valid values: `major|minor|patch|prerelease`

### options.key
Set the versioning key

    Type: `String`
    Default: `version`

### options.version
Set a specific version to bump to.

    Type: `String`
    Default: `null`

### options.preid
Set the prerelase tag to use

    Type: `String`
    Default: `null`

Example:

```js
  type: 'prerelease',
  preid : 'alphaWhateverTheYWant'

 // => '0.0.2-alphaWhateverTheYWant.0'
```

## Versioning
#### Versioning Used: [Semantic](http://semver.org/)
#### String, lowercase

  - MAJOR ("major") version when you make incompatible API changes
  - MINOR ("minor") version when you add functionality in a backwards-compatible manner
  - PATCH ("patch") version when you make backwards-compatible bug fixes.
  - PRERELEASE ("prerelease") a pre-release version

#### Version example

    major: 1.0.0
    minor: 0.1.0
    patch: 0.0.2
    prerelease: 0.0.1-2


## LICENSE [MIT](LICENSE)
