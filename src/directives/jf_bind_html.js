/* -.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.
* File Name   : jf_bind_html.js
* Created at  : 2020-08-09
* Updated at  : 2020-11-18
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

//const Observer       = require("@jeefo/observer");
const JeefoDOMParser = require("@jeefo/jqlite/dom_parser");

const white_list_elements = [
    "A",
    "B",
    "U",
    "I",
    "OL",
    "UL",
    "LI",
    "BR",
    "DIV",
    "PRE",
    "TD",
    "TH",
    "TR",
    "THEAD",
    "TBODY",
    "TABLE",
    "SPAN",
    "BLOCKQUOTE",
];

const white_list_attributes = [
    "class",
    "style",
    "href",
    "target",
];

const sanitize = (document, elements) => {
    let i = elements.length;
    while (i--) {
        let element = elements[i];
        if (element.nodeType === Node.ELEMENT_NODE) {
            if (! white_list_elements.includes(element.tagName)) {
                console.log("replaced:", element.tagName);
                const div = document.createElement("div");
                while (element.firstChild) {
                    div.appendChild(element.firstChild);
                }
                element.parentNode.replaceChild(div, element);
                element = div;
            }

            let j = element.attributes.length;
            while (j--) {
                const attr = element.attributes[j];
                if (! white_list_attributes.includes(attr.name)) {
                    console.log("removed attr:", attr.name);
                    element.removeAttribute(attr.name);
                }
            }

            sanitize(document, element.children);
        }
    }
};

const bind = ($element, value) => {
    const dom_parser = new JeefoDOMParser(value);
    sanitize(dom_parser.document, dom_parser.elements);
    const elements = dom_parser.detach();
    for (const element of elements) {
        $element.append(element);
    }
};

module.exports = {
	selector : "jf-bind-html",
	bindings : {
		jfBindHtml : '@',
	},
	controller : class BindHTML {
		on_init ($element) {
            bind($element, this.jfBindHtml);
            //const observer = new Observer(this);
            //observer.on("jfBindHtml", value => bind($element, value));
		}
	}
};
