/* -.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.
* File Name   : styles.js
* Created at  : 2019-06-15
* Updated at  : 2019-10-07
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

const for_each = require("@jeefo/utils/object/for_each");
const head = document.head;

/*
const hex2RGB = (() => {
    const CAPTURE_REGEX = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i;
    return hex_value => {
        const result = hex_value.match(CAPTURE_REGEX);
        return result ? {
            r : parseInt(result[1], 16),
            g : parseInt(result[2], 16),
            b : parseInt(result[3], 16)
        } : null;
    };
})();

const calculate_illuminance = (() => {
    const formula = value => {
        value /= 255;
        return (value <= 0.03928)
            ? value / 12.92
            : Math.pow(((value + 0.055) / 1.055), 2.4);
    };
    return hex_color => {
        let { r, g, b } = hex2RGB(hex_color);
        [r, g, b] = [r, g, b].map(formula);
        return r * 0.2126 + g * 0.7152 + b * 0.0722;
    };
})();
*/

class Styles {
	add_style (css_rules, attrs) {
		const style_el = document.createElement("style");
		style_el.setAttribute("type", "text/css");

        if (attrs) {
            for_each(attrs, (name, value) => {
                style_el.setAttribute(name, value);
            });
        }

		style_el.insertAdjacentHTML("afterbegin", css_rules);
		head.appendChild(style_el);
        return style_el;
	}
}

module.exports = new Styles();
