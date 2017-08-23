/* -.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.
* File Name   : attributes.js
* Created at  : 2017-08-05
* Updated at  : 2017-08-24
* Author      : jeefo
* Purpose     :
* Description :
_._._._._._._._._._._._._._._._._._._._._.*/
// ignore:start

/* globals */
/* exported */

// ignore:end

var dash_case   = require("jeefo_utils/string/dash_case"),
	object_keys = Object.keys;

var Attributes = module.exports = function (element) {
	for (var i = 0, attrs = element.attributes; i < attrs.length; ++i) {
		this[attrs[i].name] = attrs[i].value;
	}
};

Attributes.prototype = {
	$set : function (key, value) {
		this[dash_case(key)] = value;
	},
	$compile : function () {
		var i = 0, keys = object_keys(this), result = '';

		for (; i < keys.length; ++i) {
			result += ' ' + keys[i];
			if (this[keys[i]]) {
				result += '="' + this[keys[i]] + '"';
			}
		}

		return result;
	},
};
