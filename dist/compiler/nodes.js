/* -.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.
* File Name   : nodes.js
* Created at  : 2017-08-26
* Updated at  : 2017-09-20
* Author      : jeefo
* Purpose     :
* Description :
_._._._._._._._._._._._._._._._._._._._._.*/

var $q                 = require("jeefo/q"),
	jqlite             = require("jeefo_jqlite"),
	counter            = require("../counter"),
	collect_components = require("../collect_components");

var compile_fragment = function (nodes, subcomponents) {
	var i = nodes.length, fragment = document.createDocumentFragment(), template = '';

	while (i--) {
		template = nodes[i].compile('', '') + template;
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
};

/**
 * @doc
 * @param template : jeefo template string.
 * @param parent   : parent directive object.
 * @return Document fragment object
 */
module.exports = function compile_nodes (nodes, parent) {
	var promises = [], subcomponents = [];

	collect_components(nodes, subcomponents, promises, parent, counter);

	return $q.all(promises).then(function () {
		return compile_fragment(nodes, subcomponents);
	});
};
