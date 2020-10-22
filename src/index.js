/* -.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.
* File Name   : index.js
* Created at  : 2017-08-08
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

const definitions_table = require("./definitions_table");

const REGEX_UNDERLINE = /_/g;

[
    "if",
    "for_each",
    "switch",
    "jf_bind",
    "jf_class",
    "jf_bind_html",
].forEach(filename => {
    const path     = `${__dirname}/directives/${filename}`;
    const selector = filename.replace(REGEX_UNDERLINE, '-');
    definitions_table.register_directive(selector, path);
});

const switch_placeholder_path = `${__dirname}/directives/switch_placeholder`;
definitions_table.register_component(
    "switch-placeholder", switch_placeholder_path
);

module.exports = {
    compile             : require("./compiler"),
    IComponent          : require("./interfaces/i_component"),
    IRenderable         : require("./interfaces/i_renderable"),
    IDefinition         : require("./interfaces/i_definition"),
    Directive           : require("./components/directive"),
    InvisibleComponent  : require("./components/invisible_component"),
    StructureComponent  : require("./components/structure_component"),
    RenderableComponent : require("./components/renderable_component"),

    definitions_table
};
