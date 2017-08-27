/* -.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.
* File Name   : build_nodes.js
* Created at  : 2017-08-26
* Updated at  : 2017-08-26
* Author      : jeefo
* Purpose     :
* Description :
_._._._._._._._._._._._._._._._._._._._._.*/

var EVENT_REGEX = require("../config").EVENT_REGEX,
	NodeElement = require("jeefo_template/node_element");

module.exports = function build_nodes (parent, element) {
	var attrs    = element.attributes,
		children = element.childNodes,
		i = 0, node, name, match, content = '';

	for (; i < children.length; ++i) {
		switch (children[i].nodeType) {
			case 3 :
				content += children[i].nodeValue;
				break;
			case 1 :
				node = new NodeElement({
					name : children[i].tagName.toLowerCase()
				});
				build_nodes(node, children[i]);

				parent.children.push(node);
				break;
		}
	}

	if (! parent.children.length) {
		parent.content = content;
	}

	i = attrs.length;
	while (i--) {
		name  = attrs[i].name;
		match = name.match(EVENT_REGEX);

		if (match) {
			parent.events.set(match[1], attrs[i].value);
		} else {
			parent.attrs.set(name, attrs[i].value);
		}
	}
};
