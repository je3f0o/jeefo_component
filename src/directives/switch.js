/* -.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.
* File Name   : switch.js
* Created at  : 2019-07-12
* Updated at  : 2019-11-29
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

const jqlite             = require("@jeefo/jqlite");
const Events             = require("@jeefo/template/tokens/events");
const Attributes         = require("@jeefo/template/tokens/attributes");
const compile            = require("../compiler");
const Interpreter        = require("../interpreter");
const StructureComponent = require("../structure_component");

const prop_component = Symbol("interpreter");

const definition  = {
    binders      : [],
    Controller   : class Controller {},
    dependencies : [],
};

const find_case = (cases, value) => {
    return cases.find(node => {
        if (node.interpreter) {
            return node.interpreter.get_value() === value;
        }
        return node;
    });
};

const compile_component = async (node, component) => {
    const child    = new StructureComponent(null, definition, component);
    const elements = await compile([node.clone(true)], child);
    child.$element = jqlite(elements[0]);
    return child;
};

const placeholder_node = {
    id         : null,
    name       : "switch-placeholder",
    children   : [],
    class_list : [],
    content    : null,
    attrs      : new Attributes(),
    events     : new Events(),

    clone () { return placeholder_node; }
};

module.exports = {
    type     : "structure",
    selector : "switch",
    priority : 900,

    controller : class SwitchDirective {
        async on_init ($element, component) {
            const { node, expression } = component;

            const cases = [];
            node.children = node.children.map(child => {
                if (child.attrs.has("case")) {
                    const expr = child.attrs.get("case");
                    child.interpreter = new Interpreter(expr, component);

                    cases.push(child);
                    return placeholder_node;
                } else if (child.attrs.has("default")) {
                    cases.push(child);
                    return placeholder_node;
                } else {
                    return child;
                }
            });

            await compile([node], component);
            const child       = component.children[0];
            child.cases       = cases;
            child.interpreter = new Interpreter(expression, component);

            let i = 0;
            child.placeholders = child.children.filter(grand_child => {
                if (grand_child.name === "switch-placeholder") {
                    grand_child.node = cases[i++];
                    return true;
                }
            });

            $element.after(child.$element);
            $element.remove();
            component.$element = null;

            this[prop_component] = child;

            await this.on_digest();

            if (component.is_attached) {
                child.trigger_renderable();
            }
        }

        async on_digest () {
            const component    = this[prop_component];
            const value        = component.interpreter.get_value();
            const matched_node = find_case(component.cases, value);

            let is_changed;
            if (component.active_child) {
                if (component.matched_node !== matched_node) {
                    component.active_child.destroy();
                    component.matched_node = component.active_child = null;
                    is_changed = true;
                }
            } else if (matched_node) {
                is_changed = true;
            }

            if (is_changed) {
                const child = await compile_component(matched_node, component);
                const placeholder = component.placeholders.find(p => {
                    return p.node === matched_node;
                });

                const child_index = component.children.findIndex(child => {
                    return child === placeholder;
                });
                component.children.splice(child_index + 1, 0, child);

                placeholder.$element.after(child.$element);
                component.matched_node = matched_node;
                component.active_child = child;

                if (component.is_attached) {
                    child.trigger_renderable();
                }
            }
        }
    }
};
