/* -.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.
* File Name   : compiler.js
* Created at  : 2017-09-19
* Updated at  : 2017-09-19
* Author      : jeefo
* Purpose     :
* Description :
_._._._._._._._._._._._._._._._._._._._._.*/
// ignore:start

/* globals */
/* exported */

// ignore:end

module.exports = function compile (token, contexts) {
	switch (token.type) {
		case "Identifier" :
			return `${ contexts.next(token.name) }.${ token.name }`;
		case "UnaryExpression" :
			var code = compile(token.argument, contexts);
			return `${ token.operator } ${ code }`;
		case "MemberExpression" :
			//if (token.is_computed) { }

			var new_object_name = compile(token.object, contexts);
			return `${ new_object_name }.${ token.property.name }`;
	}
};
