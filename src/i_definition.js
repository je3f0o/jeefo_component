/* -.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.
* File Name   : i_definition.js
* Created at  : 2019-07-05
* Updated at  : 2019-11-16
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

const for_each  = require("@jeefo/utils/object/for_each");
const dash_case = require("@jeefo/utils/string/dash_case");

class IDefinition {
    constructor (selectors, path) {
        this.selectors        = selectors;
        this.path             = path;
        this.is_resolved      = false;
        this.binders          = [];
        this.dependencies     = null;
        this.Controller       = null;
        this.controller_name  = null;
        this.is_structure     = false;
        this.is_self_required = false;
    }

    set_binders (bindings = {}) {
        for_each(bindings, (property, value) => {
            const operator       = value.charAt(0);
            const attr_name      = value.slice(1).trim();
            const attribute_name = dash_case(attr_name) || property;
            this.binders.push({ property, operator, attribute_name });
        });
        Object.getOwnPropertySymbols(bindings).forEach(symbol => {
            const value          = bindings[symbol];
            const operator       = value.charAt(0);
            const attribute_name = dash_case(value.slice(1).trim());
            this.binders.push({ property:symbol, operator, attribute_name });
        });
    }

    resolve () {
        throw new Error("Derived class must be implement resolve() method.");
    }
}

module.exports = IDefinition;
