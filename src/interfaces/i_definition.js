/* -.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.
* File Name   : i_definition.js
* Created at  : 2019-07-05
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

const for_each  = require("@jeefo/utils/object/for_each");
const dash_case = require("@jeefo/utils/string/dash_case");

const {getOwnPropertySymbols}  = Object;
const CAPTURE_DEPENDENCY_REGEX = /^([\^\?]+)?(.+)$/;

const parse_dependency = (dependency_str, property) => {
    const matches = dependency_str.match(CAPTURE_DEPENDENCY_REGEX);
    const name    = dash_case(matches[2]);

    let direction   = null;
    let is_optional = false;
    if (matches[1]) {
        const operators = {};
        matches[1].split('').forEach(operator => {
            if (operators[operator]) {
                throw new Error("Duplicated operator");
            }
            switch (operator) {
                case '^' :
                    direction = "up";
                    break;
                case '?' :
                    is_optional = true;
                    break;
            }
        });
    }

    return { property, name, direction, is_optional };
};

class IDefinition {
    constructor (selectors, path) {
        this.selectors        = selectors;
        this.path             = path;
        this.binders          = [];
        this.dependencies     = null;
        this.Controller       = null;
        this.controller_name  = null;
        this.is_resolved      = false;
        this.is_structure     = false;
    }

    set_binders (bindings = {}) {
        for_each(bindings, (property, value) => {
            const operator       = value.charAt(0);
            const attr_name      = value.slice(1).trim();
            const attribute_name = dash_case(attr_name || property);
            this.binders.push({ property, operator, attribute_name });
        });
        getOwnPropertySymbols(bindings).forEach(symbol => {
            const value          = bindings[symbol];
            const operator       = value.charAt(0);
            const attribute_name = dash_case(value.slice(1).trim());
            this.binders.push({ property:symbol, operator, attribute_name });
        });
    }

    set_dependencies (dependencies) {
        this.dependencies = [];
        for_each(dependencies, (key, value) => {
            this.dependencies.push(parse_dependency(value, key));
        });
        getOwnPropertySymbols(dependencies).forEach(symbol => {
            const dependency_str = dependencies[symbol];
            this.dependencies.push(parse_dependency(dependency_str, symbol));
        });
    }

    resolve () {
        throw new Error("Derived class must be implement resolve() method.");
    }
}

module.exports = IDefinition;
