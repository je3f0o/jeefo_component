/* -.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.
* File Name   : transcluder.js
* Created at  : 2017-08-26
* Updated at  : 2019-07-21
* Author      : jeefo
* Purpose     :
* Description :
.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.*/
// ignore:start
"use strict";

/* globals*/
/* exported*/

// ignore:end

const splice = Array.prototype.splice;

class Transcluder {
    constructor (selector_name, parent_position) {
        this.nodes           = [];
        this.selector_name   = selector_name;
        this.parent_position = parent_position;
    }

    add_node (node) {
        this.nodes.push(node);
    }

    transclude (structure_nodes) {
        // TODO: replace this temporary solution
        let parent_container = structure_nodes;
        const length = this.parent_position.length - 1;
        for (let i = 0; i < length; ++i) {
            const index      = this.parent_position[i];
            parent_container = parent_container[index].children;
        }

        const args = [this.parent_position.last(), 1].concat(this.nodes);
        splice.apply(parent_container, args);
        this.nodes = [];
    }
}

module.exports = Transcluder;
