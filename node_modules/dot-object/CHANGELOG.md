# ChangeLog

## 2016-02-14, Version 1.4.0
* add transform() method
* use [standard](https://github.com/feross/standard/) style

## 2015-11-17, Version 1.3.1
* [[`e46da6ffc0`](https://github.com/rhalff/dot-object/commit/e46da6ffc0)] - Fix deep array bug. (Reported by ami44 #10)

## 2015-10-01, Version 1.3.0
* [[`baa42022bf`](https://github.com/rhalff/dot-object/commit/baa42022bf)] - Adds a parameter (useArray) to allow converting object without using arrays. (Thomas Moiron)

## 2015-09-07, Version 1.2.0
* allow override even when target is non-empty object
* also return the object when using object() or str()

## 2015-08-08, Version 1.1.0
* Also let .object() understand array notation.

## 2015-08-03, Version 1.0.0
* Convert object to dotted-key/value pairs

## 2015-04-15, Version 0.11.0
* Add support for bracket notation

## 2015-03-22, Version 0.10.0
* Make return value optional for Object/Array modifier(s)
* Add modifier option to move(), transfer() & copy()

## 2015-03-21, Version 0.9.0
* support multiple replacements/deletions (cli)
* add del/remove method
* improve bower build

## 2015-03-09, Version 0.8.1

* [[`679f87590f`](https://github.com/rhalff/dot-object/commit/679f87590f)] - add to bower
* [[`9a026982d8`](https://github.com/rhalff/dot-object/commit/9a026982d8)] - consider amd or attaching to window

## 2015-03-06, Version 0.8.0

* [[`5ce0fe8836`](https://github.com/rhalff/dot-object/commit/5ce0fe8836)] - Simplify API

## 2015-03-06, Version 0.7.0

* [[`c4658c386f`](https://github.com/rhalff/dot-object/commit/c4658c386f)] - Look for properties down in the prototype chain. (Fer Uría)
* [[`a45c4a7982`](https://github.com/rhalff/dot-object/commit/a45c4a7982)] - Fix picking a null property with a dotted value. (Fer Uría)
