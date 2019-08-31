/* -.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.
* File Name   : attribute_binder.js
* Created at  : 2019-07-10
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

const Interpreter    = require("./interpreter");
const ChangeDetector = require("./change_detector");

class AttributeBinder {
    constructor (component) {
        this.component        = component;
        this.is_initialized   = false;
        this.attribute_names  = [];
        this.change_detectors = [];
    }

    init () {
        if (this.is_initialized) { return; }

        const { component }   = this;
        const { DOM_element } = component.$element;

        this.attribute_names.forEach(attribute_name => {
            const script = DOM_element.getAttribute(attribute_name);

            const interpreter = new Interpreter(`\`${ script }\``, component);
            const value = interpreter.get_value();
            DOM_element.setAttribute(attribute_name, value);

            this.change_detectors.push(new ChangeDetector(
                attribute_name, value, interpreter
            ));
        });

        this.is_initialized = true;
    }

    digest () {
        this.change_detectors.forEach(change_detector => {
            if (change_detector.is_changed()) {
                const { property, value } = change_detector;
                this.DOM_element.setAttribute(property, value);
            }
        });
    }

    bind (attribute_name) {
        this.attribute_names.push(attribute_name);
    }
}

module.exports = AttributeBinder;
