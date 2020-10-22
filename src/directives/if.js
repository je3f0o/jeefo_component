/* -.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.
* File Name   : if.js
* Created at  : 2017-09-17
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
const Interpreter          = require("../interpreter");
const ConditionalComponent = require("../components/conditional_component");

const prop_comment   = Symbol("$comment");
const prop_component = Symbol("interpreter");

const compile_component = async (component, $comment) => {
    const wrapper = await new ConditionalComponent(
        "if--rendered", component.element, component
    );

    if (! wrapper.is_destroyed) {
        await wrapper.initialize();

        if (! wrapper.is_destroyed) {
            $comment.after(wrapper.$element);
            if (component.is_rendered) wrapper.trigger_render();
        }
    }
};

module.exports = {
    type     : "structure",
    selector : "if",
    priority : 900,

    controller : class IfDirective {
        on_init ($element, component) {
            const { expression } = component;
            const comment = document.createComment(` If: ${ expression } `);

            component.interpreter = new Interpreter(expression, component);
            component.element.removeAttribute("if");

            this[prop_comment]   = jqlite(comment);
            this[prop_component] = component;

            $element.before(this[prop_comment]);
            $element.remove();

            return this.on_digest();
        }

        async on_digest () {
            const $comment  = this[prop_comment];
            const component = this[prop_component];

            const value = component.interpreter.get_value();

            if (value) {
                if (! component.children.length) {
                    await compile_component(component, $comment);
                }
            } else if (component.children.length) {
                await component.children[0].destroy();
            }
        }
    }
};
