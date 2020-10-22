/* -.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.
* File Name   : conditional_component.js
* Created at  : 2020-06-09
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
const JeefoDOMParser = require("@jeefo/jqlite/dom_parser");
const array_remove   = require("@jeefo/utils/array/remove");
const compile        = require("../compiler");
const IComponent     = require("../interfaces/i_component");

class ConditionalComponent extends IComponent {
    constructor (name, element, parent = null, definition = {}) {
        super(name, definition);
        this.parent = parent;

        return new Promise(async resolve => {
            const dom_parser = new JeefoDOMParser('');
            const wrapper = dom_parser.document.body;

            const clone = element.cloneNode(true);
            wrapper.appendChild(clone);
            await compile.from_elements([clone], this, false);
            this.$element = jqlite(wrapper.removeChild(wrapper.firstChild));

            if (parent) {
                parent.children.push(this);
            }
            resolve(this);
        });
    }

    async initialize () {
        // DEBUG_START
        if (this.is_initialized) {
            console.log("ConditionalComponent initialize called more than once");
        }
        // DEBUG_END
        for (const child of this.children) {
            await child.initialize();
        }
        this.is_initialized = true;
    }

    async destroy () {
        // DEBUG_START
        if (this.is_destroyed) {
            console.log("ConditionalComponent destroy called more than once.");
        }
        // DEBUG_END
        for (const child of this.children) {
            await child.destroy();
        }
        if (this.$element) {
            this.$element.remove();
        }
        if (this.parent) {
            array_remove(this.parent.children, this);
        }
        this.is_destroyed = true;
    }

    async digest () {
        if (this.is_initialized) {
            for (const child of this.children) {
                await child.digest();
            }
        }
    }

    trigger_initialized () {
        // DEBUG_START
        if (! this.is_initialized) {
            console.log("ConditionalComponent render called more than once.");
        }
        // DEBUG_END
        for (const child of this.children) {
            child.trigger_initialized();
        }
        this.is_rendered = true;
    }

    trigger_render () {
        // DEBUG_START
        if (! this.is_initialized) {
            console.log("ConditionalComponent render called more than once.");
        }
        // DEBUG_END
        for (const child of this.children) {
            child.trigger_render();
        }
        this.is_rendered = true;
    }
}

module.exports = ConditionalComponent;
