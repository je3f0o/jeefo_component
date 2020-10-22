/* -.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.
* File Name   : i_renderable.js
* Created at  : 2020-06-08
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

const Observer       = require("@jeefo/observer");
const IComponent     = require("./i_component");
const Interpreter    = require("../interpreter");
const ChangeDetector = require("../change_detector");

class IRenderable extends IComponent {
    constructor (name, $element, {
        binders      = [],
        dependencies = [],
        Controller, controller_name,
    }) {
        super(name, { Controller, controller_name }, IRenderable);

        this.binders          = binders;
        this.$element         = $element;
        this.observer         = null;
        this.dependencies     = dependencies;
        this.change_detectors = [];
    }

    set_dependencies (bounded_component) {
        const {controller, dependencies} = this;

        dependencies.forEach(d => {
            let dependency;

            LOOP:
            for (let p = bounded_component; p; p = p.parent) {
                if (p.name === d.name) {
                    dependency = p;
                    break;
                }
                for (let d2 of p.directives) {
                    if (d.name === d2.name) {
                        dependency = d2;
                        break LOOP;
                    }
                }
            }

            if (dependency) {
                controller[d.property] = dependency.controller;
            } else if (! d.is_optional) {
                throw new Error("Dependency not found");
            }
        });
    }

    bind (bounded_component) {
        const element = this.$element.DOM_element;

        this.binders.forEach(({ property, operator, attribute_name }) => {
            if (! element.hasAttribute(attribute_name)) return;
            const script = element.getAttribute(attribute_name).trim();
            element.removeAttribute(attribute_name);

            if (! script) return;

            let interpreter;
            switch (operator) {
                // Once
                case '!' : {
                    const interpreter = new Interpreter(script, bounded_component);
                    this.controller[property] = interpreter.get_value();
                    return;
                }
                // String interpreter
                case '@' : {
                    const str_script = `\`${ script }\``;
                    interpreter = new Interpreter(str_script, bounded_component);
                    break;
                }
                // 1 way bind
                case '<' : {
                    interpreter = new Interpreter(script, bounded_component);
                    break;
                }
                // 2 way bind
                case '=' : {
                    interpreter = new Interpreter(script, bounded_component, true);
                    break;
                }
                default:
                    throw new Error("Invalid bind operator");
            }

            const change_detector = new ChangeDetector(interpreter, value => {
                this.controller[property] = value;
            });
            if (interpreter.setter) {
                this.observe(property, new_value => {
                    interpreter.set_value(new_value);
                });
            }
            this.change_detectors.push(change_detector);
        });
    }

    observe (property, notify_handler) {
        if (! this.observer) this.observer = new Observer(this.controller);
        this.observer.on(property, notify_handler);
    }

    async digest () {
        this.change_detectors.forEach(change_detector => {
            change_detector.invoke();
        });
        const {controller} = this;
        if (controller && typeof controller.on_digest === "function") {
            await controller.on_digest();
        }
    }

    async destroy () {
        const {controller} = this;
        if (controller) {
            if (typeof controller.on_destroy === "function") {
                await controller.on_destroy();
            }
            Observer.destroy(controller);
        }
    }
}

module.exports = IRenderable;
