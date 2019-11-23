/* -.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.
* File Name   : tokenizer.js
* Created at  : 2019-07-09
* Updated at  : 2019-10-31
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

// ES5 tokenizer
const tokenizer = require("@jeefo/ecma_parser/es5/tokenizer");
// ES6 tokenizer
const register_tokes = require("@jeefo/ecma_parser/es6/tokenizer");
register_tokes(tokenizer);

module.exports = tokenizer;
