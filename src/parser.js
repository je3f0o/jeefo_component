/* -.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.
* File Name   : parser.js
* Created at  : 2017-07-25
* Updated at  : 2017-08-24
* Author      : jeefo
* Purpose     :
* Description :
_._._._._._._._._._._._._._._._._._._._._.*/
// ignore:start

/* globals */
/* exported */

// ignore:end

var is_digit = require("jeefo_utils/is/digit");

module.exports = function (component, code) {
	switch (code) {
		case "true"  :
		case "false" :
			return code === "true";
		case "null"  :
			return null;
	}
	if (is_digit(code)) {
		return +code;
	}

	// jshint latedef : false
	return generate_getter_setter(component, code);

	function generate_getter_setter (component, code) {
		var index = code.length, i;
		i = code.indexOf('.');
		if (i !== -1) {
			index = i;
		}
		i = code.indexOf('(');
		if (i !== -1 && i < index) {
			index = i;
		}
		i = code.indexOf('[');
		if (i !== -1 && i < index) {
			index = i;
		}

		// jshint evil : true
		var property_name = code.substring(0, index),
			context       = find_controller(component, property_name),

			getter = new Function("context",
				`try { return context.${ code }; } catch (e) {}`),
			setter = new Function("context", "value",
				`try { context.${ code } = value; return true; } catch (e) {}`);
		// jshint evil : false

		return {
			getter : function () {
				return getter(context);
			},
			setter : function (value) {
				return setter(context, value);
			}
		};

		function find_controller (component, property_name) {
			if (component.controller) {
				if (component.controller_as === property_name || property_name in component.controller) {
					return component.controller;
				}
			}
			if (component.parent) {
				return find_controller(component.parent, property_name);
			}
		}
	}
	// jshint latedef : true
};
