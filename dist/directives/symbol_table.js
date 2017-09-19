/* -.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.
* File Name   : symbol_table.js
* Created at  : 2017-09-18
* Updated at  : 2017-09-18
* Author      : jeefo
* Purpose     :
* Description :
_._._._._._._._._._._._._._._._._._._._._.*/

var JavascriptSymbolTable = require("jeefo/javascript_parser/src/javascript_symbol_table");

// TODO: think about reserve, keywords...

var symbol_table = new JavascriptSymbolTable();

// Other symbols ----------------------------------------------------------------------------------
var container = symbol_table.symbols.others;

var register = function (token) {
	symbol_table.register(container, token.token_type, {
		is          : token.is,
		Constructor : token.Constructor
	});
};

// Literals
register(require("jeefo/javascript_parser/src/es5/literals/null_literal"));
register(require("jeefo/javascript_parser/src/es5/literals/array_literal"));
register(require("jeefo/javascript_parser/src/es5/literals/number_literal"));
register(require("jeefo/javascript_parser/src/es5/literals/string_literal"));
register(require("jeefo/javascript_parser/src/es5/literals/regexp_literal"));
register(require("jeefo/javascript_parser/src/es5/literals/object_literal"));
register(require("jeefo/javascript_parser/src/es5/literals/boolean_literal"));

// Declarations
register(require("jeefo/javascript_parser/src/es5/declarations/identifier"));

// Unaries ---------------------------
// Operators
register(require("jeefo/javascript_parser/src/es5/unaries/operators_expression"));

// Binaries symbols -------------------------------------------------------------------------------
container = symbol_table.symbols.binaries;

// Math expressions
register(require("jeefo/javascript_parser/src/es5/binaries/division_expression"));
register(require("jeefo/javascript_parser/src/es5/binaries/multiply_remainder_expression"));
register(require("jeefo/javascript_parser/src/es5/binaries/addition_subtraction_expression"));
register(require("jeefo/javascript_parser/src/es5/binaries/exponentiation_expression"));

// Object member expressions
register(require("jeefo/javascript_parser/src/es5/binaries/member_expression"));
register(require("jeefo/javascript_parser/src/es5/binaries/computed_member_expression"));

// Object operator expressions
register(require("jeefo/javascript_parser/src/es5/binaries/in_expression"));
register(require("jeefo/javascript_parser/src/es5/binaries/instanceof_expression"));

// Comparision expressions
register(require("jeefo/javascript_parser/src/es5/binaries/logical_or_expression"));
register(require("jeefo/javascript_parser/src/es5/binaries/logical_and_expression"));
register(require("jeefo/javascript_parser/src/es5/binaries/equality_expression"));
register(require("jeefo/javascript_parser/src/es5/binaries/comparition_expression"));

// Binary operator expressions
register(require("jeefo/javascript_parser/src/es5/binaries/bit_shift_expression"));
register(require("jeefo/javascript_parser/src/es5/binaries/bitwise_or_expression"));
register(require("jeefo/javascript_parser/src/es5/binaries/bitwise_and_expression"));
register(require("jeefo/javascript_parser/src/es5/binaries/bitwise_xor_expression"));

// Ternary expression
register(require("jeefo/javascript_parser/src/es5/binaries/conditional_expression"));

// Assignmenr expression
register(require("jeefo/javascript_parser/src/es5/binaries/assignment_expression"));

// Call
register(require("jeefo/javascript_parser/src/es5/binaries/call_expression"));

// Sequance
register(require("jeefo/javascript_parser/src/es5/binaries/sequence_expression"));

// Unary suffix
register(require("jeefo/javascript_parser/src/es5/binaries/unary_expression"));

//require("jeefo/javascript_parser/src/es5/literals")(symbol_table);
//require("jeefo/javascript_parser/src/es5/delimiters")(symbol_table);
//require("jeefo/javascript_parser/src/es5/binary_expressions")(symbol_table);
/*
require("jeefo/javascript_parser/src/es5/expressions")(symbol_table);
require("./declarations")(symbol_table);
require("./unary_expressions")(symbol_table);
*/

module.exports = symbol_table;
