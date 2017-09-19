/* -.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.
* File Name   : constructor.js
* Created at  : 2017-08-11
* Updated at  : 2017-09-19
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
	var $parser = function (code) {
		return parser(component, code);
	};
	$parser.find_controller = function (code) {
		return parser.find_controller(component, code);
	};

	return $parser;
};

module.exports = function (component, instance, is_component) {
	var definition = instance.definition;
	if (! definition.controller) {
		return;
	}

	var controller = instance.controller = new definition.controller.Controller();

	if (definition.bindings) {
		binder(component, instance);
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
					args[i] = parser_wrapper(is_component ? component.parent : component);
					break;
				case "$component" :
					args[i] = component;
					break;
			}
		}

		controller.on_init.apply(controller, args);
	}
};
