/* -.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.
* File Name   : directive_definition.js
* Created at  : 2017-08-07
* Updated at  : 2020-10-23
* Author      : jeefo
* Purpose     :
* Description :
* Reference   :
.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.*/
// ignore:start
"use strict";

/* globals jeefo*/
/* exported*/

// ignore:end

const for_each      = require("@jeefo/utils/object/for_each");
const extend_member = require("@jeefo/utils/class/extend_member");
const styles        = require("./styles");
const IDefinition   = require("./interfaces/i_definition");

const is_class = value => value.toString().startsWith("class");

class DirectiveDefinition extends IDefinition {
    constructor (selectors, path) {
        super(selectors, path);
        this.priority = 0;
    }

    async resolve () {
        const {
            type, priority, style, controller, controller_name,
            bindings, dependencies = {}
        } = await jeefo.require(this.path);

        if (priority) { this.priority = priority; }
        if (type) {
            if (type.toLowerCase() === "structure") {
                this.is_structure = true;
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
            let Ctrl;
            if (typeof controller === "function") {
                if (is_class(controller)) {
                    Ctrl = controller;
                } else {
                    class Controller {}
                    extend_member(Controller, "on_init", controller);
                    Ctrl = Controller;
                }
            } else {
                class Controller {}
                for_each(controller, (key, value) => {
                    extend_member(Controller, key, value);
                });
                Ctrl = Controller;
            }
            this.Controller = Ctrl;
            if (controller_name) {
                this.controller_name = controller_name;
            }
        }

        super.set_binders(bindings);
        super.set_dependencies(dependencies);
        this.is_resolved = true;
    }
}

module.exports = DirectiveDefinition;
