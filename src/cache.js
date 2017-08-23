/* -.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.
* File Name   : cache.js
* Created at  : 2017-08-10
* Updated at  : 2017-08-14
* Author      : jeefo
* Purpose     :
* Description :
_._._._._._._._._._._._._._._._._._._._._.*/
// ignore:start

/* globals */
/* exported */

// ignore:end

var cache                     = Object.create(null),
	directives                = require("directives"),
	components                = require("components"),
	make_directive_controller = require("./make_directive_controller");

exports.resolve_directive = function (path) {
	path = directives[path];

	if (! cache[path]) {
		var definition = cache[path] = require(path);

		if (definition.priority === void 0) {
			definition.priority = 0;
		}

		if (definition.controller && ! definition.controller.Controller) {
			make_directive_controller(definition.controller);
		}
	}

	return cache[path];
};

exports.resolve_component = function (path) {
	path = components[path];

	if (! cache[path]) {
		var definition = cache[path] = require(path);

		if (definition.controller && ! definition.controller.Controller) {
			make_directive_controller(definition.controller);
		}
	}

	return cache[path];
};
