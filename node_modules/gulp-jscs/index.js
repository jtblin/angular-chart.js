'use strict';
var path = require('path');
var gutil = require('gulp-util');
var through = require('through2');
var tildify = require('tildify');
var Checker = require('jscs');
var loadConfigFile = require('jscs/lib/cli-config');

module.exports = function (opts) {
	opts = opts || {};

	var config;
	var checker = new Checker();

	try {
		config = loadConfigFile.load(opts.configPath);
	} catch (err) {
		err.message = 'Unable to load JSCS config file';

		if (opts.configPath) {
			err.message += ' at ' + tildify(path.resolve(opts.configPath));
		}

		err.message += '\n' + err.message;

		throw err;
	}

	// run autofix over as many errors as possible
	if (opts.fix) {
		config.maxErrors = Infinity;
	}

	checker.registerDefaultRules();
	checker.configure(config);

	return through.obj(function (file, enc, cb) {
		if (file.isNull()) {
			cb(null, file);
			return;
		}

		if (file.isStream()) {
			cb(new gutil.PluginError('gulp-jscs', 'Streaming not supported'));
			return;
		}

		if (checker.getConfiguration().isFileExcluded(file.path)) {
			cb(null, file);
			return;
		}

		var fixResults;
		var errors;
		var contents = file.contents.toString();

		if (opts.fix) {
			fixResults = checker.fixString(contents, file.path);
			errors = fixResults.errors;
			file.contents = new Buffer(fixResults.output);
		} else {
			errors = checker.checkString(contents, file.path);
		}

		var errorList = errors.getErrorList();

		file.jscs = {
			success: true,
			errorCount: 0,
			errors: []
		};

		if (errorList.length > 0) {
			file.jscs.success = false;
			file.jscs.errorCount = errorList.length;
			file.jscs.errors = errors;
		}

		cb(null, file);
	});
};

module.exports.reporter = require('./reporters');
