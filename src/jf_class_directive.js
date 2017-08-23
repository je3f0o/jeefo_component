/* -.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.
* File Name   : jf_class_directive.js
* Created at  : 2017-07-26
* Updated at  : 2017-08-06
* Author      : jeefo
* Purpose     :
* Description :
_._._._._._._._._._._._._._._._._._._._._.*/
// ignore:start

/* globals MODULE */
/* exported */

// ignore:end

MODULE.directive("jfClass", function () {
	return {
		bindings : {
			class_expression : "<jfClass",
		},
		controller : {
			on_init : ["$element", function ($element) {
				this.$element = $element;
				this.on_change();
			}],
			on_change : function () {
				this.$element[0].className = this.class_expression;
			}
		}
	};
});
