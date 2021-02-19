/* -.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.
* File Name   : text_binder.js
* Created at  : 2021-02-18
* Updated at  : 2021-02-19
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

const Interpreter = require("./interpreter");

class TextBinder {
    constructor (node, component) {
        this.node            = node;
        this.bound_component = component;
    }

    initialize () {
        const script = `\`${this.node.textContent}\``;
        this.interpreter = new Interpreter(script, this.bound_component);
        this.node.textContent = this.value = this.interpreter.get_value();
    }

    digest () {
        const value = this.interpreter.get_value();
        if (this.value !== value) {
            this.node.textContent = value;
            this.value = value;
        }
    }
}

module.exports = TextBinder;
