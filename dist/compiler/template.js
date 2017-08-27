/* -.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.
* File Name   : template.js
* Created at  : 2017-08-26
* Updated at  : 2017-08-26
* Author      : jeefo
* Purpose     :
* Description :
_._._._._._._._._._._._._._._._._._._._._.*/

var parser        = require("jeefo_template/parser"),
	compile_nodes = require("./nodes");

/**
 * @doc
 * @param template : jeefo template string.
 * @param parent   : parent directive object.
 * @return Document fragment object
 */
module.exports = function compile_template (template, parent) {
	return compile_nodes(parser(template), parent);
};
