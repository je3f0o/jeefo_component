/* -.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.
* File Name   : base_component.js
* Created at  : 2019-07-06
* Updated at  : 2019-10-16
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
const Interface      = require("@jeefo/utils/class/interface");
const Interpreter    = require("./interpreter");
const ChangeDetector = require("./change_detector");

class IBaseComponent extends Interface {
    constructor (name, definition) {
        super(IBaseComponent);

        this.name           = name;
        this.is_initialized = false;

        if (definition.Controller) {
            this.controller = new definition.Controller();
        } else {
            this.controller = null;
        }

        this.binders          = definition.binders;
        this.observer         = null;
        this.dependencies     = definition.dependencies;
        this.controller_name  = definition.controller_name;
        this.change_detectors = [];
    }

    get_marker () {
        return `jeefo-component-id="${this.id}"`;
    }

    init () {
        throw new Error("Derived class must be implement `init()` method.");
    }

    bind (DOM_element, component) {
        this.binders.forEach(({ property, operator, attribute_name }) => {
            if (! DOM_element.hasAttribute(attribute_name)) { return; }
            const script = DOM_element.getAttribute(attribute_name).trim();
            DOM_element.removeAttribute(attribute_name);

            if (! script) { return; }

            let interpreter;
            switch (operator) {
                // Once
                case '!' : {
                    const interpreter = new Interpreter(script, component);
                    this.controller[property] = interpreter.get_value();
                    return;
                }
                // String interpreter
                case '@' : {
                    const str_script = `\`${ script }\``;
                    interpreter = new Interpreter(str_script, component);
                    break;
                }
                // 1 way bind
                case '<' : {
                    interpreter = new Interpreter(script, component);
                    break;
                }
                // 2 way bind
                case '=' : {
                    interpreter = new Interpreter(script, component, true);
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
                    interpreter.set_value.bind(new_value);
                });
            }
            this.change_detectors.push(change_detector);
        });
    }

    observe (property, notify_handler) {
        if (! this.observer) {
            this.observer = new Observer(this.controller);
        }
        this.observer.on(property, notify_handler);
    }

    async digest () {
        this.change_detectors.forEach(change_detector => {
            change_detector.invoke();
        });
        if (this.controller && this.controller.on_digest) {
            await this.controller.on_digest();
        }
    }
}

module.exports = IBaseComponent;
