/* -.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.
* File Name   : ast_node_table.js
* Created at  : 2017-09-18
* Updated at  : 2019-10-11
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

const proj_dir = "@jeefo/javascript_parser/src";

const initialize = node => {
    throw new Error(`'${ node.id }' cannot be initialized`);
};

const operators = [
    // 12.4 to 12.14 - Operators
    "es5/operators/unary_operators",
    "es5/operators/binary_operators",
];

for (let path of operators) {
    require(`${ proj_dir }/${ path }`)(ast_node_table);
}

const nodes = [
    // 11.6.2.1 - Keywords
    "es8/terminals/keyword",
    // 11.7 - Punctuators
    "es8/terminals/punctuator",

    // --------------------------
    // 12.2 - Primary expressions
    // --------------------------
    "es8/expressions/primary_expression",
    // 12.1 - Identifiers
    "es5/expressions/identifier_name",
    "es8/expressions/binding_identifier",
    "es8/expressions/identifier_reference",
    // 12.2.4 - Literals
    "es8/literals/literal",
    "es8/literals/string_literal",
    "es8/literals/numeric_literal",
    // 12.2.5 - Array literal
    "es6/literals/array_literal",
    "es5/expressions/elision",
    // 12.2.6 - Object literal
    "es6/literals/object_literal",
    "es6/part/property_name",
    "es6/expressions/property_assignment",
    "es6/expressions/initializer",
    "es6/expressions/cover_initialized_name",
    "es6/expressions/computed_property_name",
    "es6/expressions/property_definition",
    // 12.2.9 - Template literal
    "es6/literals/template_literal",
    // 12.2.10 - The grouping operator
    "es8/expressions/cover_parenthesized_expression_and_arrow_parameters",
    "es6/expressions/grouping_expression",

    // ---------------------------------
    // 12.3 - Left hand side expressions
    // ---------------------------------
    "es8/expressions/new_expression",
    "es8/expressions/member_expression",
    "es8/binary_operators/member_operator",
    "es8/expressions/left_hand_side_expression",
    // 12.3.4 - Function calls
    "es8/expressions/super_call",
    "es8/expressions/call_expression",
    "es8/expressions/function_call_expression",
    // 12.3.6 - Arguments
    "es8/expressions/arguments",

    // ----------------------------
    // 12.14 - Conditional operator
    // ----------------------------
    "es5/operators/conditional_operator",

    // ----------------------------
    // 12.15 - Assigment expression
    // ----------------------------
    "es8/expressions/assignment_expression",
    "es8/binary_operators/assignment_operator",
    // 12.15.5 - Destructuring assignment
    // array
    "es6/expressions/spread_element",
    "es8/expressions/assignment_element",
    "es8/expressions/assignment_pattern",
    "es8/expressions/assignment_rest_element",
    "es8/expressions/array_assignment_pattern",
    "es8/expressions/destructuring_assignment_target",
    // object
    "es8/expressions/assignment_property",
    "es8/expressions/object_assignment_pattern",
    "es8/expressions/assignment_property_element",
    "es8/expressions/assignment_property_identifier",

    // ------------------
    // 12.16 - Expression
    // ------------------
    "es5/expressions/expression",
    "es5/expressions/sequence_expression",

    // 13....... - Expression statement
    "es5/statements/expression_statement",
];
for (let path of nodes) {
    const def = require(`${ proj_dir }/${ path }`);
    if (! def.initialize) {
        def.initialize = initialize;
    }
    ast_node_table.register_node_definition(def);
}

const _this = require(`${ proj_dir }/es8/expressions/this_keyword`);
ast_node_table.register_reserved_word("this", _this);
const _null = require(`${ proj_dir }/es8/literals/null_literal`);
ast_node_table.register_reserved_word("null", _null);
const bool = require(`${ proj_dir }/es8/literals/boolean_literal`);
ast_node_table.register_reserved_words(["true", "false"], bool);

module.exports = ast_node_table;
