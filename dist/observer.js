/* -.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.
* File Name   : observer.js
* Created at  : 2017-08-05
* Updated at  : 2017-08-24
* Author      : jeefo
* Purpose     :
* Description :
_._._._._._._._._._._._._._._._._._._._._.*/

/*
	possible    = "abcdefghijklmnopqrstuvwxyz0123456789";
var make_id = function () {
	var text = possible.charAt(Math.floor(Math.random() * 26));

	for(var i = 1; i < 10; ++i) {
		text += possible.charAt(Math.floor(Math.random() * 36));
	}

	return text;
};
*/

var array_remove           = require("jeefo_utils/array/remove"),
	object_define_property = Object.defineProperty;

var Observer = module.exports = function (object) {
	this.object     = object;
	this.values     = {};
	this.handlers   = {};
	this.properties = [];
};

Observer.prototype = {
	$on : function (property, handler) {
		var self = this;

		if (! self.handlers[property]) {
			var object    = self.object,
				values    = self.values,
				callbacks = self.handlers[property] = [];

			self.properties.push(property);
			values[property] = object[property];

			object_define_property(object, property, {
				configurable : true,
				get : function () { return values[property]; },
				set : function (new_value) {
					var old_value = values[property];
					if (old_value !== new_value) {
						values[property] = new_value;

						for (var i = 0; i < callbacks.length; ++i) {
							callbacks[i].call(object, new_value, old_value);
						}
					}
				}
			});
		}
		self.handlers[property].push(handler);

		// jshint latedef : false
		return unwatch;

		function unwatch () {
			array_remove(self.handlers[property], handler);
			if (self.handlers[property].length === 0) {
				array_remove(self.properties, property);

				delete self.object[property];
				self.object[property] = self.values[property];
				self.values[property] = self.handlers[property] = null;
			}
		}
		// jshint latedef : true
	},
	$destroy : function () {
		for (var i = this.properties.length - 1; i >= 0; --i) {
			delete this.object[this.properties[i]];
			this.object[this.properties[i]] = this.values[this.properties[i]];
		}
		this.values = this.properties = this.handlers = null;
	}
};
