/* -.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.
* File Name   : structure_component.js
* Created at  : 2019-06-26
* Updated at  : 2019-09-13
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

const Observer       = require("@jeefo/observer");
const array_remove   = require("@jeefo/utils/array/remove");
const Interpreter    = require("./interpreter");
const BaseComponent  = require("./base_component");
const ChangeDetector = require("./change_detector");

const id_generator = (function* () {
    let id = -1;
    while (true) {
        id += 1;
        yield id;
    }
}());

const MARKER = "jeefo-component-id";

/*
const AsyncFunction = (async () => {}).constructor;
const is_async = fn => fn.constructor === AsyncFunction;
*/

class StructureComponent extends BaseComponent {
    static get MARKER () { return MARKER; }

    constructor (name, component_definition, parent = null) {
        super(name, component_definition);

        this.id               = id_generator.next().value;
        this.level            = parent ? parent.level + 1 : 0;
        this.parent           = parent;
        this.$element         = null;
        this.selector         = `[${MARKER}="${this.id}"]`;
        this.children         = [];
        this.directives       = [];
        this.is_attached      = false;
        this.is_self_required = component_definition.is_self_required;
    }

    async init () {
        if (this.is_initialized) { return; }

        let DOM_element;
        const { $element, controller, dependencies } = this;
        if ($element) {
            DOM_element = $element.DOM_element;
        }

        if (controller) {
            if (DOM_element) {
                this.bind(DOM_element, this);
            }

            if (controller.on_init) {
                dependencies.forEach(d => {
                    let dependency = this.find_parent(c => c.name === d.name);
                    controller[d.property] = dependency.controller;
                });
                const self = this.is_self_required ? this : undefined;

                await controller.on_init($element, self);
            }
        }

        for (let directive of this.directives) {
            await directive.init(this);
        }

        if (DOM_element) {
            const attrs = DOM_element.attributes;
            const generate_handler = name => {
                return value => DOM_element.setAttribute(name, value);
            };

            for (let i = 0; i < attrs.length; ++i) {
                const { name, value } = attrs[i];

                if (value.includes('${')) {
                    const script          = `\`${ attrs[i].value }\``;
                    const interpreter     = new Interpreter(script, this);
                    const change_detector = new ChangeDetector(
                        interpreter, generate_handler(name)
                    );
                    this.change_detectors.push(change_detector);
                }
            }
        }
    }

    destroy (is_nested) {
        const { $element, controller, parent, children } = this;

        let i = children.length;
        while (i--) { children[i].destroy(true); }

        if ($element) {
            $element.remove();
        }
        if (controller) {
            if (controller.on_destroy) {
                controller.on_destroy();
            }
            Observer.destroy(controller);
        }

        if (! is_nested) {
            array_remove(parent.children, this);
        }
    }

    async digest () {
        if (! this.is_initialized) { return; }

        await super.digest();
        for (let directive of this.directives) {
            await directive.digest();
        }
        for (let child of this.children) {
            await child.digest();
        }
    }

    trigger_renderable () {
        if (this.is_attached) { return; }

        if (this.$element) {
            this.$element.trigger("renderable");
        }
        this.is_attached = true;

        this.children.forEach(child => child.trigger_renderable());
    }

    find_parent (callback) {
        for (let parent = this.parent; parent; parent = parent.parent) {
            if (callback(parent)) { return parent; }
        }
        return null;
    }
}

module.exports = StructureComponent;
