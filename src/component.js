/* -.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.
* File Name   : component.js
* Created at  : 2017-07-24
* Updated at  : 2017-08-24
* Author      : jeefo
* Purpose     : Make possible to create a self contained web component.
* Description : Internal class of Jeefo-Framework's jeefo.directive module.
_._._._._._._._._._._._._._._._._._._._._.*/
// ignore:start

/* globals */
/* exported */

// ignore:end

// Doc {{{1
/**
 * @doc
 * ---------------------
 * Class Component
 * ---------------------
 * Constructor params:
 *   @param compiler -> Read from properties
 *
 *
 * @Properties:
 *   name             => Component itself name. (null)
 *   element          => Input Node element. (null)
 *   compiler         => Current module's container of definitions and $injector.
 *   definition       => Current component's definition. (null)
 *   directives       => Container of directive defitions and instances. ([])
 *   change_detectors => Container of current $element's change_detectors. ([])
 *
 *
 * @Methods:
 * # Public API
 *
 *   Compile ->
 *     Filter directives
 *     Compile Predirectives then
 *     Compile itself then
 *     Compile Post
 *
 *
 * # Private API
 *   
 *   Filter directives
 *     Sort directives by priority.
 *     Set pre_directives.
 */
// }}}1

// Variables {{{1
var assign       = require("jeefo_utils/object/assign"),
	$q           = assign({}, require("jeefo_q")),
	jqlite       = require("jeefo_jqlite"),
	parser       = require("./parser"),
	compiler     = require("./compiler"),
	$resource    = require("jeefo_resource"),
	$animator    = require("jeefo_animate"),
	constructor  = require("./constructor"),
	array_remove = require("jeefo_utils/array/remove"),

// Self component {{{1
find_controller = function (component, dependency) {
	if (parent.controller && parent.name === dependency) {
		return parent.controller;
	} else if (parent.parent) {
		return find_controller(parent.parent, dependency);
	}
},

compile_self = function (component) {
	if (! component.name) { return component; }

	// jshint latedef : false
	return $q.when(component).
		then(function (component) {
			/*
			var $attrs   = new Attributes(component.element),
				template = get_template(component.definition.template, component.element, $attrs);

			if (template) {
				return compile_template(component, template, $attrs);
			}

			var template_url = get_template(component.definition.template_url, component.element, $attrs);
			if (template_url) {
				return $resource.get_text(template_url).then(function (template) {
					return compile_template(component, template, $attrs);
				});
			}

			return compile_template(component, "<div></div>", $attrs);
			*/
			return component;
		}).
		then(function (component) {
			component.$element = jqlite(component.element);
			constructor(component, component);

			return component;
		});
},

// Post directives {{{1
compile_post = function (component) {
	if (component.name === "ui-view") {
		return component;
	} else if (! component.$element) {
		component.$element = jqlite(component.element);
	}

	var directives = component.directives, i = directives.length;

	i = directives.length;
	while (i--) {
		constructor(component, directives[i]);
	}

	return component;
},

// Listen events {{{1
listen_events = function (component) {
	var events   = component.events,
		$element = component.$element, i = events.length;

	while (i--) {
		$element.on(events[i].name, parser(component, events[i].handler).getter());
	}

	return component;
},

// Link {{{1
link = function (component) {
	return;
	if (self.is_terminated || ! self.definition) { return self; }

	if (self.definition.link) {
		var args = [], dependencies = self.definition.link.dependencies, i = dependencies.length;

		while (i--) {
			args[i] = find(self, dependencies[i]);
		}

		self.definition.link.fn.apply(self.controller, args);
	}

	self.definition = self.element = null;

	// jshint latedef : false
	return self;

	function find (component, dependency) {
		if (dependency === "$element") {
			return component.$element;
		}
		var ctrl;

		if (component === self) {
			switch (dependency.direction) {
				case '^' :
				case '^^' :
					ctrl = find(component.parent, dependency);
					break;
				default:
					console.error("UNImplemented");
			}
		} else {
			if (component.controller && component.name === dependency.name) {
				return component.controller;
			} else if (component.directives) {
				var i = component.directives.length;
				while (i--) {
					if (component.directives[i].controller && component.directives[i].name === dependency.name) {
						ctrl = component.directives[i].controller;
						break;
					}
				}
			}

			if (! ctrl) {
				ctrl = find(component.parent, dependency);
			}
		}

		if (! ctrl) {
			throw new Error("Directive not found in link");
		}

		return ctrl;
	}
	// jshint latedef : true
};
// }}}1

/**
 * @Properties:
 *   name             => Component itself name. (undefined)
 *   element          => Input Node element. (undefined)
 *   $element         => Compiled template's $element. (undefined)
 *   definition       => Current component's definition. (undefined)
 *   directives       => Container of directives. ([])
 *   change_detectors => Container of current component's change_detectors. ([])
 */
var Component = function (parent) {
	this.parent           = parent || null;
	this.events           = [];
	this.children         = [];
	this.directives       = [];
	this.change_detectors = [];
};

Component.prototype = {
	// Inherrit child component {{{1
	inherit : function () {
		return new Component(this);
	},

	// Compile {{{1
	compile : function () {
		this.parent.children.push(this);

		return $q.when(this).
			then(compile_self).
			then(compile_post).
			then(listen_events).
			then(link).
			$catch(function (reason) {
				switch (reason) {
					case "terminated" :
						break;
					default:
						console.error("COMPONENT flow has catched reason:", reason);
				}
			});
	},

	// Destroy {{{1
	destroy : function () {
		var i = this.change_detectors.length, change_detector;
		while (i--) {
			change_detector = this.change_detectors[i];
			if (change_detector.parent) {
				array_remove(change_detector.parent_change_detectors, change_detector.parent);
			}
		}

		if (this.controller && this.controller.on_destroy) {
			this.controller.on_destroy();
		}

		i = this.directives.length;
		while (i--) {
			if (this.directives[i].controller && this.directives[i].controller.on_destroy) {
				this.directives[i].controller.on_destroy();
			}
		}

		i = this.children.length;
		while (i--) {
			this.children[i].destroy();
		}

		if (this.is_transcluded && ! this.is_removed) {
			this.$element.remove();
		}
	},

	// Remove {{{1
	remove : function () {
		var self = this;
		self.destroy();
		array_remove(self.parent.children, self);
		$animator.leave(self.$element).$finally(function () {
			self.$element.remove();
		});
	},

	// Trigger render {{{1
	trigger_render : function () {
		if (this.controller && this.controller.on_render) {
			this.controller.on_render();
		}

		var i = this.directives.length;
		while (i--) {
			if (this.directives[i].controller && this.directives[i].controller.on_render) {
				this.directives[i].controller.on_render();
			}
		}

		i = this.children.length;
		while (i--) {
			this.children[i].trigger_render();
		}
	},
	// }}}1
};

export default Component;
