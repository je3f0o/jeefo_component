/* -.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.
* File Name   : switch_directive.js
* Created at  : 2019-07-12
* Updated at  : 2019-07-18
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

const jqlite      = require("@jeefo/jqlite");
const compile     = require("../compiler");
const Interpreter = require("../interpreter");

module.exports = {
    type     : "structure",
	selector : "switch",
	priority : 900,
	controller : function ($element, component) {
        const { node, expression } = component;
        try {
            const interpreter = new Interpreter(expression, component);
            const value = interpreter.get_value();

            const matched_child = node.children.find(child => {
                if (child.attrs.has("case")) {
                    const expr = child.attrs.get("case");
                    const child_interpreter = new Interpreter(
                        expr, component
                    );
                    return child_interpreter.get_value() === value;
                } else if (child.attrs.has("default")) {
                    return true;
                }
            });

            node.children = node.children.filter(child => {
                const attrs = child.attrs;
                if (attrs.has("case")) {
                    attrs.remove("case");
                    return child === matched_child;
                } else if (attrs.has("default")) {
                    attrs.remove("default");
                    return child === matched_child;
                } else {
                    return true;
                }
            });

            const elements = compile([node], component);
            if (elements.length) {
                component.$element = jqlite(elements[0]);
                $element.replace(component.$element);
            } else {
                component.$element = null;
                $element.remove();
            }
        } catch (e) {
            throw e;
        }
	}
};
