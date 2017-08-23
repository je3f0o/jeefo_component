/* -.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.
* File Name   : constructor.js
* Created at  : 2017-08-11
* Updated at  : 2017-08-15
* Author      : jeefo
* Purpose     :
* Description :
_._._._._._._._._._._._._._._._._._._._._.*/

var parser      = require("./parser"),
	Observer    = require("./observer"),
	object_keys = Object.keys,

parser_wrapper = function (component) {
	return function (code) {
		return parser(component, code);
	};
},

binder = function (component, context_property, controller, controller_property) {
	var $parser = parser(component, context_property);

	return {
		value      : controller[controller_property] = $parser.getter(),
		$parser    : $parser,
		is_changed : function () {
			var value = controller[controller_property] = this.$parser.getter();
			if (this.value !== value) {
				this.value = value;
				return true;
			}
		}
	};
},

two_way_bind = function (component, context_property, controller, controller_property) {
	var change_detector = binder(component, context_property, controller, controller_property);

	change_detector.observer = new Observer(controller);
	change_detector.observer.$on(controller_property, function (value) {
		var is_succeed = change_detector.$parser.setter(value);
		if (! is_succeed) {
			is_succeed = true;
			//controller[controller_property] = void 0;
		}
	});

	return change_detector;
};

module.exports = function (component, instance) {
	var definition = instance.definition;
	if (! definition.controller) {
		return;
	}

	var controller = instance.controller = new definition.controller.Controller();

	// Bindings {{{1
	if (definition.bindings) {
		var attrs = component.attrs;

		object_keys(definition.bindings).forEach(function (prop) {
			var key      = definition.bindings[prop],
				operator = key.charAt(0);

			key = key.substring(1);
			if (! key) {
				key = prop;
			}

			var value = attrs.get(key) || prop;

			switch (operator) {
				case '=' :
					component.change_detectors.push(two_way_bind(component, value, controller, prop));
					break;
				case '<' :
					component.change_detectors.push(binder(component, value, controller, prop));
					break;
				case '@' :
					controller[prop] = value;
					break;
				default:
					throw new Error("Invalid binding");
			}
		});
	}
	// }}}1

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
