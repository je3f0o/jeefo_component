/* -.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.
* File Name   : structure_component.js
* Created at  : 2019-06-26
* Updated at  : 2019-10-11
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

const event_binder_template = `
ANON_FN
return anonymous.call(this_arg, $ctrls);
`.trim().split('\n').map(line => line.trim()).join('\n');

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
        this.binding_events   = null;
        this.is_self_required = component_definition.is_self_required;
    }

    async init () {
        if (this.is_initialized) { return; }

        const { $element, controller, dependencies } = this;
        let DOM_element;
        if ($element) {
            ({ DOM_element } = $element);
            DOM_element.addEventListener("digest",  () => this.digest());
            DOM_element.addEventListener("destroy", () => this.destroy());
        }

        // Step 1: initialize itself
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

        // Step 2: bind attributes
        if (DOM_element) {
            const attrs = DOM_element.attributes;
            const generate_handler = name => {
                return value => DOM_element.setAttribute(name, value);
            };

            LOOP:
            for (let i = 0; i < attrs.length; ++i) {
                const { name, value } = attrs[i];

                for (const dir of this.directives) {
                    if (dir.name === name) { continue LOOP; }
                }

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

        // Step 3: bind events
        if (this.binding_events) {
            this.bind_events();
        }

        // Step 4: initialize directives
        for (let directive of this.directives) {
            await directive.init(this);
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

    bind_events () {
        const { $element, controller } = this;
        controller.$event   = null;
        controller.$element = $element;

        const _bind_events = (event_name, interpreter) => {
            const script = event_binder_template.replace("ANON_FN", () => {
                return interpreter.getter.toString();
            });
            // jshint evil:true
            interpreter.getter = new Function(
                "this_arg", "$event", "$ctrls", script
            );
            // jshint evil:false
            this.$element.on(event_name, function (event) { // jshint ignore:line
                controller.$event = event;
                return interpreter.getter(this, event, interpreter.ctrls);
            });
        };

        for (const [event_name, expression] of this.binding_events) {
            try {
                const interpreter = new Interpreter(expression, this);
                _bind_events(event_name, interpreter);
            } catch (e) {
                console.error(e);
                debugger
            }
        }
    }
}

module.exports = StructureComponent;
