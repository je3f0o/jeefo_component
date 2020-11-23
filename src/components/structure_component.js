/* -.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.
* File Name   : structure_component.js
* Created at  : 2019-06-26
* Updated at  : 2020-11-23
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
const Observer     = require("@jeefo/observer");
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
            console.log("StructureComponent initialize called more than once");
        }
        // DEBUG_END
        this.controller = new this.Controller();
        await this.controller.on_init(jqlite(this.element), this);
        this.is_initialized = true;
    }

    async destroy () {
        // DEBUG_START
        if (this.is_destroyed) {
            console.log("StructureComponent destroy called more than once.");
        }
        // DEBUG_END
        const {controller, parent, children} = this;
        array_remove(parent.children, this);
        this.is_destroyed = true;

        for (const directive of this.directives) directive.destroy();
        if (typeof controller.on_destroy === "function") {
            await controller.on_destroy();
        }
        Observer.destroy(controller);

        let i = children.length;
        while (i--) children[i].destroy();
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
