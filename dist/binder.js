/* -.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.
* File Name   : binder.js
* Created at  : 2017-09-06
* Updated at  : 2017-09-17
* Author      : jeefo
* Purpose     :
* Description :
_._._._._._._._._._._._._._._._._._._._._.*/

var parser   = require("./parser"),
	Observer = require("./observer"),
	object_keys = Object.keys,

PLACEHOLDER_REGEX = /{{\s*([^}]+)\s*}}/g,

bind_one_way = function ($parser, controller, controller_property) {
	return {
		value      : controller[controller_property] = $parser.get(),
		$parser    : $parser,
		is_changed : function () {
			var value = controller[controller_property] = this.$parser.get();
			if (this.value !== value) {
				this.value = value;
				return true;
			}
		}
	};
},

bind_two_way = function ($parser, controller, controller_property) {
	var change_detector = bind_one_way($parser, controller, controller_property);

	change_detector.observer = new Observer(controller);
	change_detector.observer.$on(controller_property, function (value) {
		var is_succeed = change_detector.$parser.set(value);
		if (! is_succeed) {
			is_succeed = true;
			//controller[controller_property] = void 0;
		}
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

		var value = attrs.get(key) || prop;

		if (operator === '@') {
			controller[prop] = value.replace(PLACEHOLDER_REGEX, function (sub, param) {
				param = param.trim();
				var $parser = parser(component, param),
					_value  = $parser.get();

				change_detectors.push({
					value      : _value,
					$parser    : $parser,
					is_changed : function () {
						var _value = this.$parser.get();
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
			var $parser = parser(component, value);
			
			if ($parser.is_primitive) {
				controller[prop] = $parser.value;
				return;
			}

			switch (operator) {
				case '=' :
					change_detectors.push(bind_two_way($parser, controller, prop));
					break;
				case '<' :
					change_detectors.push(bind_one_way($parser, controller, prop));
					break;
				case '!' :
					controller[prop] = $parser.get();
					break;
				default:
					throw new Error("Invalid binding");
			}
		}
	});
};
