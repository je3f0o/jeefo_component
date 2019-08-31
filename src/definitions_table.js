/* -.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.
* File Name   : definitions_table.js
* Created at  : 2019-06-24
* Updated at  : 2019-07-09
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

const ComponentDefinition = require("./component_definition");
const DirectiveDefinition = require("./directive_definition");

class DefinitionsTable {
    constructor () {
        this.components = Object.create(null);
        this.directives = Object.create(null);
    }

    register_component (selectors, path) {
        if (typeof selectors === "string") {
            selectors = [selectors];
        }
        const definition = new ComponentDefinition(selectors, path);
        selectors.forEach(name => {
            if (this.components[name]) {
                throw new Error("Duplicated component selector registered");
            }
            this.components[name] = definition;
        });
    }

    register_directive (selectors, path) {
        if (typeof selectors === "string") {
            selectors = [selectors];
        }
        const definition = new DirectiveDefinition(selectors, path);
        selectors.forEach(name => {
            if (this.directives[name]) {
                throw new Error("Duplicated component selector registered");
            }
            this.directives[name] = definition;
        });
    }

    register (selectors, path) {
        if (typeof selectors === "string") {
            selectors = [selectors];
        }
        if (! path.endsWith(".js")) {
            path += ".js";
        }

        if (path.endsWith("_component.js")) {
            this.register_component(selectors, path);
        } else if (this.path.endsWith("_directive.js")) {
            this.register_directive(selectors, path);
        } else {
            throw new Error("Invalid path name");
        }
    }

    get_component (name) {
        const component_definition = this.components[name];
        if (component_definition) {
            if (! component_definition.is_resolved) {
                component_definition.resolve();
            }

            return component_definition;
        }
    }

    get_directive (name) {
        const directive_definition = this.directives[name];
        if (directive_definition) {
            if (! directive_definition.is_resolved) {
                directive_definition.resolve();
            }

            return directive_definition;
        }
    }
}

module.exports = new DefinitionsTable();
