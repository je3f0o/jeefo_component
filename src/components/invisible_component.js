/* -.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.
* File Name   : invisible_component.js
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

const IComponent   = require("../interfaces/i_component");
const array_remove = require("@jeefo/utils/array/remove");

class InvisibleComponent extends IComponent {
    constructor (name, definition, parent = null) {
        super(name, definition);
        this.parent = parent;
        if (parent) parent.children.push(this);
    }

    async initialize () {
        if (this.is_initialized) {
            console.log("InvisibleComponent initialize called more than once");
        }
        for (const child of this.children) {
            if (! child.is_initialized && ! child.is_destroyed) {
                await child.initialize();
            }
            if (this.is_destroyed) return;
        }
        this.is_initialized = true;
    }

    async destroy () {
        if (this.is_destroyed) {
            console.log("InvisibleComponent destroy called more than once.");
        }
        for (const child of this.children) await child.destroy();
        array_remove(this.parent.children, this);
        this.is_destroyed = true;
    }

    async digest () {
        if (this.is_initialized) {
            for (const child of this.children) await child.digest();
        }
    }
}

module.exports = InvisibleComponent;
