/* -.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.
* File Name   : compiler.js
* Created at  : 2017-09-19
* Updated at  : 2017-11-08
* Author      : jeefo
* Purpose     :
* Description :
_._._._._._._._._._._._._._._._._._._._._.*/
// ignore:start
"use strict";

/* globals */
/* exported */

// ignore:end

var get_string = require("./get_string");

// statics
var _code, Input, _component;

var compiler = function (context, token) {
	switch (token.type) {
		case "NullLiteral" :
			return "null";
		case "NumberLiteral"  :
		case "BooleanLiteral" :
			return token.value;
		case "StringLiteral" :
			return get_string(token.value);
		case "Identifier" :
			return `${ context.next(token.name) }.${ token.name }`;
		case "UnaryExpression" :
			var argument;

			if (token.operator === '!') {
				var input = new Input(
					_component,
					_code.substring(token.argument.start.index, token.argument.end.index)
				);
				argument = context.add_input(input);
			} else {
				argument = compiler(context, token.argument);
			}

			return `${ token.operator } ${ argument }`;
		case "MemberExpression" :
			if (token.is_computed) {
				return `${ compiler(context, token.object) }[${ compiler(context, token.property) }]`;
			}

			return `${ compiler(context, token.object) }.${ token.property.name }`;
		case "CallExpression" :
			var i = 0, args = [];

			for (; i < token.arguments.length; ++i) {
				args.push(
					compiler(context, token.arguments[i])
				);
			}

			return `${ compiler(context, token.callee) }(${ args.join(", ") })`;
		case "ExponentiationExpression" :
			return `${ compiler(context, token.left) } ** ${ compiler(context, token.right) }`;
		case "BinaryExpression" :
		case "EqualityExpression" :
		case "AssignmentExpression" :
			return `(${ compiler(context, token.left) } ${ token.operator } ${ compiler(context, token.right) })`;
		case "LogicalOrExpression" :
			return `(${ compiler(context, token.left) } || ${ compiler(context, token.right) })`;
		case "LogicalAndExpression" :
			return `(${ compiler(context, token.left) } && ${ compiler(context, token.right) })`;
		default:
			console.log("Unimplemented token", token);
	}
};

var input_compiler = function (context, component, code, token) {
	_code      = code;
	_component = component;
	
	return compiler(context, token);
};
input_compiler.set_input = function (Constructor) {
	Input = Constructor;
};

module.exports = input_compiler;
