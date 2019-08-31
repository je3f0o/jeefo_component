/* -.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.
* File Name   : collect_components.js
* Created at  : 2017-08-10
* Updated at  : 2018-12-19
* Author      : jeefo
* Purpose     :
* Description :
_._._._._._._._._._._._._._._._._._._._._.*/
// ignore:start
"use strict";

/* globals */
/* exported */

// @TODO: use Preprocessor instread bunch of nodes[i]
/* do i really need to shiv elements in 2017 ???
	shived            = {},

	if (component.name && ! shived[component.name]) {
		document.createElement(component.name);
		shived[component.name] = true;
	}
*/

//PP.define("current_node",,)

// ignore:end

var $q                = require("jeefo/q"),
	cache             = require("./cache"),
	Directive         = require("./directive"),
	Component         = require("./component"),
	components        = require("components"),
	directives        = require("directives"),
	transcluder       = require("./transcluder"),
	template_resolver = require("./template_resolver"),
	collect_components,

transclude = function (nodes, children) {
	transcluder.initialize(nodes);

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
},

make_template_resolver = function (nodes, i, container, _parent, counter) {
	var node = nodes[i].clone();

	nodes[i].clear();

	return function (others) {
		var local_promises = [];
		if (node.children.length) {
			transclude(others, node.children);
		}

		node.children    = others;
		node.is_resolved = true;

		collect_components([node], container, local_promises, _parent, counter);

		return $q.all(local_promises).then(function () {
			nodes[i] = node;
		});
	};
};

collect_components = function (nodes, container, promises, parent, counter) {
	var i = 0, component = new Component(parent),
		j, keys, name, attrs, others, promise, _parent, directive, current_node;

	for (; i < nodes.length; ++i) {
		current_node = nodes[i];
		name    = current_node.name;
		_parent = parent;

		// Structural directive
		directive = structural_directive(current_node.attrs);
		if (directive) {
			counter.increment();

			component.id    = current_node.component_id = counter.id;
			component.attrs = current_node.attrs;

			component.node       = current_node.clone();
			component.name       = directive.name;
			component.definition = directive.definition;

			current_node.clear();

			container.push(component);
			component = new Component(parent);

			continue;
		}

		// Component
		if (components[name]) {
			component.name       = name;
			component.definition = cache.resolve_component(name);

			if (component.definition.template) {
				others = template_resolver.resolve_template(component.definition.template, current_node);

				if (current_node !== others) {
					if (current_node.children.length) {
						transclude(others, current_node.children);
						current_node.children = others;
					} else {
						transcluder.initialize(nodes);
						//transcluder.default_transcluder
					}
				}
			} else if (component.definition.template_url && ! current_node.is_resolved) {
				promise = template_resolver.resolve_template_url(component.definition.template_url, current_node).
					then(make_template_resolver(nodes, i, container, parent, counter));

				promises.push(promise);

				component.name = null;
			}
		}

		// Normal directives
		attrs = current_node.attrs;
		keys  = attrs.keys;
		j     = keys.length;
		while (j--) {
			if (directives[keys[j]]) {
				component.directives.push(
					new Directive(keys[j], cache.resolve_directive(keys[j]))
				);
			}
		}

		if (! current_node.name) {
			current_node.name = component.name || "div";
		}

		if (component.name || current_node.events.keys.length || component.directives.length) {
			counter.increment();

			component.id     = current_node.component_id = counter.id;
			component.attrs  = attrs;
			component.events = current_node.events;

			j = component.directives.length;
			while (j--) {
				attrs.remove(component.directives[j].name);
			}

			_parent = component;
			container.push(component);

			component = new Component(parent);
		}

		collect_components(current_node.children, container, promises, _parent, counter);
	}
};

export default collect_components;
