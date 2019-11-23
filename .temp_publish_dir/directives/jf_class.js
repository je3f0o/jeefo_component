/* -.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.
* File Name   : jf_class.js
* Created at  : 2017-07-26
* Updated at  : 2019-09-29
* Author      : jeefo
* Purpose     :
* Description :
.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.*/
// ignore:start
"use strict";

/* globals*/
/* exported*/

// ignore:end

const Observer = require("@jeefo/observer");
const for_each = require("@jeefo/utils/object/for_each");

const property       = "(object)";
const static_objects = {};

const set_classes = (symbol, object) => {
    const $element = static_objects[symbol];
    for_each(object, (key, value) => {
        if (value) {
            $element.add_class(key);
        } else {
            $element.remove_class(key);
        }
    });
};

module.exports = {
	selector : "jf-class",
	bindings : {
		[property] : "<jfClass",
	},
	controller : {
		on_init ($element) {
            this.symbol                 = Symbol("$element");
            static_objects[this.symbol] = $element;

            set_classes(this.symbol, this[property]);
            const observer = new Observer(this);
            observer.on(property, object => {
                set_classes(this.symbol, object);
            });
		},

        on_digest () {
            set_classes(this.symbol, this[property]);
        },

        on_destroy () {
            delete static_objects[this.symbol];
        }
	}
};
