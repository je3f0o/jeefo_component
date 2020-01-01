/* -.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.
* File Name   : switch_placeholder.js
* Created at  : 2019-11-29
* Updated at  : 2020-01-02
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

const array_remove = require("@jeefo/utils/array/remove");

exports.selector = "switch-placeholder";
exports.type     = "structure";

exports.controller = class SwitchPlaceholder {
    on_init ($element, component) {
        const id = component.node.attrs.values["switch-id"];
        for (let p = component.parent; p; p = p.parent) {
            if (p.id === id) {
                p.placeholders.push(component);

                // jshint loopfunc: true
                this.on_destroy = () => {
                    array_remove(p.placeholders, component);
                };
                // jshint loopfunc: false

                break;
            }
        }
        $element.replace(document.createComment(" swtich-case "));
    }
};
