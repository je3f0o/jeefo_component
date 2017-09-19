/* -.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.
* File Name   : parser.js
* Created at  : 2017-09-18
* Updated at  : 2017-09-19
* Author      : jeefo
* Purpose     :
* Description :
_._._._._._._._._._._._._._._._._._._._._.*/
// ignore:start

/* globals */
/* exported */

// ignore:end

var Parser           = require("jeefo/javascript_parser/src/parser"),
	es5_tokenizer    = require("./tokenizer"),
	es5_symbol_table = require("./symbol_table"),
	lexical_parser   = new Parser(es5_tokenizer, es5_symbol_table);

export default lexical_parser;
