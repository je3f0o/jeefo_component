/* -.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.
* File Name   : compiler.js
* Created at  : 2017-06-15
* Updated at  : 2017-08-24
* Author      : jeefo
* Purpose     :
* Description :
_._._._._._._._._._._._._._._._._._._._._.*/

var jqlite             = require("jeefo_jqlite"),
	parser             = require("jeefo_template/parser"),
	Counter            = require("./counter"),
	counter            = new Counter(),
	collect_components = require("./collect_components");

/**
 * @doc Method
 * @description
 *   Get DOM element and compile all nested directives.
 * @param element : DOM Element
 * @param parents : parent directive instances.
 */
exports.compile_element = function (element, parent) {
	var i = 0, subcomponents = [];

	collect_components.from_element(element, subcomponents, parent, counter);

	// Compile subdirectives
	for (; i < subcomponents.length; ++i) {
		subcomponents[i].compile();
	}
};

/**
 * @doc
 * @param template : jeefo template string.
 * @param parent   : parent directive object.
 * @return Document fragment object
 */
var compile_nodes = exports.compile_nodes = function (nodes, parent) {
	var i = 0, fragment = document.createDocumentFragment(), subcomponents = [],
		template = collect_components.from_nodes(nodes, subcomponents, parent, counter);

	var $element = jqlite(template);
	for (; i < $element.length; ++i) {
		fragment.appendChild($element[i]);
	}

	var map = {}, elements = fragment.querySelectorAll("[jeefo-component-id]");

	i = elements.length;
	while (i--) {
		map[elements[i].getAttribute("jeefo-component-id")] = elements[i];
	}

	// Compile subdirectives
	for (i = 0; i < subcomponents.length; ++i) {
		subcomponents[i].element = map[subcomponents[i].id];
		subcomponents[i].compile();
	}

	return fragment;
};

/**
 * @doc
 * @param template : jeefo template string.
 * @param parent   : parent directive object.
 * @return Document fragment object
 */
exports.compile_template = function (template, parent) {
	return compile_nodes(parser(template), parent);
};
