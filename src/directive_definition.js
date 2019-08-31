/* -.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.
* File Name   : directive_definition.js
* Created at  : 2017-08-07
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

const for_each    = require("@jeefo/utils/object/for_each");
const dash_case   = require("@jeefo/utils/string/dash_case");
const styles      = require("./styles");
const IDefinition = require("./i_definition");

const define_property          = Object.defineProperty;
const CAPTURE_DEPENDENCY_REGEX = /^(\^+)?(.+)$/;

class DirectiveDefinition extends IDefinition {
    constructor (selectors, path) {
        super(selectors, path);
        this.priority     = 0;
        this.is_structure = false;
    }

    resolve () {
        const {
            type, priority, style, controller, controller_name,
            bindings, dependencies = {}
        } = require(this.path);

        if (priority) { this.priority = priority; }
        if (type) {
            if (type.toLowerCase() === "structure") {
                this.is_structure     = true;
                this.is_self_required = true;
            } else {
                throw new SyntaxError("Invalid directive type");
            }
        }

        if (style) {
            const selectors = this.selectors.map(s => `"${s}"`);
            styles.add_style(style, {
                "directive-selectors" : `[${ selectors.join(", ") }]`
            });
        }

        // Conroller
        if (controller) {
            class Controller {}
            if (typeof controller === "function") {
                define_property(Controller.prototype, "on_init", {
                    value : controller
                });
            } else {
                for_each(controller, (key, value) => {
                    define_property(Controller.prototype, key, {value});
                });
            }
            this.Controller = Controller;
            if (controller_name) {
                this.controller_name = controller_name;
            }
        }

        // Dependencies
        this.dependencies = Object.keys(dependencies).map(property => {
            const dependency = dependencies[property];
            const matches    = dependency.match(CAPTURE_DEPENDENCY_REGEX);
            const name       = dash_case(matches[2]);
            const direction  = matches[1] || null;
            return { property, name, direction };
        });

        // Bindings
        this.set_binders(bindings);
        this.is_resolved = true;
    }
}

module.exports = DirectiveDefinition;
