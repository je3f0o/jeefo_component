/* -.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.
* File Name   : for_each_directive.js
* Created at  : 2017-07-25
* Updated at  : 2019-08-08
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

const definition = {
    binders          : [],
    dependencies     : [],
    Controller       : class Controller {},
    controller_name  : null,
    is_self_required : false,
};

function filter (components, values) {
    const occurrences = [];

    return components.filter(component => {
        const value = component.value;
        let i = occurrences.length, from_index = 0;
        while (i--) {
            if (occurrences[i].value === value) {
                from_index = occurrences[i].index + 1;
                break;
            }
        }

        const index = values.indexOf(value, from_index);
        if (index >= 0) {
            occurrences.push({ value, index });
            return true;
        }
    });
}

function create_new_child (value, index, component) {
    const new_child = new StructureComponent(null, definition, component);
    const { variable_name, index_name } = component;

    new_child.value                     = value;
    new_child.index                     = index;
    new_child.controller[index_name]    = index;
    new_child.controller[variable_name] = value;

    const elements = compile([component.node.clone(true)], new_child);
    new_child.$element = jqlite(elements[0]);

    return new_child;
}

function create_children (children, values, component) {
    const occurrences     = [];
    const children_values = children.map(child => child.value);

    return values.map((value, index) => {
        let i = occurrences.length, from_index = 0;
        while (i--) {
            if (occurrences[i].value === value) {
                from_index = occurrences[i].index + 1;
                break;
            }
        }

        const child_index = children_values.indexOf(value, from_index);
        if (child_index >= 0) {
            occurrences.push({ value, index : child_index });
            return children[child_index];
        }

        return create_new_child(value, index, component);
    });
}

module.exports = {
    type     : "structure",
	selector : "for-each",
	priority : 1000,
	controller : {
		on_init : function ($element, component) {
            this["(component)"] = component;

            try {
                const symbols  = parser.parse(component.expression);
                const streamer = parser.tokenizer.streamer;
                if (symbols.length > 1 ||
                    symbols[0].id !== "Expression statement") {
                    throw new SyntaxError("Invalid expression");
                }
                const expr   = symbols[0].expression;
                const script = streamer.substring_from_token(expr.right);
                component.interpreter   = new Interpreter(script, component);
                component.variable_name = expr.left.value;
                component.index_name    = "$index";

                const comment      = ` For each: ${ component.expression } `;
                const comment_node = jqlite(document.createComment(comment));
                this["(comment)"] = comment_node;
                $element.replace(comment_node);

                this.on_digest();
            } catch (e) {
                throw e;
            }
		},

		on_digest : function () {
            const component = this["(component)"];
            const { interpreter, index_name, is_attached } = component;
            const values = interpreter.get_value();
			if (! values) { return; }

            const filtered_children = filter(component.children, values);

            component.children.forEach(child => {
                if (! filtered_children.includes(child)) {
                    child.destroy();
                }
            });

            component.children = create_children(
                filtered_children, values, component
            );

            component.children.forEach((child, index) => {
                if (! child.is_attached || child.index !== index) {
                    if (index === 0) {
                        this["(comment)"].after(child.$element);
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
        /*
		create_component : function (index, value, stagger_index) {
			var self      = this,
				node      = self.node.clone(),
				component = self.$component.inherit();

			component.controller    = {};
			component.controller_as = self.name;
			component.controller[self.$variable] = value;

			compile_nodes([node], component).then(function (fragment) {
				component.$element = jqlite(fragment.firstChild);

				if (self.$component.children[index - 1]) {
					self.$component.children[index - 1].$element.after(fragment);
				} else {
					self.$comment.after(fragment);
				}
				self.$component.children.splice(index, 0, component);
                */

				/*
				if (self.$component.children.length) {
					var index = self.$component.children.length - 1;
					self.$component.children[index].$element.after(fragment);
				} else {
					self.$comment.after(fragment);
				}
				self.$component.children.push(component);
				*/

            /*
				$animator.enter(component.$element, stagger_index);

				self.$children.push(component);
			});
		},
        */
	}
};
