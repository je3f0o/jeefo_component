/* -.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.
* File Name   : jf_bind_directive.js
* Created at  : 2017-07-26
* Updated at  : 2019-07-21
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

const Observer = require("@jeefo/observer");

const bind = ($element, value) => {
    switch (value) {
        case undefined :
            $element.text = "undefined";
            break;
        case null :
            $element.text = "null";
            break;
        default:
            $element.text = value;
    }
};

module.exports = {
	selector : "jf-bind",
	bindings : {
		"(bind)" : "@jfBind",
	},
	controller : {
		on_init : function ($element) {
            bind($element, this["(bind)"]);
            const observer = new Observer(this);
            observer.on("(bind)", value => bind($element, value));
		}
	}
};
