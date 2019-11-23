/* -.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.
* File Name   : index.js
* Created at  : 2017-09-19
* Updated at  : 2017-10-20
* Author      : jeefo
* Purpose     :
* Description :
_._._._._._._._._._._._._._._._._._._._._.*/
// ignore:start
"use strict";

/* globals */
/* exported */

// ignore:end

var parser     = require("./parser"),
	compiler   = require("./compiler"),
	get_string = require("./get_string");

var $ctrls;

var set_context = function (component, ctx, name) {
	if (component.controller) {
		if (component.controller_as === name) {
			if (name in component.controller) {
				$ctrls[ctx] = component.controller;
			} else {
				ctx = $ctrls[ctx] = {};
				ctx[name] = component.controller;
			}
			return true;
		} else if (name in component.controller) {
			$ctrls[ctx] = component.controller;
			return true;
		}
	}
	if (component.parent) {
		return set_context(component.parent, ctx, name);
	}
},

compile_setter = function (context, token, is_right_value) {
	switch (token.type) {
		case "NullLiteral"    :
		case "BooleanLiteral" :
			return null;
		case "NumberLiteral" :
			if (is_right_value) {
				return token.value;
			}
			return null;
		case "StringLiteral" :
			if (is_right_value) {
				return get_string(token.value);
			}
			return null;
		case "Identifier" :
			return `${ context.next(token.name) }.${ token.name }`;
		case "MemberExpression" :
			if (token.is_computed) {
				return `${ compile_setter(context, token.object) }[${ compile_setter(context, token.property, true) }]`;
			}
			return `${ compile_setter(context, token.object) }.${ token.property.name }`;
		default:
			throw new Error("Setter must be single lvalue");
	}
},

set_contexts = function (context, component, override) {
	var i = 0, map = context.map, keys = context.keys, ctx, name, parent, is_succeed;

	for (; i < keys.length; ++i) {
		ctx  = keys[i];
		name = map[ctx];

		if (override && override[name]) {
			ctx       = $ctrls[ctx] = {};
			ctx[name] = override[name];
		} else {
			is_succeed = set_context(component, ctx, name);

			if (! is_succeed) {
				parent = component.parent;
				while (parent && ! parent.controller) {
					parent = parent.parent;
				}
				$ctrls[ctx] = parent.controller;
			}
		}
	}
};

var Context = function () {
	this.map    = {};
	this.keys   = [];
	this.ctrls  = {};
	this.inputs = { length : 0 };
};

Context.prototype = {
	next : function (ctx_name) {
		var next = `ctx${ this.keys.length }`;
		this.map[next] = ctx_name;
		this.keys.push(next);

		return `$ctrls.${ next }`;
	},
	add_input : function (input) {
		var next = `input${ this.inputs.length++ }`;
		this.inputs[next] = input;

		return `$inputs.${ next }.invoke()`;
	},
};

var Input = function ($component, code) {
	this.code        = code;
	this.context     = new Context();
	this.component   = $component;
	this.catch_block = '';

	var i = 0, tokens = parser.parse(code), try_block = '';
	
	for (; i < tokens.length; ++i) {
		try_block += `result = ${ compiler(this.context, $component, code, tokens[i].expression) };`;
	}

	//console.log(try_block);

	// jshint evil : true
	this.fn = new Function("$ctrls", "$inputs", `
		var result;
		try {
			${ try_block }
		} catch (e) {
			${ this.catch_block }
		} finally {
			return result;
		}
	`);
	// jshint evil : false
};

compiler.set_input(Input);

Input.prototype = {
	invoke : function (override) {
		$ctrls = this.context.ctrls;
		set_contexts(this.context, this.component, override);

		return this.fn($ctrls, this.context.inputs);
	},
	build_setter : function () {
		this.setter_context = new Context();

		var tokens = parser.parse(this.code), code;
		
		if (tokens.length === 1) {
			code = compile_setter(this.setter_context, tokens[0].expression);
		} else if (tokens.length > 1) {
			throw new Error("Setter must be single lvalue");
		}

		if (code) {
			// jshint evil : true
			this.setter = new Function("$ctrls", "__value__",
				`try { ${ code } = __value__; } catch (e) {}`);
			// jshint evil : false
		}
	},
	set : function (value, override) {
		if (! this.setter) { return; }

		$ctrls = this.setter_context.ctrls;
		set_contexts(this.setter_context, this.component, override);

		this.setter($ctrls, value);
	},
};

module.exports = Input;
