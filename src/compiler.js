/* -.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.
* File Name   : compiler.js
* Created at  : 2019-06-23
* Updated at  : 2019-07-21
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

const MARKER = StructureComponent.MARKER;

const single_tag_elements = ["img"];

function find_structure_directive (node, parent) {
    let name, definition;

    node.attrs.each(attr_name => {
        const _definition = definitions_table.get_directive(attr_name);
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
    });

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
function find_component (node, parent) {
    let component;
    let definition = definitions_table.get_component(node.name);
    if (definition) {
        component = new StructureComponent(node.name, definition, parent);
        // TODO: think about better way, maybe return jeefo template or
        // something...
        if (definition.template_handler) {
            definition.template_handler(node);
        } else {
            node.children = definition.transclude(node.children);
        }
    }

    if (node.children.length === 0 &&
        node.content && node.content.includes("${")) {
        if (! node.attrs.has("jf-bind")) {
            node.attrs.set("jf-bind", node.content);
        }
        node.content = null;
    }
    if (component) { return component; }

    const has_directive = node.attrs.find((attr_name, value) => {
        const definition = definitions_table.get_directive(attr_name);
        return definition !== undefined || (value && value.includes("${"));
    });

    if (has_directive) {
        return new StructureComponent(null, fake_definition, parent);
    }
}

function resolve_template (nodes, parent_component) {
    return nodes.map(node => {
        let component = find_structure_directive(node, parent_component);
        if (component) {
            parent_component.children.push(component);
            return `<placeholder ${ component.get_marker() }></placeholder>`;
        }

        let attrs = '', content = '';

        component = find_component(node, parent_component);
        if (component) {
            attrs += ` ${ component.get_marker() }`;
            parent_component.children.push(component);
        }

        if (node.children.length) {
            const parent = component || parent_component;
            content = resolve_template(node.children, parent);
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
        node.attrs.each((name, value) => {
            attrs += ` ${ name }`;
            if (value) {
                attrs += `="${ value }"`;
            }

            const definition = definitions_table.get_directive(name);
            if (definition) {
                const directive = new DirectiveComponent(name, definition);
                component.directives.push(directive);
            }
        });

        if (single_tag_elements.includes(node.name)) {
            return `<${node.name}${attrs}>`;
        }
        return `<${node.name}${attrs}>${content}</${node.name}>`;
    }).join('');
}

function set_elements (components, $wrapper) {
    components.forEach(component => {
        component.$element = $wrapper.first(component.selector);
        component.$element.DOM_element.removeAttribute(MARKER);
        set_elements(component.children, $wrapper);
    });
}

function initialize (components, $wrapper) {
    components.forEach(component => {
        if (! component.is_initialized) {
            component.init();
            component.is_initialized = true;
        }
        initialize(component.children, $wrapper);
    });
}

module.exports = function compile (nodes, parent_component) {
    const template = resolve_template(nodes, parent_component);
    const $wrapper = jqlite("<div></div>");
    const $element = jqlite(template);

    $wrapper.append($element);
    set_elements(parent_component.children, $wrapper);
    initialize(parent_component.children, $wrapper);

    // Much faster way remove all child nodes
    // ref: https://stackoverflow.com/questions/3955229/remove-all-child-elements-of-a-dom-node-in-javascript?answertab=votes#tab-top
    const wrapper  = $wrapper.DOM_element;
    const elements = [];
    while (wrapper.firstChild) {
        elements.push(wrapper.firstChild);
        wrapper.removeChild(wrapper.firstChild);
    }
    return elements;
};
