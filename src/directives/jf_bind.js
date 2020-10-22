/* -.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.
* File Name   : jf_bind.js
* Created at  : 2017-07-26
* Updated at  : 2020-10-23
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
	controller : class Binder {
		on_init ($element) {
            bind($element, this["(bind)"]);
            const observer = new Observer(this);
            observer.on("(bind)", value => bind($element, value));
		}
	}
};
