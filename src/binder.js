/* -.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.
* File Name   : binder.js
* Created at  : 2017-09-06
* Updated at  : 2017-11-04
* Author      : jeefo
* Purpose     :
* Description :
_._._._._._._._._._._._._._._._._._._._._.*/
// ignore:start
"use strict";

/* globals */
/* exported */

// ignore:end

var Input       = require("./input"),
	Observer    = require("./observer"),
	object_keys = Object.keys,

PLACEHOLDER_REGEX = /{{\s*([^}]+)\s*}}/g,

bind_one_way = function (input, controller, controller_property) {
	return {
		input      : input,
		value      : controller[controller_property] = input.invoke(),
		is_changed : function () {
			var value = controller[controller_property] = this.input.invoke();
			if (this.value !== value) {
				this.value = value;
				return true;
			}
		}
	};
},

bind_two_way = function (input, controller, controller_property) {
	var change_detector = bind_one_way(input, controller, controller_property);

	input.build_setter();

	change_detector.observer = new Observer(controller);
	change_detector.observer.$on(controller_property, function (value) {
		input.set(value);
	});

	return change_detector;
};

module.exports = function binder (component, instance) {
	var attrs            = component.attrs,
		bindings         = instance.definition.bindings,
		controller       = instance.controller,
		change_detectors = instance.change_detectors;

	object_keys(bindings).forEach(function (prop) {
		var key      = bindings[prop],
			operator = key.charAt(0);

		key = key.substring(1);
		if (! key) {
			key = prop;
		}

		var value = attrs.get(key);

		if (operator === '@') {
			if (! value) { return; }

			controller[prop] = value.replace(PLACEHOLDER_REGEX, function (sub, param) {
				param = param.trim();
				var input  = new Input(component, param),
					_value = input.invoke();

				change_detectors.push({
					input      : input,
					value      : _value,
					is_changed : function () {
						var _value = this.input.invoke();
						if (this.value !== _value) {
							controller[prop] = value.replace(PLACEHOLDER_REGEX, function (_sub, _param) {
								_param = _param.trim();
								if (param === _param) {
									return _value;
								}
								return _param;
							});

							this.value = _value;
							return true;
						}
					}
				});

				return _value;
			});
		} else {
			var input = new Input(component, value || prop);
			
			switch (operator) {
				case '=' :
					change_detectors.push(bind_two_way(input, controller, prop));
					break;
				case '<' :
					change_detectors.push(bind_one_way(input, controller, prop));
					break;
				case '!' :
					controller[prop] = input.invoke();
					break;
				default:
					throw new Error("Invalid binding");
			}
		}
	});
};
