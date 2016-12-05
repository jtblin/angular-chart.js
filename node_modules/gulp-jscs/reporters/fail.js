'use strict';
var PluginError = require('gulp-util').PluginError;
var through = require('through2');

module.exports = function (failImmediately) {
	// paths to files that failed JSCS
	var fails = false;

	return through.obj(function (file, enc, cb) {
		var error = null;

		// check for failure
		if (file.jscs && !file.jscs.success) {
			if (failImmediately) {
				error = new PluginError('gulp-jscs', {
					message: 'JSCS failed for: ' + file.path,
					showStack: false
				});
			} else {
				(fails = fails || []).push(file.path);
			}
		}

		cb(error, file);
	}, function (cb) {
		if (!failImmediately && fails) {
			// calling `cb(err)` would not emit the `end` event,
			// so emit the error explicitly and call `cb()` afterwards.
			this.emit('error', new PluginError('gulp-jscs', {
				message: 'JSCS failed for: ' + fails.join(', '),
				showStack: false
			}));
		}

		cb();
	});
};
