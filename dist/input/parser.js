/* -.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.
* File Name   : parser.js
* Created at  : 2017-09-18
* Updated at  : 2017-09-28
* Author      : jeefo
* Purpose     :
* Description :
_._._._._._._._._._._._._._._._._._._._._.*/

var Parser           = require("jeefo_javascript_parser/src/parser"),
	es5_tokenizer    = require("./tokenizer"),
	es5_symbol_table = require("./symbol_table"),
	lexical_parser   = new Parser(es5_tokenizer, es5_symbol_table);

module.exports = lexical_parser;
