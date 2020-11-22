/* -.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.
* File Name   : ast_node_table.js
* Created at  : 2017-09-18
* Updated at  : 2020-10-31
* Author      : jeefo
* Purpose     :
* Description :
.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.*/
// ignore:start
"use strict";

/* globals*/
/* exported*/

// ignore:end

const {
    AST_Node_Table,
    AST_Node_Definition
} = require("@jeefo/parser");
const {
    PRIMITIVE,
    TERMINATION
} = require("@jeefo/ecma_parser/es6/enums/precedence_enum");
const {
    expression,
    primary_expression
} = require("@jeefo/ecma_parser/es6/enums/states_enum");
const {
    get_last_non_comment_node,
} = require("@jeefo/ecma_parser/helpers");

const ast_node_table = new AST_Node_Table();

const proj_dir = "@jeefo/ecma_parser";

const initialize = node => {
    throw new Error(`'${node.id}' cannot be initialized`);
};

const operators = [
    // 12.4 to 12.14 - Operators
    "es5/operators/unary_operators",
    "es5/operators/binary_operators",
];

for (let path of operators) {
    require(`${proj_dir}/${path}`)(ast_node_table);
}

const nodes = [
    // 11.6.2.1 - Keywords
    "es8/identifiers/keyword",
    "es8/identifiers/identifier",
    "es8/identifiers/identifier_name",

    // 11.7 - Punctuators
    "es8/terminals/punctuator",

    // --------------------------
    // 12.2 - Primary expressions
    // --------------------------
    // 12.1 - Identifiers
    "es8/expressions/binding_identifier",
    "es8/expressions/identifier_reference",
    // 12.2.4 - Literals
    "es8/literals/literal",
    "es8/literals/string_literal",
    "es8/literals/numeric_literal",
    // 12.2.5 - Array literal
    "es6/literals/array_literal",
    // 12.2.6 - Object literal
    "es6/literals/object_literal",
    "es6/part/property_name",
    "es6/expressions/property_assignment",
    "es6/expressions/initializer",
    "es6/expressions/cover_initialized_name",
    "es5/expressions/computed_member_expression",
    "es6/expressions/computed_member_access",
    "es6/expressions/property_definition",

    // 12.2.9 - Template literal
    // replaced by jeefo binder
    //"es6/literals/template_literal",

    // 12.2.10 - The grouping operator
    "es8/expressions/cover_parenthesized_expression_and_arrow_parameters",
    "es6/expressions/grouping_expression",

    // ---------------------------------
    // 12.3 - Left hand side expressions
    // ---------------------------------
    "es8/operators/member_operator",
    // 12.3.4 - Function calls
    "es8/expressions/super_call",
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
    "es8/operators/assignment_operator",
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

// DEBUG_START
const debugger_stmt = require(`${proj_dir}/es5/statements/debugger_statement`);
ast_node_table.register_reserved_word("debugger", debugger_stmt);
// DEBUG_END

const _this = require(`${ proj_dir }/es8/expressions/this_keyword`);
ast_node_table.register_reserved_word("this", _this);
const _null = require(`${ proj_dir }/es8/literals/null_literal`);
ast_node_table.register_reserved_word("null", _null);
const bool = require(`${ proj_dir }/es8/literals/boolean_literal`);
ast_node_table.register_reserved_words(["true", "false"], bool);
const _new = require(`${ proj_dir }/es8/expressions/new_expression`);
ast_node_table.register_reserved_word("new", _new);

// Jeefo binder
const template_string = new AST_Node_Definition({
	id         : "Template literal string",
    type       : "Primitive",
	precedence : -1,

    is         : () => {},
    initialize : (node, current_token, parser) => {
        const { streamer } = parser.tokenizer;

        let length         = 0;
        let current_index  = streamer.cursor.position.index;
        let virtual_length = 0;
        let next_character = streamer.get_current_character();

        let start, end, last_pos;
        if (parser.last_position) {
            start                 = parser.last_position.clone();
            start.index          += 1;
            start.column         += 1;
            start.virtual_column += 1;
        } else {
            start = streamer.clone_cursor_position();
        }

        const get_next_character = (next_length = 1) => {
            return streamer.at(current_index + length + next_length);
        };

        LOOP:
        while (true) {
            switch (next_character) {
                case '\t' :
                    virtual_length += streamer.tab_size - 1;
                    break;
                case '\n' :
                    next_character = get_next_character();

                    if (next_character === '`') {
                        if (parser.last_position) {
                            end = start.clone();
                            streamer.cursor.position.line -= 1;
                        } else {
                            streamer.cursor.move(length, virtual_length);
                            end = streamer.clone_cursor_position();
                        }

                        streamer.cursor.position.line          += 1;
                        streamer.cursor.position.column         = 0;
                        streamer.cursor.position.virtual_column = 0;
                        break LOOP;
                    } else {
                        if (parser.last_position) {
                            last_pos = start.clone();
                            parser.last_position = null;
                        } else {
                            if (length) {
                                streamer.cursor.move(length, virtual_length);
                                last_pos = streamer.clone_cursor_position();
                            }
                            streamer.cursor.position.line += 1;
                        }

                        streamer.cursor.position.column         = 0;
                        streamer.cursor.position.virtual_column = 0;

                        current_index = streamer.cursor.position.index;
                        length = virtual_length = 0;
                    }
                    break;
                case '{':
                    if (get_next_character() === '{') {
                        const is_new_line = (
                            length === 1 &&
                            streamer.cursor.position.column === 0 &&
                            last_pos
                        );
                        streamer.cursor.move(length-1, virtual_length - 1);
                        if (is_new_line) {
                            end = last_pos;
                        } else {
                            end = streamer.clone_cursor_position();
                        }
                        break LOOP;
                    }
                    break;
                case '`':
                    streamer.cursor.move(length - 1, virtual_length - 1);
                    end = streamer.clone_cursor_position();
                    break LOOP;
                case '\\':
                    length         += 1;
                    virtual_length += 1;
                    break;
                case null: parser.throw_unexpected_end_of_stream();
            }

            next_character  = get_next_character();
            length         += 1;
            virtual_length += 1;
        }

        node.value = streamer.substring_from_offset(start.index);
        node.start = start;
        node.end   = end;
    }
});

const jeefo_binder_expression = new AST_Node_Definition({
	id         : "Jeefo binder expression",
    type       : "Primitive",
	precedence : -1,

    is         : () => {},
    initialize : (node, current_token, parser) => {
        const start      = current_token.start;
        const {streamer} = parser.tokenizer;

		streamer.cursor.move(1);
        parser.prepare_next_state("expression", true);
        parser.parse_next_node(TERMINATION);
        const expr = get_last_non_comment_node(parser, true);
        parser.end(expr);
        parser.prepare_next_state("punctuator");
        parser.expect("}}", () => {
            return parser.next_token.id === "Delimiter" &&
                parser.next_token.value === '}' &&
                streamer.is_next_character('}');
        });
        parser.is_terminated = false;
		streamer.cursor.move(1);

        node.expression = expr;
        node.start      = start;
        node.end        = streamer.clone_cursor_position();
    }
});

ast_node_table.register_node_definition({
    id         : "Template literal",
    type       : "Primitive",
    precedence : PRIMITIVE,

    is : (token, { current_state }) => {
        return current_state === expression && token.id === "Backtick";
    },
    initialize : (node, current_token, parser) => {
        const body           = [];
        const { streamer }   = parser.tokenizer;
        const start_position = streamer.clone_cursor_position();

        if (streamer.get_next_character() === '\n') {
            parser.last_position = streamer.clone_cursor_position();
        }
		let next_character = streamer.next();

        LOOP:
        while (true) {
            switch (next_character) {
                case '`' : break LOOP;
                case null:
                    parser.throw_unexpected_end_of_stream();
                    break;
            }

            if (next_character === '{' && streamer.is_next_character('{')) {
                body.push(jeefo_binder_expression.generate_new_node(parser));
            } else {
                body.push(template_string.generate_new_node(parser));
            }

            next_character = streamer.get_next_character();
            if (next_character === '\n') {
                parser.last_position = streamer.clone_cursor_position();
            } else {
                parser.last_position = null;
            }
            if (streamer.get_current_character() === '\n') {
                streamer.cursor.position.line -= 1;
            }
            streamer.next();
        }
        delete parser.last_position;

        node.body  = body;
        node.start = start_position;
        node.end   = streamer.clone_cursor_position();

        // It's important, since there is no real next token
        parser.next_token    = node;
        parser.current_state = primary_expression;
    }
});

module.exports = ast_node_table;
