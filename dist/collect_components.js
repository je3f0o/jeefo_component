/* -.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.
* File Name   : collect_components.js
* Created at  : 2017-08-10
* Updated at  : 2017-08-24
* Author      : jeefo
* Purpose     :
* Description :
_._._._._._._._._._._._._._._._._._._._._.*/

// Polyfill {{{1
(function(constructor) {
	if (! constructor.prototype.firstElementChild) {
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

var cache      = require("./cache"),
	parser     = require("jeefo_template/parser"),
	Directive  = require("./directive"),
	Component  = require("./component"),
	components = require("components"),
	directives = require("directives"),
	combine_template, collect_from_jeefo_nodes,

sort_by_priority = function (a, b) {
	return b.definition.priority - a.definition.priority;
},

combine_attrs = function (attrs, other_attrs) {
	var keys = other_attrs.keys, i = keys.length;
	while (i--) {
		attrs.set(keys[i], other_attrs.values[keys[i]]);
	}

	return attrs;
},

combine_classes = function (class_list, other) {
	var i = other.length;
	while (i--) {
		if (class_list.indexOf(other[i]) !== -1) {
			class_list.push(other[i]);
		}
	}

	return class_list;
},

find_transcluders = function (nodes, container) {
	var i = nodes.length, j, keys, attrs;
	while (i--) {
		if (nodes[i].name === "jf-content") {
			attrs = nodes[i].attrs;
			keys = attrs.keys;

			j = keys.length;
			while (j--) {
				if (keys[j] === "select") {
					nodes[i].name = attrs.values[keys[j]];
				}
			}

			container.push(nodes[i]);
		} else {
			find_transcluders(nodes[i].children, container);
		}
	}
},

transcluder = function (node, other) {
	if (! other.children.length) {
		return;
	}

	var i = other.children.length,
		children = node.children,
		transcluders = [],
		j, default_transcluder, nodes, index, transcluder;

	node.children = other.children;
	while (i--) {
		other.children[i].parent = node;
	}

	find_transcluders(node.children, transcluders);

	i = transcluders.length;
	while (i--) {
		if (transcluders[i].name === "jf-content") {
			if (default_transcluder) {
				throw new Error("Ambigious");
			}
			default_transcluder = transcluders[i];
			transcluders.splice(i, 1);
		}
	}

	i = transcluders.length;
	while (i--) {
		transcluder = transcluders[i];

		nodes = [];
		index = transcluder.parent.children.indexOf(transcluder);

		j = children.length;
		while (j--) {
			if (children[j].name === transcluder.name) {
				children[j].parent = transcluder.parent;
				nodes.push(children[j]);
				children.splice(j, 1);
			}
		}

		transcluder.parent.children.splice.apply(
			transcluder.parent.children,
			[index, 1].concat(nodes)
		);
	}
	
	i = children.length;
	while (i--) {
		children[i].parent = default_transcluder.parent;
	}

	index = default_transcluder.parent.children.indexOf(default_transcluder);
	default_transcluder.parent.children.splice.apply(
		default_transcluder.parent.children,
		[index, 1].concat(children)
	);
};

combine_template = function (template, node, container, counter) {
	if (typeof template === "function") {
		template = template(node);
		if (! template) {
			return;
		}
	}
	var nodes = parser(template), other = nodes[0];
	
	collect_from_jeefo_nodes(nodes, container, parent, counter);

	node.id         = other.id;
	node.attrs      = combine_attrs(other.attrs, node.attrs);
	node.class_list = combine_classes(other.class_list, node.class_list);
	transcluder(node, other);
};

collect_from_jeefo_nodes = function (nodes, container, parent, counter) {
	var i = 0, component = new Component(parent), j, keys, attrs, _parent, directive;

	for (; i < nodes.length; ++i) {
		attrs   = nodes[i].attrs;
		_parent = parent;

		if (components[nodes[i].name]) {
			component.name       = nodes[i].name;
			component.definition = cache.resolve_component(component.name);
			nodes[i].name        = "div";

			if (component.definition.template) {
				combine_template(component.definition.template, nodes[i], container, counter);
			}
		}

		keys = attrs.keys;
		j    = keys.length;
		while (j--) {
			if (directives[keys[j]]) {
				component.directives.push(
					new Directive(keys[j], cache.resolve_directive(keys[j]))
				);
			}
		}

		if (component.name || nodes[i].events.length || component.directives.length) {
			counter.increment();

			component.id    = nodes[i].component_id = counter.id;
			component.attrs = attrs;

			component.directives.sort(sort_by_priority);
			directive = component.directives[0];
			if (directive && directive.definition.priority) {
				attrs.remove(directive.name);

				component.node       = nodes[i].clone();
				component.name       = directive.name;
				component.definition = directive.definition;
				component.directives = [];

				nodes[i].clear();
			} else {
				j = component.directives.length;
				while (j--) {
					attrs.remove(component.directives[j].name);
				}
				component.events = nodes[i].events;
			}

			_parent = component;
			container.push(component);

			component = new Component(parent);
		}

		collect_from_jeefo_nodes(nodes[i].children, container, _parent, counter);
	}
};

exports.from_element = function collect_components (element, container, parent) {
	var node      = element.firstElementChild,
		component = new Component(parent),
		i, name, attrs, is_component;

	while (node) {
		name         = node.tagName.toLowerCase();
		is_component = false;

		if (components[name]) {
			is_component         = true;
			component.name       = name;
			component.definition = cache.resolve_component(name);
		}

		for (i = 0, attrs = node.attributes; i < attrs.length; ++i) {
			name = attrs[i].name;
			if (directives[name]) {
				component.directives.push(new Directive(name, cache.resolve_directive(name)));
			}
		}

		if (component.name || component.directives.length) {
			component.element = node;
			container[container.length] = component;
			component = new Component();
		}

		if (! is_component) {
			collect_components(node, container, parent);
		}
		node = node.nextElementSibling;
	}
};

var compile_from_nodes = exports.from_nodes = function (nodes, container, parent, counter) {
	var i = nodes.length, template = '';
	collect_from_jeefo_nodes(nodes, container, parent, counter);

	while (i--) {
		template = nodes[i].compile() + template;
	}
	console.log(template);

	return template;
};

exports.from_template = function (template, container, parent, counter) {
	return compile_from_nodes(parser(template), container, parent, counter);
};
