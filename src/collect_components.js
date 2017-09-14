/* -.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.
* File Name   : collect_components.js
* Created at  : 2017-08-10
* Updated at  : 2017-09-14
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
	shived      = {},
	Directive   = require("./directive"),
	Component   = require("./component"),
	components  = require("components"),
	directives  = require("directives"),
	transcluder = require("./transcluder"),
	combine_template, collect_components,

transclude = function (nodes, children) {
	transcluder.find(nodes);

	for (var i = 0; i < children.length; ++i) {
		transcluder.add_node(children[i]);
	}

	transcluder.transclude();
},

structural_directive = function (attrs) {
	var keys = attrs.keys, i = keys.length, max_priority = 0,
		definition, result;

	while (i--) {
		if (directives[keys[i]]) {
			definition = cache.resolve_directive(keys[i]);
			if (definition.priority > max_priority) {
				result = { name : keys[i], definition : definition };
			}
		}
	}

	if (result) {
		attrs.remove(result.name);
	}

	return result;
};

combine_template = function (template, node) {
	if (typeof template === "function") {
		template = template(node);
		if (! template) {
			return node;
		}
	}

	return parser(template);
};

collect_components = function (nodes, container, parent, counter) {
	var i = 0, component = new Component(parent),
		j, keys, name, attrs, others, _parent, directive;

	for (; i < nodes.length; ++i) {
		name    = nodes[i].name;
		_parent = parent;

		// Structural directive
		directive = structural_directive(nodes[i].attrs);
		if (directive) {
			counter.increment();

			component.id    = nodes[i].component_id = counter.id;
			component.attrs = nodes[i].attrs;

			component.node       = nodes[i].clone();
			component.name       = directive.name;
			component.definition = directive.definition;

			nodes[i].clear();

			container.push(component);
			component = new Component(parent);

			continue;
		}

		// Component
		if (components[name]) {
			component.name       = name;
			component.definition = cache.resolve_component(name);

			if (component.definition.template) {
				others = combine_template(component.definition.template, nodes[i]);

				if (nodes[i] !== others) {
					transclude(others, nodes[i].children);
					nodes[i].children = others;
				}
			}
		}

		// Normal directives
		attrs = nodes[i].attrs;
		keys  = attrs.keys;
		j     = keys.length;
		while (j--) {
			if (directives[keys[j]]) {
				component.directives.push(
					new Directive(keys[j], cache.resolve_directive(keys[j]))
				);
			}
		}

		if (component.name && ! shived[component.name]) {
			document.createElement(component.name);
			shived[component.name] = true;
		}
		if (! nodes[i].name) {
			nodes[i].name = component.name || "div";
		}

		if (component.name || nodes[i].events.keys.length || component.directives.length) {
			counter.increment();

			component.id     = nodes[i].component_id = counter.id;
			component.attrs  = attrs;
			component.events = nodes[i].events;

			j = component.directives.length;
			while (j--) {
				attrs.remove(component.directives[j].name);
			}

			_parent = component;
			container.push(component);

			component = new Component(parent);
		}

		collect_components(nodes[i].children, container, _parent, counter);
	}
};

export default collect_components;
