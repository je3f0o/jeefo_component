/* -.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.
* File Name   : transclude_controller.js
* Created at  : 2019-06-26
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

const Transcluder = require("./transcluder");

function find_transcluders (nodes, parent_indices, transclude_controller) {
    nodes.forEach((node, index) => {
        const parent_position = parent_indices.concat();
        parent_position.push(index);

        if (node.name === "jf-content") {
            const selector_name = node.attrs.get("select") || null;
            transclude_controller.add(selector_name, parent_position);
        } else if (node.children.length) {
            find_transcluders(
                node.children, parent_position, transclude_controller
            );
        }
    });
}

class TranscludeController {
    constructor (structure_nodes) {
        this.structure_nodes        = structure_nodes;
        this.default_transcluder    = null;
        this.named_transcluders     = [];
        this.named_transcluders_map = Object.create(null);

        if (structure_nodes.length) {
            find_transcluders(structure_nodes, [], this);
        } else {
            this.default_transcluder = new Transcluder(null, []);
        }

        // TODO: sort transcluders here
    }

    get (selector_name) {
        return this.named_transcluders_map[selector_name] || null;
    }

    add (selector_name, parent_position) {
        const transcluder = new Transcluder(selector_name, parent_position);

        if (selector_name) {
            if (this.named_transcluders_map[selector_name]) {
                throw new Error(`Duplicated transcluder detected.`);
            }
            this.named_transcluders.push(transcluder);
            this.named_transcluders_map[selector_name] = transcluder;
        } else if (! this.default_transcluder) {
            this.default_transcluder = transcluder;
        } else {
            throw new Error(`Ambigious transcluder detected.`);
        }
    }

    // TODO: sort transcluders and transclude from behind
    transclude (child_nodes) {
        if (this.structure_nodes.length === 0) { return child_nodes; }
        const nodes = this.structure_nodes.map(node => node.clone(true));

        if (child_nodes.length) {
            child_nodes.forEach(child_node => {
                const selector_name     = child_node.name;
                const named_transcluder = this.get(selector_name);
                if (named_transcluder) {
                    named_transcluder.add_node(child_node);
                } else if (this.default_transcluder) {
                    this.default_transcluder.add_node(child_node);
                } else {
                    throw new Error("Transcluder is not found");
                }
            });

            let i = this.named_transcluders.length;
            while (i--) {
                this.named_transcluders[i].transclude(nodes);
            }
            if (this.default_transcluder) {
                this.default_transcluder.transclude(nodes);
            }
        }

        return nodes;
    }
}

module.exports = TranscludeController;
