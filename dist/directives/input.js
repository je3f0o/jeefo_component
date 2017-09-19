/* -.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.
* File Name   : input.js
* Created at  : 2017-09-19
* Updated at  : 2017-09-19
* Author      : jeefo
* Purpose     :
* Description :
_._._._._._._._._._._._._._._._._._._._._.*/

var Input = function ($parser) {
	this.$parser = $parser;
},

compiler = function (input, token, is_child) {
	switch (token.type) {
		case "Identifier" :
			if (is_child) {
				return input.next(token.name) + '.' + token.name;
			}
			return "result = " + input.next(token.name) + '.' + token.name + ';';
		case "UnaryExpression" :

			if (is_child) {
				return token.operator + ' ' + compiler(input, token.argument, true);
			}

			var code = TRIM_LINES`
				var arg = ${ compiler(input, token.argument, true) };
				result = ${ token.operator } arg;
			`;

			if (token.operator === '!') {
				input.catch_block += "result = true;";
			}

			return code;
		case "MemberExpression" :
			//if (token.is_computed) { }

			var new_object_name = compiler(input, token.object, true);

			if (is_child) {
				return new_object_name + '.' + token.property.name;
			}
			return "result = " + new_object_name + '.' + token.property.name + ';';
	}
};

Input.prototype = {
	init : function (code) {
		this.code  = code;
		this.keys  = [];
		this.names = {};
	},
	next : function (ctx_name) {
		var next = 'c' + this.keys.length;
		this.names[next] = ctx_name;
		this.keys.push(next);

		return next;
	},
	get_args : function () {
	},
	get_params : function () {
		var i = this.keys.length, params = [];

		while (i--) {
			params[i] = this.keys[i];
		}

		return params;
	},
	compile : function (token) {
		this.catch_block = '';

		var code = compiler(this, token);

		return TRIM_LINES`
			var result;
			try {
				${ code }
			} catch (e) {
				${ this.catch_block }
			} finally {
				return result;
			}
		`;
	},
	build_getter : function (code) {
		// Set getter
		var i = 0, args = this.get_params(), ctrls = this.args = [], key;
		// TODO: maybe we want to get catched error later...
		args.push(code);

		this.getter = Function.apply(null, args);

		// Set args
		for (; i < this.keys.length; ++i) {
			key = this.keys[i];
			ctrls[i] = this.$parser.find_controller(this.names[key]);
		}
	},
	get : function () {
		return this.getter.apply(null, this.args);
	}
};

module.exports = Input;
