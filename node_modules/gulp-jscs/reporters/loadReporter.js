'use strict';
var getReporter = require('jscs/lib/cli-config').getReporter;

module.exports = function (reporter) {
	// we want the function
	if (typeof reporter === 'function') {
		return reporter;
	}

	// load JSCS built-in or absolute path or module reporters
	return getReporter(reporter).writer;
};
