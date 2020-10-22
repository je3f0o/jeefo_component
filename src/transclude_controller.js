/* -.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.
* File Name   : transclude_controller.js
* Created at  : 2019-06-26
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

const Transcluder    = require("./transcluder");
const JeefoDOMParser = require("@jeefo/jqlite/dom_parser");

class DefaultTranscluder {
    constructor (transcluder) {
        this.elements    = transcluder ? transcluder.elements : [];
        this.transcluder = transcluder;
    }

    set_placeholder (body) {
        this.transcluder && this.transcluder.set_placeholder(body);
    }

    transclude (parent_element) {
        if (this.transcluder) {
            this.transcluder.transclude(parent_element);
        } else for (const e of this.elements) parent_element.appendChild(e);
    }
}

const template_elems = ["JF-CONTENT", "JF-TEMPLATE"];

const is_default_transcluder = ({selector_type, tag_name}) =>
    selector_type === Node.ELEMENT_NODE && template_elems.includes(tag_name);

function find_transcluders (elements, indices, instance) {
    for (let i = 0; i < elements.length; i += 1) {
        const element = elements[i];
        indices.push(i);

        if (template_elems.includes(element.tagName)) {
            const transcluder = new Transcluder(element, indices);
            if (is_default_transcluder(transcluder)) {
                if (instance.default_transcluder) {
                    throw new Error("Ambigious transcluder detected.");
                }
                instance.default_transcluder = new DefaultTranscluder(
                    transcluder
                );
            } else {
                const found = instance.transcluders.find(t => {
                    return t.tag_name      === transcluder.tag_name &&
                           t.selector_type === transcluder.selector_type;
                });
                if (found) throw new Error("Duplicated transcluder detected.");

                instance.transcluders.push(transcluder);
            }
        } else {
            find_transcluders(element.children, indices, instance);
        }
        indices.pop();
    }
}

class TranscludeController {
    constructor (markup = '') {
        this.dom_parser   = new JeefoDOMParser(markup);
        this.transcluders = [];
        if (this.dom_parser.elements.length) {
            find_transcluders(this.dom_parser.elements, [], this);
        } else {
            this.default_transcluder = new DefaultTranscluder();
        }
    }

    // TODO: sort transcluders and transclude from behind
    transclude (element) {
        if (this.dom_parser.elements.length === 0) { return; }
        const body = this.dom_parser.document.body.cloneNode(true);

        while (element.firstChild) {
            const child = element.removeChild(element.firstChild);
            let transcluder;
            if (child.nodeType === Node.ELEMENT_NODE) {
                transcluder = this.transcluders.find(t => {
                    return t.tag_name === child.tagName;
                });
            }
            if (transcluder) {
                transcluder.elements.push(child);
            } else if (this.default_transcluder) {
                this.default_transcluder.elements.push(child);
            } else {
                throw new Error("Transcluder is not found");
            }
        }

        for (const t of this.transcluders) t.set_placeholder(body);
        if (this.default_transcluder) {
            this.default_transcluder.set_placeholder(body);
        }

        for (const t of this.transcluders) t.transclude();
        this.default_transcluder && this.default_transcluder.transclude();

        while (body.firstChild) element.appendChild(body.firstChild);
    }
}

module.exports = TranscludeController;
