/* -.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.
* File Name   : component_definition.js
* Created at  : 2019-06-24
* Updated at  : 2019-09-17
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

const dash_case            = require("@jeefo/utils/string/dash_case");
const extend_member        = require("@jeefo/utils/class/extend_member");
const jeefo_template       = require("@jeefo/template");
const object_for_each      = require("@jeefo/utils/object/for_each");
const styles               = require("./styles");
const IDefinition          = require("./i_definition");
const TranscludeController = require("./transclude_controller");

const STRING_TEMPLATE = /{{([^}]+)}}/g;

const is_class = value => value.toString().startsWith("class");

class ComponentDefinition extends IDefinition {
    constructor (selectors, path) {
        super(selectors, path);
        this.template_handler      = null;
        this.transclude_controller = null;
    }

    async resolve () {
        const {
            style, template, controller, controller_name,
            bindings, dependencies = {}
        } = await jeefo.require(this.path);

        if (style) {
            const selectors = this.selectors.map(s => `"${s}"`);
            styles.add_style(style, {
                "component-selectors" : `[${ selectors.join(", ") }]`
            });
        }

        // Template
        if (typeof template === "string") {
            const _template = template.replace(STRING_TEMPLATE, (_, expr) => {
                return `\${${ expr }}`;
            });
            const nodes = jeefo_template.parse(_template);
            this.transclude_controller = new TranscludeController(nodes);
        } else if (typeof template === "function") {
            this.template_handler = template;
        } else {
            this.transclude_controller = new TranscludeController([]);
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
                object_for_each(controller, (key, value) => {
                    extend_member(Controller, key, value);
                });
                Ctrl = Controller;
            }
            this.Controller = Ctrl;
            if (controller_name) {
                this.controller_name = controller_name;
            }
        }

        this.dependencies = Object.keys(dependencies).map(property => {
            const name = dash_case(dependencies[property]);
            return { property, name };
        });
        Object.getOwnPropertySymbols(dependencies).forEach(symbol => {
            const name = dash_case(dependencies[symbol]);
            this.dependencies.push({ property : symbol, name });
        });

        this.set_binders(bindings);
        this.is_resolved = true;
    }

    transclude (child_nodes) {
        return this.transclude_controller.transclude(child_nodes);
    }
}

module.exports = ComponentDefinition;
