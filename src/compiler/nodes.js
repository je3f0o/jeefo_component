/* -.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.
* File Name   : nodes.js
* Created at  : 2017-08-26
* Updated at  : 2017-08-26
* Author      : jeefo
* Purpose     :
* Description :
_._._._._._._._._._._._._._._._._._._._._.*/
// ignore:start

/* globals */
/* exported */

// ignore:end

var jqlite             = require("jeefo_jqlite"),
	counter            = require("../counter"),
	collect_components = require("../collect_components");

/**
 * @doc
 * @param template : jeefo template string.
 * @param parent   : parent directive object.
 * @return Document fragment object
 */
export default function compile_nodes (nodes, parent) {
	var i = nodes.length, fragment = document.createDocumentFragment(), subcomponents = [], template = '';

	collect_components(nodes, subcomponents, parent, counter);
	while (i--) {
		template = `${ nodes[i].compile('', '') }${ template }`;
	}

	var $element = jqlite(template);
	for (i = 0; i < $element.length; ++i) {
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
}
