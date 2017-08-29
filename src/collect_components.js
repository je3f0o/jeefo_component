/* -.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.
* File Name   : collect_components.js
* Created at  : 2017-08-10
* Updated at  : 2017-08-30
* Author      : jeefo
* Purpose     :
* Description :
_._._._._._._._._._._._._._._._._._._._._.*/
// ignore:start

/* globals */
/* exported */

// ignore:end

var cache       = require("./cache"),
	parser      = require("jeefo_template/parser"),
	Directive   = require("./directive"),
	Component   = require("./component"),
	components  = require("components"),
	directives  = require("directives"),
	transcluder = require("./transcluder"),
	combine_template, collect_components,

sort_by_priority = function (a, b) {
	return b.definition.priority - a.definition.priority;
},

combine_pairs = function (pairs, other) {
	var keys = other.keys, i = keys.length;

	while (i--) {
		pairs.set(keys[i], other.values[keys[i]]);
	}

	return pairs;
},

combine_classes = function (class_list, other_list) {
	for (var i = 0; i < other_list.length; ++i) {
		class_list.add(other_list[i]);
	}

	return class_list;
},

transclude = function (nodes, children) {
	transcluder.find(nodes);

	for (var i = 0; i < children.length; ++i) {
		transcluder.add_node(children[i]);
	}

	transcluder.transclude();
};

combine_template = function (template, node) {
	if (typeof template === "function") {
		template = template(node);
		if (! template) {
			return;
		}
	}

	var nodes = parser(template), other = nodes[0];
	
	if (! node.id) {
		node.id = other.id;
	}

	// Reason why other's property first is, we want keep other's order
	node.attrs      = combine_pairs(other.attrs, node.attrs);
	node.events     = combine_pairs(other.events, node.events);
	node.class_list = combine_classes(other.class_list, node.class_list.list);

	if (other.children.length) {
		transclude(other.children, node.children);
		node.children = other.children;
	}
};

collect_components = function (nodes, container, parent, counter) {
	var i = 0, component = new Component(parent), j, keys, attrs, _parent, directive;

	for (; i < nodes.length; ++i) {
		attrs   = nodes[i].attrs;
		_parent = parent;

		if (components[nodes[i].name]) {
			component.name       = nodes[i].name;
			component.definition = cache.resolve_component(component.name);
			nodes[i].name        = "div";

			if (component.definition.template) {
				combine_template(component.definition.template, nodes[i]);
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

		if (component.name || nodes[i].events.keys.length || component.directives.length) {
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

		collect_components(nodes[i].children, container, _parent, counter);
	}
};

export default collect_components;
