/* -.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.
* File Name   : switch.js
* Created at  : 2019-07-12
* Updated at  : 2020-01-02
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
const NodeElement        = require("@jeefo/template/node_element");
const compile            = require("../compiler");
const Interpreter        = require("../interpreter");
const StructureComponent = require("../structure_component");

const prop_component = Symbol("component");

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
    const elements = await compile([node.clone(true)], child, false);
    child.$element = jqlite(elements[0]);
    return child;
};

const placeholder_node = new NodeElement(null, {
    name       : "switch-placeholder",
    class_list : [],
    content    : null,
    attrs      : new Attributes(),
    events     : new Events(),
});

module.exports = {
    type     : "structure",
    selector : "switch",
    priority : 900,

    controller : class SwitchDirective {
        async on_init ($element, component) {
            const { node, expression } = component;

            const cases = [];
            const placeholder_clone = placeholder_node.clone();
            placeholder_clone.attrs.set("switch-id", component.id);
            node.children = node.children.map(child => {
                if (child.attrs.has("case")) {
                    const expr = child.attrs.get("case");
                    child.interpreter = new Interpreter(expr, component);

                    cases.push(child);
                    return placeholder_clone;
                } else if (child.attrs.has("default")) {
                    cases.push(child);
                    return placeholder_clone;
                } else {
                    return child;
                }
            });

            component.cases        = cases;
            component.interpreter  = new Interpreter(expression, component);
            component.placeholders = [];

            const elements = await compile([node], component);
            $element.replace(elements[0]);
            if (component.children[0].$element.DOM_element === elements[0]) {
                component.$element = null;
            }

            component.placeholders.forEach((p, i) => {
                p.node = cases[i];
            });

            this[prop_component] = component;

            await this.on_digest();
        }

        async on_digest () {
            const component  = this[prop_component];
            const value      = component.interpreter.get_value();
            let matched_node = find_case(component.cases, value);

            // Cleaning old switch-case
            if (component.matched_node) {
                if (component.matched_node === matched_node) {
                    matched_node = null;
                } else {
                    if (component.active_child) {
                        component.active_child.destroy();
                    }
                    component.matched_node = component.active_child = null;
                }
            }

            if (matched_node) {
                component.matched_node = matched_node;

                const child = await compile_component(matched_node, component);
                if (! child.is_destroyed) {
                    const placeholder = component.placeholders.find(p => {
                        return p.node === matched_node;
                    });
                    const child_index = component.children.findIndex(child => {
                        return child === placeholder;
                    });
                    component.children.splice(child_index + 1, 0, child);
                    placeholder.$element.after(child.$element);
                    component.active_child = child;

                    if (component.is_initialized) {
                        await child.init();

                        if (! child.is_destroyed && component.is_attached) {
                            child.trigger_renderable();
                        }
                    }
                }
            }
        }
    }
};
