/* -.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.
* File Name   : directive_component.js
* Created at  : 2019-07-06
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

const BaseComponent = require("./base_component");

class DirectiveComponent extends BaseComponent {
    constructor (name, definition) {
        super(name, definition);
    }

    async init (component) {
        if (this.is_initialized) { return; }

        const { controller, dependencies } = this;
        if (! controller) { return; }

        this.bind(component.$element.DOM_element, component);
        component.$element.DOM_element.removeAttribute(this.name);

        if (controller.on_init) {
            dependencies.forEach(d => {
                let dependency = this.find_parent(c => c.name === d.name);
                controller[d.property] = dependency.controller;
            });

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