/* -.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.
* File Name   : ast_node_table.js
* Created at  : 2017-09-18
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

const { AST_Node_Table } = require("@jeefo/parser");

const ast_node_table = new AST_Node_Table();

require("@jeefo/javascript_parser/src/es5/delimiters")(ast_node_table);
require("@jeefo/javascript_parser/src/es5/operators")(ast_node_table);
require("@jeefo/javascript_parser/src/es5/primitives")(ast_node_table);
require("@jeefo/javascript_parser/src/es5/expressions")(ast_node_table);

const stmt_path  = "@jeefo/javascript_parser/src/es5/statements";
const expr_stmt  = require(`${ stmt_path }/expression_statement`);
const empty_stmt = require(`${ stmt_path }/empty_statement`);

ast_node_table.register_node_definition(empty_stmt);
ast_node_table.register_node_definition(expr_stmt);

// ES6 node table
const register_node_definitions = require(
    "@jeefo/javascript_parser/src/es6/ast_node_table"
);
register_node_definitions(ast_node_table);

module.exports = ast_node_table;
