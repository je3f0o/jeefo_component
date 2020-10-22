/* -.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.
* File Name   : renderable_component.js
* Created at  : 2019-06-26
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

const jqlite         = require("@jeefo/jqlite");
const debounce       = require("@jeefo/utils/debounce");
const array_remove   = require("@jeefo/utils/array/remove");
const IRenderable    = require("../interfaces/i_renderable");
const Interpreter    = require("../interpreter");
const ChangeDetector = require("../change_detector");

const {slice} = [];
class EventBinder {
    constructor (instance, event, $element) {
        this.$this    = instance;
        this.$event   = event;
        this.$element = $element;
    }
}

const DEBOUNCE_EVENT     = /^(.+)\-debounce\-(\d+)$/;
const JEEFO_BINDER_REGEX = /{{\s*\S+.*}}/m;

/*
const event_binder_template = `
ANON_FN
return anonymous.call(this_arg, $ctrls);
`.trim().split('\n').map(line => line.trim()).join('\n');
*/

const temp_event_binder = {
    $this    : null,
    $event   : null,
    $element : null,
};

class RenderableComponent extends IRenderable {
    constructor (name, element, definition, parent) {
        super(name, jqlite(element), definition);

        this.parent         = parent;
        this.event_binder   = null;
        this.binding_events = [];

        parent.children.push(this);
    }

    async initialize () {
        // DEBUG_START
        if (this.is_initialized) {
            console.log("Component initialize called more than once");
        }
        // DEBUG_END

        const {$element} = this;
        const controller = this.Controller ? new this.Controller() : null;

        $element.on("digest", () => {
            console.warn("Depricated, please fix it.");
            this.digest();
        });
        $element.digest  = () => this.digest();
        $element.destroy = () => this.destroy();

        const {DOM_element: element} = $element;

        // Step 1: bind events
        if (this.binding_events.length) {
            this.bind_events();
        }

        // Step 2: initialize itself
        if (controller) {
            this.controller = controller;
            super.bind(this.parent);

            if (controller.on_init) {
                super.set_dependencies(this.parent);
                await controller.on_init($element);

                if (this.is_destroyed) return;
            }
        }

        // Step 3: bind attributes
        const generate_handler = name => value => {
            element.setAttribute(name, value);
        };
        const attrs = slice.call(element.attributes);

        LOOP:
        for (let i = attrs.length - 1; i >= 0; i -= 1) {
            const {name, value} = attrs[i];
            for (const dir of this.directives) {
                if (name === dir.name) continue LOOP;
            }

            if (name.endsWith("--init")) {
                const interpreter = new Interpreter(`\`${value}\``, this);
                element.removeAttribute(name);
                element.setAttribute(name.slice(0, -6), interpreter.get_value());
            } else if (JEEFO_BINDER_REGEX.test(value)) {
                const script          = `\`${value}\``;
                const interpreter     = new Interpreter(script, this);
                const change_detector = new ChangeDetector(
                    interpreter, generate_handler(name)
                );
                this.change_detectors.push(change_detector);
            }
        }

        // Step 4: initialize directives
        for (const directive of this.directives) {
            await directive.initialize(this);
            if (this.is_destroyed) return;
        }

        // Step 5: initialize child components
        for (const child of this.children) {
            if (! child.is_destroyed) await child.initialize();
            if (this.is_destroyed) return;
        }

        this.$element.trigger("initialized");
        this.is_initialized = true;
    }

    async destroy () {
        // DEBUG_START
        if (this.is_destroyed) {
            console.log("Component destroy called more than once.");
        }
        // DEBUG_END
        const { $element, parent, children } = this;

        array_remove(parent.children, this);
        this.is_destroyed = true;

        for (const directive of this.directives) {
            await directive.destroy();
        }
        await super.destroy();
        $element.remove();

        let i = children.length;
        while (i--) {
            children[i].destroy();
        }
    }

    async digest () {
        if (this.is_initialized) {
            await super.digest();
            for (const directive of this.directives) {
                await directive.digest();
            }
            for (const child of this.children) {
                await child.digest();
            }
        }
    }

    trigger_render () {
        //super.trigger_render();
        // DEBUG_START
        if (this.is_rendered) {
            console.log("IRenderable render called more than once");
        }
        // DEBUG_END
        this.$element.trigger("render");

        this.children.forEach(child => child.trigger_render());
        this.$element.trigger("rendered");
        this.is_rendered = true;
    }

    bind_events () {
        const self       = this;
        const {$element} = self;

        const event_handler_factory = expression => {
            // Event binder template cannot be binded component itself.
            const {parent} = self;

            parent.event_binder = temp_event_binder;
            const interpreter = new Interpreter(expression, parent);

            return function (event) {
                try {
                    const binder = new EventBinder(this, event, $element);
                    interpreter.ctrls.event_binder = binder;
                    interpreter.getter(interpreter.ctrls);
                    /*
                    const script = event_binder_template.replace("ANON_FN", () => {
                        return interpreter.getter.toString();
                    });
                    // jshint evil:true
                    interpreter.getter = new Function("this_arg", "$ctrls", script);
                    // jshint evil:false

                    interpreter.getter(self, interpreter.ctrls);
                    */
                } catch (e) {
                    console.error(e);
                }
            };
        };

        for (let {event_name, expression} of this.binding_events) {
            const matches = event_name.match(DEBOUNCE_EVENT);
            let event_handler = event_handler_factory(expression);
            if (matches) {
                event_name    = matches[1];
                event_handler = debounce(event_handler, +(matches[2]));
            }
            this.$element.on(event_name, event_handler);
        }
    }
}

module.exports = RenderableComponent;
