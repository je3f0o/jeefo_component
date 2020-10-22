/* -.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.
* File Name   : transcluder.js
* Created at  : 2017-08-26
* Updated at  : 2020-10-23
* Author      : jeefo
* Purpose     :
* Description :
.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.*/
// ignore:start
"use strict";

/* globals*/
/* exported*/

// ignore:end

const ATTRIBUTE_SELECTOR = "select";

class Transcluder {
    constructor (element, indices) {
        this.indices    = indices.concat();
        this.elements   = [];
        this.css_class  = element.classList.value;
        this.attributes = element.attributes;

        if (element.hasAttribute(ATTRIBUTE_SELECTOR)) {
            const selector     = element.getAttribute(ATTRIBUTE_SELECTOR);
            this.tag_name      = selector.toUpperCase();
            this.selector_type = Node.ATTRIBUTE_NODE;
            element.removeAttribute(ATTRIBUTE_SELECTOR);
        } else {
            this.tag_name      = element.tagName;
            this.selector_type = Node.ELEMENT_NODE;
        }
    }

    set_placeholder (parent_element) {
        const length = this.indices.length - 1;
        for (let i = 0; i < length; ++i) {
            const index    = this.indices[i];
            parent_element = parent_element.children[index];
        }

        const last_index = this.indices[this.indices.length - 1];
        this.placeholder = parent_element.children[last_index];
    }

    transclude () {
        const parent_element = this.placeholder.parentNode;
        while (this.elements.length) {
            const element = this.elements.pop();
            if (this.css_class) element.classList.value = this.css_class;
            for (const attr of this.attributes) {
                element.setAttribute(attr.name, attr.value);
            }
            parent_element.insertBefore(element, this.placeholder.nextSibling);
        }
        parent_element.removeChild(this.placeholder);
    }
}

module.exports = Transcluder;
