/* -.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.
* File Name   : for_each.js
* Created at  : 2017-07-25
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

// jshint curly: false

/* maybe useful some time
const filter_children = async from => {
    const seen              = [];
    const filtered_children = [];

    NEXT:
    for (let i = children.length - 1; i >= from; i -= 1) {
        const child = children[i];

        let j = values.length;
        while (j--) {
            if (values[j] === child.value && ! seen.includes(j)) {
                seen.push(j);
                continue NEXT;
            }
        }

        filtered_children.push(child);
        children.splice(i, 1);
    }

    if (filtered_children.length) {
        return Promise.all(filtered_children.map(c => c.destroy()));
    }
};
await filter_children(0);
*/

// ignore:end

const parser               = require("../input/parser");
const Interpreter          = require("../interpreter");
const ConditionalComponent = require("../components/conditional_component");

const comp_prop   = Symbol("component");
const values_prop = Symbol("values");

class ForEachElement {}

const CODE_CANCEL = Math.random();

async function create_new_child (value, index, component) {
    const {element, variable_name, index_name} = component;
    const wrapper = await new ConditionalComponent("foreach--wrapper", element);

    wrapper.controller = new ForEachElement();
    wrapper.index = index;
    wrapper.value = value;
    Object.defineProperty(wrapper.controller, index_name, {
        get: () => wrapper.index,
    });
    Object.defineProperty(wrapper.controller, variable_name, {
        get: () => wrapper.value,
    });

    return wrapper;
}

const is_synced = (values, children) => {
    if (values.length === children.length) {
        let i = values.length;
        while (i--) {
            if (values[i] !== children[i].value) return false;
        }
        return true;
    }
};

async function sync_children (instance) {
    const values     = instance[values_prop];
    const component  = instance[comp_prop];
    const {children} = component;

    let is_dirty = false;

    let is_canceled = false, cancel_resolver;
    component.cancel_syncing = () => {
        is_canceled = true;
        return new Promise((resolve) => cancel_resolver = resolve);
    };

    component.is_syncing = true;
    OUTER_LOOP:
    while (! is_synced(values, children) && ! is_canceled) {
        is_dirty = true;

        LOOP:
        for (let i = 0; i < values.length; i+= 1) {
            const value = values[i];

            if (i < children.length) {
                if (children[i].value === value) continue;

                for (let j = i + 1; j < children.length; j += 1) {
                    if (children[j].value === value) {
                        children.splice(i, 0, children.splice(j, 1)[0]);
                        continue LOOP;
                    }
                }
            }

            const new_child = await create_new_child(value, i, component);
            if (is_canceled) break OUTER_LOOP;
            children.splice(i, 0, new_child);
            new_child.parent = component;
        }

        if (children.length > values.length) {
            const dead_children = children.splice(values.length);
            await Promise.all(dead_children.map(c => c.destroy()));
            if (is_canceled) break OUTER_LOOP;
        }

        if (component.is_initialized) {
            for (const child of children) {
                if (! child.is_initialized) await child.initialize();
                if (is_canceled) break OUTER_LOOP;
            }
        }
    }
    component.is_syncing = false;

    if (is_canceled) {
        cancel_resolver();
        throw CODE_CANCEL;
    }

    return is_dirty;
}

module.exports = {
    type     : "structure",
    selector : "for-each",
    priority : 1000,
    controller : {
        async on_init ($element, component) {
            this[comp_prop] = component;
            component.element.removeAttribute("for-each");

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
                switch (expr.left.id) {
                    case "Identifier reference" :
                        const {identifier: {identifier_name: id}} = expr.left;
                        component.variable_name = id.value;
                        break;
                    default:
                        throw new Error("Invalid left hand side expression");
                }
                component.index_name = "$index";

                const comment = ` For each: ${component.expression} `;
                $element.replace(document.createComment(comment));
                component.$placeholder = $element;

                component.is_initialized = true;
                await this.on_digest();
            } catch (e) {
                // WTF ???
                throw e;
            }
        },

        async on_digest () {
            const component = this[comp_prop];
            const {
                children,
                interpreter,
                $placeholder,
            } = component;
            this[values_prop] = interpreter.get_value();

            if (component.is_syncing) {
                // TODO: Maybe i need to make a waiting list queue for make sure
                // multiple digest methods not collide after canceled...
                await component.cancel_syncing();
            }

            try {
                await sync_children(this);

                const move = (index, child) => {
                    const {index: old_index} = child;

                    const a = children[index].$element.DOM_element;
                    const b = children[old_index].$element.DOM_element;

                    const temp = new Comment("temp");
                    a.parentNode.insertBefore(temp, a);
                    b.parentNode.insertBefore(a, b);
                    temp.parentNode.insertBefore(b, temp);
                    temp.parentNode.removeChild(temp);

                    child.index               = index;
                    children[old_index].index = old_index;
                };

                const insert = (index, child) => {
                    if (index === 0) {
                        $placeholder.after(child.$element);
                    } else {
                        children[index - 1].$element.after(child.$element);
                    }
                };

                for (const [index, child] of children.entries()) {
                    if (! child.is_attached) {
                        insert(index, child);
                        child.is_attached = true;
                    } else if (child.index !== index) {
                        const data = {
                            old_index : child.index,
                            old_value : child.value,
                            new_index : index,
                            new_value : null,
                        };
                        move(index, child);
                        if (child.is_rendered) {
                            child.$element.trigger("foreach:move", {data});
                        }
                    }
                }

                if (component.is_rendered)
                    for (const child of children)
                        if (! child.is_rendered) child.trigger_render();

            } catch (e) {
                if (e !== CODE_CANCEL) throw e;
            }
        },
    }
};
