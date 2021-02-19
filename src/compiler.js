/* -.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.
* File Name   : compiler.js
* Created at  : 2019-06-23
* Updated at  : 2021-02-20
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

const JeefoDOMParser      = require("@jeefo/jqlite/dom_parser");
const definitions_table   = require("./definitions_table");
const TextBinder          = require("./text_binder");
const Directive           = require("./components/directive");
const StructureComponent  = require("./components/structure_component");
const RenderableComponent = require("./components/renderable_component");

const BINDER    = /{{\s*\S+.*}}/m;
const TEXT_NODE = Node.TEXT_NODE || 3;

const new_binding_component = (element, parent) => {
    return new RenderableComponent("binding--component", element, {}, parent);
};

const is_element = n => n instanceof Element;

// Higher order structure diretive like: forEach="item in items"
async function find_structure (element, parent) {
    let name, definition;

    if (element.hasAttributes()) {
        for (const attr of element.attributes) {
            const def = await definitions_table.get_directive(attr.name);
            if (def && def.is_structure) {
                if (definition && def.priority < definition.priority) continue;
                name       = attr.name;
                definition = def;
            }
        }
    }

    if (definition) {
        const component = new StructureComponent(
            name, element, definition, parent
        );
        component.expression = element.getAttribute(name);
        element.removeAttribute(name);

        return component;
    }

    name       = element.tagName.toLowerCase();
    definition = await definitions_table.get_component(name);
    if (definition && definition.is_structure) {
        return new StructureComponent(name, element, definition, parent);
    }
}

async function find_component (element, parent) {
    const name    = element.tagName.toLowerCase();
    let component = null;

    let definition = await definitions_table.get_component(name);
    if (definition) {
        // TODO: think about better way, maybe return jeefo template or
        // something...
        if (definition.template_handler) {
            const new_element = definition.template_handler(element);
            if (is_element(new_element)) {
                if (element.parentNode) {
                    element.parentNode.replaceChild(new_element, element);
                }
                element = new_element;
            }
        } else {
            definition.transclude(element);
        }

        component = new RenderableComponent(name, element, definition, parent);
    }

    // Attribute binding or has directive
    if (! component && element.hasAttributes()) {
        for (const {name, value} of element.attributes) {
            const def = await definitions_table.get_directive(name);

            if (def || BINDER.test(value) || name.startsWith("on--")) {
                component = new_binding_component(element, parent);
                break;
            }
        }
    }

    // Text content binding
    let i = element.childNodes.length;
    while (i--) {
        const node = element.childNodes[i];
        if (node.nodeType !== TEXT_NODE || ! BINDER.test(node.textContent)) {
            continue;
        }
        if (element.hasAttribute("js-bind")) {
            throw new Error("Ambiguous binding");
        }
        if (! component) component = new_binding_component(element, parent);

        const binder = new TextBinder(node, component);
        component.text_binders.unshift(binder);
    }

    return component;
}

async function resolve_components (elements, parent) {
    const components = [];

    for (let elem of elements) {
        // Structure directive is higher order
        let component = await find_structure(elem, parent);
        if (component) {
            components.push(component);
            continue;
        }

        component = await find_component(elem, parent);
        if (component) {
            components.push(component);
            const {$element} = component;
            elem = $element.DOM_element;

            // Find directives
            if (elem.hasAttributes()) {
                let i = elem.attributes.length;
                while (i--) {
                    const {name, value} = elem.attributes[i];
                    const def = await definitions_table.get_directive(name);
                    if (def) {
                        const directive = new Directive(name, $element, def);
                        component.directives.push(directive);
                    } else if (name.startsWith("on--")) {
                        component.binding_events.push({
                            event_name : name.substring(4),
                            expression : value,
                        });
                        elem.removeAttribute(name);
                    }
                }
            }
        }

        const {children} = elem;
        const results = await resolve_components(children, component || parent);
        components.push(...results);
    }

    return components;
}

async function compile_from_elements (elements, parent, to_initialize = true) {
    const components = await resolve_components(elements, parent);

    if (to_initialize) {
        for (const component of components) {
            if (! component.is_initialized && ! component.is_destroyed) {
                await component.initialize();
            }
        }
    }

    return elements;
}

async function compile (template, parent_component, to_initialize = true) {
    const dom_parser = new JeefoDOMParser(template);

    await compile_from_elements(
        dom_parser.elements, parent_component, to_initialize
    );

    return dom_parser.detach();
}

compile.from_elements = compile_from_elements;

module.exports = compile;
