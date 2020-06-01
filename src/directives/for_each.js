/* -.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.
* File Name   : for_each.js
* Created at  : 2017-07-25
* Updated at  : 2020-06-01
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
const parser             = require("../input/parser");
const compile            = require("../compiler");
const Interpreter        = require("../interpreter");
const StructureComponent = require("../structure_component");

const comp_prop   = Symbol("component");
const values_prop = Symbol("values");

const definition  = {
    binders          : [],
    dependencies     : [],
    Controller       : class ForEachDirectiveController {},
    controller_name  : null,
    is_self_required : false,
};

async function create_new_child (value, index, component) {
    const { variable_name, index_name } = component;
    const new_child = new StructureComponent(null, definition, component);

    new_child.index = new_child.controller[index_name]    = index;
    new_child.value = new_child.controller[variable_name] = value;

    const elements = await compile([component.node.clone(true)], new_child);
    new_child.$element = jqlite(elements[0]);

    return new_child;
}

async function sync_children (instance) {
    const values       = instance[values_prop];
    const component    = instance[comp_prop];
    const { children } = component;

    const is_synced = () => {
        return (
            values.length === children.length &&
            values.every((v, i) => v === children[i].value)
        );
    };

    let i = children.length;
    while (i--) {
        if (! values.includes(children[i].value)) {
            await children[i].destroy();
        }
    }

    const destroy_from = from => {
        for (let i = children.length - 1; i >= from; i -= 1) {
            const index = values.indexOf(children[i].value, from);
            if (index === -1) {
                children[i].destroy();
            }
        }
    };

    destroy_from(0);

    let is_canceled = false, cancel_resolver;
    component.cancel_syncing = () => {
        is_canceled = true;
        return new Promise((resolve) => cancel_resolver = resolve);
    };
    component.is_syncing = true;
    LOOP:
    while (! is_synced()) {
        for (let [i, value] of values.entries()) {
            if (i < children.length) {
                if (children[i].value === value) { continue; }

                for (let j = i + 1; j < children.length; j += 1) {
                    if (children[j] === value) {
                        children.splice(i, 0, children.splice(j, 1)[0]);
                        continue LOOP;
                    }
                }
            }

            const new_child = await create_new_child(value, i, component);
            children.splice(i, 0, new_child);
            if (is_canceled) { break; }
            destroy_from(i + 1);
            continue LOOP;
        }
    }
    component.is_syncing = false;
    if (is_canceled) {
        component.cancel_syncing = null;
        cancel_resolver();
    }
}

module.exports = {
    type     : "structure",
    selector : "for-each",
    priority : 1000,
    controller : {
        async on_init ($element, component) {
            this[comp_prop] = component;

            try {
                const symbols  = parser.parse(component.expression);
                const streamer = parser.tokenizer.streamer;
                if (symbols.length > 1 ||
                    symbols[0].id !== "Expression statement") {
                    throw new SyntaxError("Invalid expression");
                }
                const expr   = symbols[0].expression;
                const script = streamer.substring_from_token(expr.right);

                component.interpreter = new Interpreter(script, component);
                if (expr.left.id !== "Primary expression") {
                    throw new Error("Invalid left hand side expression");
                }
                switch (expr.left.expression.id) {
                    case "Identifier reference" :
                        component.variable_name = expr.left.expression.value;
                        break;
                    default:
                        throw new Error("Invalid left hand side expression");
                }
                component.index_name = "$index";

                const comment = ` For each: ${ component.expression } `;
                $element.replace(document.createComment(comment));

                await this.on_digest();
            } catch (e) {
                throw e;
            }
        },

        async on_digest () {
            const component = this[comp_prop];
            const {
                $element : $comment,
                children,
                index_name,
                interpreter,
                is_attached,
            } = component;
            this[values_prop] = interpreter.get_value();

            if (component.is_syncing) {
                // TODO: Maybe i need to make a waiting list for make sure
                // multiple digest methods not collide after canceled...
                await component.cancel_syncing();
            }
            await sync_children(this);

            if ($comment.DOM_element.parentNode === null) {
                const frag = document.createDocumentFragment();
                frag.appendChild($comment.DOM_element);
            }

            children.forEach((child, index) => {
                if (! child.is_attached || child.index !== index) {
                    if (index === 0) {
                        $comment.after(child.$element);
                    } else {
                        const prev = component.children[index - 1];
                        prev.$element.after(child.$element);
                    }

                    child.index                  = index;
                    child.controller[index_name] = index;

                    if (is_attached && ! child.is_attached) {
                        child.trigger_renderable();
                    }
                }
            });
        },
    }
};
