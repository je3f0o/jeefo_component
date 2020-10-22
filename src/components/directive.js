/* -.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.
* File Name   : directive.js
* Created at  : 2019-07-06
* Updated at  : 2020-06-12
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

const IRenderable = require("../interfaces/i_renderable");

class Directive extends IRenderable {
    constructor (name, $element, definition) {
        super(name, $element, definition, true);
    }

    async initialize (bounded_component) {
        // DEBUG_START
        if (this.is_initialized) {
            console.log("Component initialize called more than once");
        }
        // DEBUG_END

        const {$element} = this;
        const controller = this.Controller ? new this.Controller() : null;

        if (controller) {
            this.controller = controller;
            super.bind(bounded_component);
            $element.DOM_element.removeAttribute(this.name);

            if (controller.on_init) {
                super.set_dependencies(bounded_component);
                await controller.on_init($element);
            }
        }

        this.is_initialized = true;
    }
}

module.exports = Directive;
