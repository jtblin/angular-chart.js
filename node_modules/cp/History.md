
0.2.0 / 2014-11-14
==================

  * .travis: Remove node 0.8
  * index: Add `yield cp(src, dst)` support (closes #4)
  * Readme: Rename to match conventions
  * Readme: Add `yield` dox
  * History: Rename/rewrite to match conventions
  * Makefile: Refactor to use istanbul for coverage
  * Add travis

0.1.1 / 2013-07-08
==================

* added test-coverage reporting
* explicitly destroying streams to prevent erroneously leaving one open on error

0.1.0 / 2013-07-01
==================

* initial release, support `cp(src, dest, cb)` and `cp.sync(src, dest)`