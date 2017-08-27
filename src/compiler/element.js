/* -.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.
* File Name   : element.js
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

// Polyfill {{{1
(function(constructor) {
	if (! ("firstElementChild" in constructor.prototype)) {
		Object.defineProperty(constructor.prototype, "firstElementChild", {
			get : function () {
				var node = this.firstChild;
				while (node && 1 !== node.nodeType) { node = node.nextSibling; }
				return node;
			}
		});
	}
}(window.Node || window.Element));

if (! ("nextElementSibling" in document.documentElement)) {
	Object.defineProperty(Element.prototype, "nextElementSibling", {
		get : function () {
			var node = this.nextSibling;
			while (node && node.nodeType !== 1) { node = node.nextSibling; }
			return node;
		}
	});
}
// }}}1

var cache              = require("../cache"),
	jqlite             = require("jeefo_jqlite"),
	counter            = require("../counter"),
	Directive          = require("../directive"),
	Component          = require("../component"),
	components         = require("components"),
	directives         = require("directives"),
	build_nodes        = require("./build_nodes"),
	NodeElement        = require("jeefo_template/node_element"),
	EVENT_REGEX        = require("../config").EVENT_REGEX,
	collect_components = require("../collect_components"),

collect_components_from_element = function (element, container, parent, counter) {
	var node      = element.firstElementChild,
		component = new Component(parent),
		i, name, attrs, match, _parent, $old_element;

	while (node) {
		name    = node.tagName.toLowerCase();
		_parent = parent;

		// Replace node element
		if (components[name]) {
			$old_element = jqlite(node);

			node = new NodeElement({ name : name });
			build_nodes(node, $old_element[0]);

			collect_components([node], container, parent, counter);
			node = jqlite(node.compile('', ''))[0];

			$old_element.replace_with(node);
		} else {
			// Original node element
			for (i = 0, attrs = node.attributes; i < attrs.length; ++i) {
				name  = attrs[i].name;
				match = name.match(EVENT_REGEX);

				if (match) {
					component.events.push({
						name    : match[1],
						handler : attrs[i].value
					});
				} else if (directives[name]) {
					component.directives.push(new Directive(name, cache.resolve_directive(name)));
				}
			}
		}

		if (component.events.keys.length || component.directives.length) {
			counter.increment();

			component.id      = counter.id;
			component.element = node;

			_parent = component;
			container.push(component);

			component = new Component(parent);
		} else {
			collect_components_from_element(node, container, parent, counter);
		}

		node = node.nextElementSibling;
	}
};

export default function compile_element (element, parent) {
	var subcomponents = [];

	collect_components_from_element(element, subcomponents, parent, counter);

	var elements = element.querySelectorAll("[jeefo-component-id]"),
		i = elements.length, map = {}, id;

	while (i--) {
		id = elements[i].getAttribute("jeefo-component-id");
		map[id] = elements[i];
	}

	// Compile subdirectives
	for (i = 0; i < subcomponents.length; ++i) {
		id = subcomponents[i].id;
		subcomponents[i].element = map[id];

		subcomponents[i].compile();
	}
}
