/* -.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.
* File Name   : parser.js
* Created at  : 2017-07-25
* Updated at  : 2017-09-19
* Author      : jeefo
* Purpose     :
* Description :
_._._._._._._._._._._._._._._._._._._._._.*/

var is_digit = require("jeefo_utils/is/digit"),

null_parser = { value : null, is_primitive : true },

primitive = function (code) {
	switch (code) {
		case "true"  :
		case "false" :
			return { value : code === "true", is_primitive : true };
		case "null" :
			return null_parser;
	}
	if (is_digit(code)) {
		return { value : +code, is_primitive : true };
	}
},

find_controller = function  (component, property_name) {
	if (component.controller) {
		if (component.controller_as === property_name || property_name in component.controller) {
			return component.controller;
		}
	}
	if (component.parent) {
		return find_controller(component.parent, property_name);
	}
},

parser = function (component, code) {
	var $parser = primitive(code);

	if ($parser) {
		return $parser;
	}

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
			"try { return context." + code + "; } catch (e) {}"),
		setter = new Function("context", "value",
			"try { context." + code + " = value; return true; } catch (e) {}");
	// jshint evil : false

	return {
		get : function () {
			return getter(context);
		},
		set : function (value) {
			return setter(context, value);
		}
	};
};

parser.find_controller = find_controller;

module.exports = parser;
