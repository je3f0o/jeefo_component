/* -.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.
* File Name   : constructor.js
* Created at  : 2017-08-11
* Updated at  : 2017-09-06
* Author      : jeefo
* Purpose     :
* Description :
_._._._._._._._._._._._._._._._._._._._._.*/
// ignore:start

/* globals */
/* exported */

// TODO: Make binder to it's own file

// ignore:end

var parser = require("./parser"),
	binder = require("./binder"),

parser_wrapper = function (component) {
	return function (code) {
		return parser(component, code);
	};
};

module.exports = function (component, instance) {
	var definition = instance.definition;
	if (! definition.controller) {
		return;
	}

	var controller = instance.controller = new definition.controller.Controller();

	if (definition.bindings) {
		binder(component, controller, definition.bindings);
	}

	if (controller.on_init) {
		var dependencies = definition.controller.dependencies, i = dependencies.length, args = [];

		if (i === 0) {
			return controller.on_init();
		}

		while (i--) {
			switch (dependencies[i]) {
				case "$element" :
					args[i] = component.$element;
					break;
				case "$parser" :
					args[i] = parser_wrapper(component);
					break;
				case "$component" :
					args[i] = component;
					break;
			}
		}

		controller.on_init.apply(controller, args);
	}
};
