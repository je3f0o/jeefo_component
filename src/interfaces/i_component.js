/* -.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.
* File Name   : i_component.js
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

const Readonly       = require("@jeefo/utils/object/readonly");
const Interface      = require("@jeefo/utils/class/interface");
const virtual_method = require("@jeefo/utils/class/virtual_method");

// DEBUG_START
let static_id = 1;
// DEBUG_END

class IComponent extends Interface {
    constructor (name, {
        Controller      = null,
        controller_name = null,
    }, ExtentedInterface, is_directive = false) {
        super(ExtentedInterface || IComponent);

        const readonly = new Readonly(this);
        readonly.getter("name", () => name);

        this.Controller      = Controller;
        this.controller_name = controller_name;
        this.is_rendered     = false;
        this.is_destroyed    = false;
        this.is_initialized  = false;

        if (! is_directive) {
            this.children   = [];
            this.directives = [];
        }

        // DEBUG_START
        const id = static_id++;
        readonly.getter("id", () => id);
        // DEBUG_END
    }

    digest         () { virtual_method(); }
    destroy        () { virtual_method(); }
    initialize     () { virtual_method(); }
    trigger_render () { virtual_method(); }
}

module.exports = IComponent;
