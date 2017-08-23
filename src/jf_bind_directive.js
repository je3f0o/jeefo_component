/* -.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.
* File Name   : jf_bind_directive.js
* Created at  : 2017-07-26
* Updated at  : 2017-08-14
* Author      : jeefo
* Purpose     :
* Description :
_._._._._._._._._._._._._._._._._._._._._.*/
// ignore:start

/* globals */
/* exported */

// ignore:end

module.exports = {
	selector : "jf-bind",
	bindings : {
		bind : "<jfBind",
	},
	controller : {
		on_init : function ($element) {
			this.$element = $element;
			this.on_change();
		},
		on_change : function () {
			this.$element.text(this.bind);
		}
	}
};
