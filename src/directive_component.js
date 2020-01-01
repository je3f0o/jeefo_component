/* -.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.
* File Name   : directive_component.js
* Created at  : 2019-07-06
* Updated at  : 2019-12-29
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

const BaseComponent = require("./base_component");

class DirectiveComponent extends BaseComponent {
    constructor (name, definition) {
        super(name, definition);
    }

    async init (component) {
        if (this.is_initialized) { return; }

        const { controller } = this;
        if (! controller) { return; }

        this.bind(component.$element.DOM_element, component);
        component.$element.DOM_element.removeAttribute(this.name);

        if (controller.on_init) {
            super.set_dependencies(component);

            await controller.on_init(component.$element);
        }

        this.is_initialized = true;
    }

    async digest () {
        if (this.is_initialized) {
            await super.digest();
        }
    }

}

module.exports = DirectiveComponent;
