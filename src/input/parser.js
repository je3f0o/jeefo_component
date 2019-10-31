/* -.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.
* File Name   : parser.js
* Created at  : 2017-07-25
* Updated at  : 2019-10-31
* Author      : jeefo
* Purpose     :
* Description :
.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.*/
// ignore:start
"use strict";

/* globals*/
/* exported*/

// ignore:end

const enum_path = "@jeefo/ecma_parser/es8/enums/states_enum";

const for_each       = require("@jeefo/utils/object/for_each");
const JeefoParser    = require("@jeefo/parser");
const states_enum    = require(enum_path);
const tokenizer      = require("./tokenizer");
const ast_node_table = require("./ast_node_table");

const parser = new JeefoParser(
    "Jeefo ES8 expression",
    tokenizer,
    ast_node_table
);
for_each(states_enum, (key, value) => {
    parser.state.add(key, value, key === "statement");
});

const prep_path = "@jeefo/ecma_parser/es5/preparation_handler";
parser.onpreparation = require(prep_path);

/*
let n = parser.parse(`
a = 2;
[, id, id = value, {} = {}, [] = [], [], o.p, ...rest] = [,,[]];
({
    id,
    id : id,
    id : { z = 2 },
    id : { [prop] : id },
    id : [, id, id = value, {} = {}, [] = [], [], o.p, ...rest],
    id = 123
} = {});

o = { z : {}, i : [2 > {}] };
a,b,c;
`);
console.log(n);
*/

module.exports = parser;
