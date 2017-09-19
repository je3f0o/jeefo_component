/* -.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.
* File Name   : contexts.js
* Created at  : 2017-09-19
* Updated at  : 2017-09-19
* Author      : jeefo
* Purpose     :
* Description :
_._._._._._._._._._._._._._._._._._._._._.*/

var Contexts = function () {
	this.keys  = [];
	this.names = {};
};

Contexts.prototype = {
	next : function (ctx_name) {
		var next = 'c' + this.keys.length;
		this.names[next] = ctx_name;
		this.keys.push(next);

		return next;
	},
};

module.exports = Contexts;
