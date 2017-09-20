/* -.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.
* File Name   : element.js
* Created at  : 2017-08-26
* Updated at  : 2017-09-20
* Author      : jeefo
* Purpose     :
* Description :
_._._._._._._._._._._._._._._._._._._._._.*/

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

var $q                 = require("jeefo/q"),
	cache              = require("../cache"),
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

make_template_resolver = function (node, name, container, promises, parent, counter) {
	var $old_element = jqlite(node), local_promises = [];

	node = [ new NodeElement({ name : name }) ];
	build_nodes(node[0], $old_element[0]);

	collect_components(node, container, local_promises, parent, counter);

	var promise = $q.all(local_promises).then(function () {
		node = jqlite(node[0].compile('', ''))[0];
		$old_element.replace_with(node);
	});

	promises.push(promise);
},

collect_components_from_element = function (element, container, promises, parent, counter) {
	var node      = element.firstElementChild,
		component = new Component(parent),
		i, name, attrs, match, _parent;

	while (node) {
		name    = node.tagName.toLowerCase();
		_parent = parent;

		// Replace node element
		if (components[name]) {
			make_template_resolver(node, name, container, promises, parent, counter);
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
			collect_components_from_element(node, container, promises, parent, counter);
		}

		node = node.nextElementSibling;
	}
};

module.exports = function compile_element (element, parent) {
	var subcomponents = [], promises = [];

	collect_components_from_element(element, subcomponents, promises, parent, counter);

	$q.all(promises).then(function () {
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
	});
};
