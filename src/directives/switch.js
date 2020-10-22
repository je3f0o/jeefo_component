/* -.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.
* File Name   : switch.js
* Created at  : 2019-07-12
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

const jqlite               = require("@jeefo/jqlite");
const compile              = require("../compiler");
const is_element           = require("../is_element");
const Interpreter          = require("../interpreter");
const ConditionalComponent = require("../components/conditional_component");

const prop_component = Symbol("component");

const compile_child = async (component, {element, $placeholder}) => {
    const wrapper = await new ConditionalComponent(
        "switch-wrapper", element, component
    );

    if (! wrapper.is_destroyed) {
        await wrapper.initialize();
        if (! wrapper.is_destroyed) {
            $placeholder.after(wrapper.$element);
            if (component.is_rendered) { wrapper.trigger_render(); }
        }
    }

    return wrapper;
};

const compile_self = async instance => {
    await compile.from_elements([instance.element], instance);
};

module.exports = {
    type     : "structure",
    selector : "switch",
    priority : 900,

    controller : class SwitchDirective {
        async on_init ($element, component) {
            const {element, expression} = component;
            element.removeAttribute("switch");

            component.cases       = [];
            component.interpreter = new Interpreter(expression, component);

            let i = element.childNodes.length;
            while (i--) {
                const node = element.childNodes[i];
                if (! is_element(node)) continue;

                if (node.hasAttribute("case")) {
                    const expr       = node.getAttribute("case");
                    const comment    = `switch-case: ${expr}`;
                    const comment_el = document.createComment(comment);
                    component.cases.push({
                        element      : node,
                        interpreter  : new Interpreter(expr, component),
                        $placeholder : jqlite(comment_el),
                    });
                    node.removeAttribute("case");
                    element.replaceChild(comment_el, node);
                } else if (node.hasAttribute("default")) {
                    if (component.default_case) {
                        throw new Error("Multiple default case found in switch.");
                    }
                    const comment = document.createComment("switch-default");
                    component.default_case = {
                        element      : node,
                        $placeholder : jqlite(comment),
                    };
                    node.removeAttribute("default");
                    element.replaceChild(comment, node);
                }
            }

            component.is_initialized = true;
            await compile_self(component);

            this[prop_component] = component;
            await this.on_digest();
        }

        async on_digest () {
            const component = this[prop_component];
            const value     = component.interpreter.get_value();

            let matched_case = component.cases.find(node => {
                return node.interpreter.get_value() === value;
            }) || component.default_case;

            if (component.matched_case !== matched_case) {
                // Cleaning old switch-case
                if (component.instance) {
                    component.instance.destroy();
                    component.instance = null;
                }

                component.matched_case = matched_case;
                component.instance = await compile_child(
                    component, matched_case
                );
            }
        }
    }
};
