/* -.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.
* File Name   : parser.js
* Created at  : 2017-07-25
* Updated at  : 2019-08-08
* Author      : jeefo
* Purpose     :
* Description :
.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.*/
// ignore:start
"use strict";

/* globals*/
/* exported*/

// ignore:end

const enum_path = "@jeefo/javascript_parser/src/es5/enums/states_enum";

const for_each       = require("@jeefo/utils/object/for_each");
const JeefoParser    = require("@jeefo/parser");
const states_enum    = require(enum_path);
const tokenizer      = require("./tokenizer");
const ast_node_table = require("./ast_node_table");

const parser = new JeefoParser(
    "Jeefo ES6 expression",
    tokenizer,
    ast_node_table
);
for_each(states_enum, (key, value) => {
    parser.state.add(key, value, key === "statement");
});

const prep_path = "@jeefo/javascript_parser/src/es5/preparation_handler";
parser.onpreparation = require(prep_path);

module.exports = parser;
