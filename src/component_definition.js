/* -.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.
* File Name   : component_definition.js
* Created at  : 2019-06-24
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

const extend_member        = require("@jeefo/utils/class/extend_member");
const object_for_each      = require("@jeefo/utils/object/for_each");
const styles               = require("./styles");
const IDefinition          = require("./interfaces/i_definition");
const TranscludeController = require("./transclude_controller");

const is_class = value => value.toString().startsWith("class");

const pendings = Object.create(null);

const _resolve = async instance => {
    const {
        type, style, template, controller, controller_name,
        bindings, dependencies = {}
    } = await jeefo.require(instance.path);

    // Type
    if (type) {
        if (type.toLowerCase() === "structure") {
            instance.is_structure = true;
        } else {
            throw new SyntaxError("Invalid definition type");
        }
    }

    // Style
    if (style) {
        const selectors = instance.selectors.map(s => `"${s.toLowerCase()}"`);
        styles.add_style(style, {
            "component-selectors" : `[${ selectors.join(", ") }]`
        });
    }

    // Template
    if (typeof template === "string") {
        instance.transclude_controller = new TranscludeController(template);
    } else if (typeof template === "function") {
        instance.template_handler = template;
    } else {
        instance.transclude_controller = new TranscludeController();
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
        instance.Controller = Ctrl;
        if (controller_name) {
            instance.controller_name = controller_name;
        }
    }

    return {bindings, dependencies};
};

class ComponentDefinition extends IDefinition {
    constructor (selectors, path) {
        super(selectors, path);
        this.template_handler      = null;
        this.transclude_controller = null;
    }

    resolve () {
        if (pendings[this.selectors[0]]) {
            return pendings[this.selectors[0]];
        }

        pendings[this.selectors[0]] = new Promise(async resolver => {
            const {bindings, dependencies} = await _resolve(this);
            super.set_binders(bindings);
            super.set_dependencies(dependencies);
            this.is_resolved = true;
            resolver();
        });

        return pendings[this.selectors[0]];
    }

    transclude (element) {
        this.transclude_controller.transclude(element);
    }
}

module.exports = ComponentDefinition;
