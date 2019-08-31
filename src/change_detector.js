/* -.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.
* File Name   : change_detector.js
* Created at  : 2019-07-02
* Updated at  : 2019-07-21
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

class ChangeDetector {
    constructor (interpreter, handler) {
        this.value       = interpreter.get_value();
        this.handler     = handler;
        this.interpreter = interpreter;
        handler(this.value);
    }

    invoke () {
        const value = this.interpreter.get_value();
        if (value !== this.value) {
            this.handler(value);
            this.value = value;
        }
    }
}

module.exports = ChangeDetector;
