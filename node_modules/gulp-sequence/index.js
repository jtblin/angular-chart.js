'use strict'
/*
 * gulp-sequence
 * https://github.com/teambition/gulp-sequence
 *
 * Copyright (c) 2014 Yan Qing
 * Licensed under the MIT license.
 */

var thunk = require('thunks')()
var gutil = require('gulp-util')
var packageName = require('./package.json').name
var slice = Array.prototype.slice

module.exports = sequence()

function sequence (gulp) {
  function gulpSequence () {
    if (!gulp) gulp = require('gulp')

    var BREAKER = {}
    var args = slice.call(arguments)
    var done = args[args.length - 1]

    if (typeof done === 'function') args.pop()
    else done = null

    if (!args.length) {
      throw new gutil.PluginError(packageName, 'No tasks were provided to gulp-sequence!')
    }

    var runSequence = thunk.seq(args.filter(function (taskName) {
      // filter falsely taskName
      return taskName
    }).map(function (task) {
      return function (callback) {
        if (!Array.isArray(task)) task = [task]

        function successListener (e) {
          var index = task.indexOf(e.task)
          if (index < 0) return
          task[index] = BREAKER
          for (var i = 0; i < task.length; i++) {
            if (task[i] !== BREAKER) return
          }
          removeListener()
          callback()
        }

        function errorListener (e) {
          if (!e.err || task.indexOf(e.task) < 0) return
          removeListener()
          callback(e.err)
        }

        function removeListener () {
          gulp.removeListener('task_stop', successListener)
            .removeListener('task_not_found', errorListener)
            .removeListener('task_recursion', errorListener)
            .removeListener('task_err', errorListener)
        }

        gulp
          .on('task_stop', successListener)
          .on('task_not_found', errorListener)
          .on('task_recursion', errorListener)
          .on('task_err', errorListener)
          .start(task.slice())
      }
    }))

    return done ? runSequence(done) : runSequence
  }

  gulpSequence.use = function (gulp) {
    return sequence(gulp)
  }

  return gulpSequence
}
