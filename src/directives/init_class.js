/* -.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.
* File Name   : init_class.js
* Created at  : 2019-09-20
* Updated at  : 2019-09-20
* Author      : jeefo
* Purpose     :
* Description :
* Reference   :
.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.*/
// ignore:start
"use strict";

/* globals*/
/* exported*/

// ignore:end

const for_each = require("@jeefo/utils/object/for_each");
const property = "(object)";

module.exports = {
	selector : "init-class",
	bindings : {
		[property] : "!initClass",
	},
	controller : function ($element) {
        for_each(this[property], (key, value) => {
            if (value) {
                $element.add_class(key);
            } else {
                $element.remove_class(key);
            }
        });
	}
};
