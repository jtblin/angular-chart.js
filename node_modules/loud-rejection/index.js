'use strict';
var util = require('util');
var onExit = require('signal-exit');
var currentlyUnhandled = require('currently-unhandled');

var installed = false;

function outputRejectedMessage(err) {
	if (err instanceof Error) {
		console.error(err.stack);
	} else {
		console.error('Promise rejected with value: ' + util.inspect(err));
	}
}

module.exports = function () {
	if (installed) {
		return;
	}

	installed = true;

	var listUnhandled = currentlyUnhandled();

	onExit(function () {
		var unhandledRejections = listUnhandled();

		if (unhandledRejections.length > 0) {
			unhandledRejections.forEach(function (x) {
				outputRejectedMessage(x.reason);
			});

			process.exitCode = 1;
		}
	});
};
