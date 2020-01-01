/* -.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.
* File Name   : if.js
* Created at  : 2017-09-17
* Updated at  : 2019-12-03
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
const compile            = require("../compiler");
const Interpreter        = require("../interpreter");
const StructureComponent = require("../structure_component");

const prop_comment   = Symbol("$comment");
const prop_component = Symbol("interpreter");

const definition  = {
    binders      : [],
    Controller   : class Controller {},
    dependencies : [],
};

const compile_component = async (component, $comment) => {
    const child = new StructureComponent(null, definition, component);
    component.children.push(child);

    const elements = await compile([component.node.clone(true)], child, false);
    child.$element = jqlite(elements[0]);

    if (! child.is_destroyed) {
        $comment.after(child.$element);

        if (component.is_initialized) {
            await child.init();

            if (! child.is_destroyed && component.is_attached) {
                child.trigger_renderable();
            }
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
