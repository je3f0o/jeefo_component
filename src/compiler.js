/* -.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.
* File Name   : compiler.js
* Created at  : 2019-06-23
* Updated at  : 2019-12-07
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
const definitions_table  = require("./definitions_table");
const StructureComponent = require("./structure_component");
const DirectiveComponent = require("./directive_component");

const { MARKER } = StructureComponent;

const single_tag_elements = ["img"];

// Higher order structure diretive like: forEach="item in items"
async function find_structure_directive (node, parent) {
    let name, definition;

    for (const [attr_name] of node.attrs) {
        const _definition = await definitions_table.get_directive(attr_name);
        if (_definition && _definition.is_structure) {
            if (definition) {
                if (_definition.priority > definition.priority) {
                    name       = attr_name;
                    definition = _definition;
                }
            } else {
                name       = attr_name;
                definition = _definition;
            }
        }
    }

    if (! definition) { return; }

    const component      = new StructureComponent(null, definition, parent);
    component.node       = node;
    component.expression = node.attrs.get(name);
    node.attrs.remove(name);

    return component;
}

const fake_definition = {
    binders          : [],
    dependencies     : [],
    Controller       : class Controller {},
    controller_name  : null,
    is_self_required : false,
};
async function find_component (node, parent) {
    let component = null;
    let definition = await definitions_table.get_component(node.name);
    if (definition) {
        component = new StructureComponent(node.name, definition, parent);
        if (definition.is_structure) {
            component.node = node;
            return component;
        }
        // TODO: think about better way, maybe return jeefo template or
        // something...
        if (definition.template_handler) {
            definition.template_handler(node);
        } else {
            node.children = definition.transclude(node.children);
        }
    }

    // Content binding
    if (node.children.length === 0 &&
        node.content && node.content.includes("${")) {
        if (! node.attrs.has("jf-bind")) {
            node.attrs.set("jf-bind", node.content);
        }
        node.content = null;
    }

    if (! component) {
        // Attribute binding or has directive
        for (const [attr_name, value] of node.attrs) {
            const def = await definitions_table.get_directive(attr_name);
            if (def || (value && value.includes("${"))) {
                component =  new StructureComponent(
                    null, fake_definition, parent
                );
                break;
            }
        }
    }

    if (node.events.length) {
        if (! component) {
            component = new StructureComponent(null, fake_definition, parent);
        }
        component.binding_events = node.events;
    }
    return component;
}

async function resolve_template (nodes, parent_component) {
    const results = [];

    for (const node of nodes) {
        // Structure directive is higher order
        let component = await find_structure_directive(node, parent_component);
        if (component) {
            parent_component.children.push(component);
            results.push(
                `<${node.name} ${ component.get_marker() }></${node.name}>`
            );
            continue;
        }

        let attrs = '';
        let content = '';

        component = await find_component(node, parent_component);
        if (component) {
            attrs += ` ${ component.get_marker() }`;
            parent_component.children.push(component);

            if (component.is_self_required) {
                results.push(
                    `<${node.name}${attrs}></${node.name}>`
                );
                continue;
            }
        }

        if (node.children.length) {
            const parent = component || parent_component;
            content = await resolve_template(node.children, parent);
        } else if (node.content) {
            content = node.content;
        }

        // Find directives
        if (node.id) {
            attrs += ` id="${ node.id }"`;
        }
        if (node.class_list.length) {
            attrs += ` class="${ node.class_list.join(' ') }"`;
        }
        for (const [name, value] of node.attrs) {
            attrs += ` ${ name }`;
            if (value) {
                attrs += `="${ value }"`;
            }

            const definition = await definitions_table.get_directive(name);
            if (definition) {
                const directive = new DirectiveComponent(name, definition);
                component.directives.push(directive);
            }
        }

        if (single_tag_elements.includes(node.name)) {
            results.push(`<${node.name}${attrs}>`);
        } else {
            results.push(`<${node.name}${attrs}>${content}</${node.name}>`);
        }
    }

    return results.join('');
}

function set_elements (components, $wrapper) {
    components.forEach(component => {
        if (! component.is_initialized) {
            component.$element = $wrapper.first(component.selector);
            component.$element.DOM_element.removeAttribute(MARKER);
        }
        set_elements(component.children, $wrapper);
    });
}

async function compile (nodes, parent_component, to_initialize = true) {
    const template  = await resolve_template(nodes, parent_component);
    const $wrapper  = jqlite("<div></div>");
    const $elements = jqlite(template);

    if ($elements.DOM_element) {
        $wrapper.append($elements);
    } else {
        for (let i = 0; i < $elements.length; i+= 1) {
            $wrapper.append($elements[i]);
        }
    }

    set_elements(parent_component.children, $wrapper);
    if (to_initialize) {
        for (const component of parent_component.children) {
            if (! component.is_initialized) {
                await component.init();
            }
        }
    }

    // Much faster way remove all child nodes
    // ref: https://stackoverflow.com/questions/3955229/remove-all-child-elements-of-a-dom-node-in-javascript?answertab=votes#tab-top
    const wrapper  = $wrapper.DOM_element;
    const elements = [];
    while (wrapper.firstChild) {
        elements.push(wrapper.firstChild);
        wrapper.removeChild(wrapper.firstChild);
    }
    return elements;
}

module.exports = compile;
