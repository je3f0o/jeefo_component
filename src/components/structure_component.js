/* -.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.
* File Name   : structure_component.js
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

const jqlite       = require("@jeefo/jqlite");
const IComponent   = require("../interfaces/i_component");
const array_remove = require("@jeefo/utils/array/remove");

class StructureComponent extends IComponent {
    constructor (name, element, definition, parent) {
        super(name, definition);

        if (! this.Controller) {
            throw new Error("Controller is required in IStructure");
        }

        this.parent  = parent;
        this.element = element;

        parent.children.push(this);
    }

    async initialize () {
        // DEBUG_START
        if (this.is_initialized) {
            console.log("IStructure initialize called more than once");
        }
        // DEBUG_END
        this.controller = new this.Controller();
        await this.controller.on_init(jqlite(this.element), this);
        this.is_initialized = true;
    }

    async destroy () {
        // DEBUG_START
        if (this.is_destroyed) {
            console.log("IStructure destroy called more than once.");
        }
        // DEBUG_END
        for (const child of this.children) await child.destroy();
        array_remove(this.parent.children, this);
        this.is_destroyed = true;
    }

    async digest () {
        if (this.is_initialized) {
            if (typeof this.controller.on_digest === "function") {
                await this.controller.on_digest();
            }
            for (const child of this.children) await child.digest();
        }
    }

    trigger_render () {
        // DEBUG_START
        if (this.is_rendered) {
            console.log("IStructure render called more than once.");
        }
        // DEBUG_END
        for (const child of this.children) child.trigger_render();
        this.is_rendered = true;
    }
}

module.exports = StructureComponent;
