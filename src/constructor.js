/* -.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.
* File Name   : constructor.js
* Created at  : 2017-08-11
* Updated at  : 2017-10-06
* Author      : jeefo
* Purpose     :
* Description :
_._._._._._._._._._._._._._._._._._._._._.*/
// ignore:start
"use strict";

/* globals */
/* exported */

// ignore:end

var binder = require("./binder");

module.exports = function constructor (component, instance) {
	var definition = instance.definition;
	if (! definition.controller) {
		return;
	}

	var controller = instance.controller = new definition.controller.Controller();
	instance.controller_as = definition.controller_as;

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
				case "$component" :
					args[i] = component;
					break;
			}
		}

		controller.on_init.apply(controller, args);
	}
};
