/* -.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.
* File Name   : for_each_directive.js
* Created at  : 2017-07-25
* Updated at  : 2017-11-18
* Author      : jeefo
* Purpose     :
* Description :
_._._._._._._._._._._._._._._._._._._._._.*/

var Input         = require("../input"),
	jqlite        = require("jeefo_jqlite"),
	parser        = require("../input/parser"),
	$animator     = require("jeefo_animate"),
	compile_nodes = require("../compiler/nodes");

var digest_handler = function (instance, values) {
	var prop          = instance.$variable,
		children      = instance.$component.children,
		old_values    = [],
		stagger_index = 0,
		i = children.length, value, index;
	
	// remove old values
	while (i--) {
		value = children[i].controller[prop];
		index = values.indexOf(value);
		if (index === -1) {
			children[i].remove();
		} else {
			old_values.push(value);
		}
	}

	// add new values
	for (i = 0; i < values.length; ++i) {
		value = values[i];
		index = old_values.indexOf(value);
		if (index === -1) {
			instance.create_component(i, value, stagger_index++);
		}
	}

	// order
	i = children.length;
	while (i--) {
		children[i].controller.$index = i;
	}
};

module.exports = {
	priority : 1000,
	selector : "for-each",
	bindings : {
		$expr : "@forEach"
	},
	controller : {
		on_init : function ($component) {
			this.$component = $component;

			var expr = parser.parse(this.$expr)[0].expression;

			this.$input    = new Input($component, this.$expr.substring(expr.right.start.index));
			this.$variable = expr.left.name;
			
			// Clone dom tree
			this.node = $component.node;

			// Insert comment before remove $element
			this.$comment = jqlite(document.createComment(" For each: " + this.$expr + ' '));
			$component.$element.before(this.$comment[0]);

			// Remove element and reset component
			$component.$element.remove();

			this.$children = [];

			this.on_digest();
		},
		on_digest : function () {
			var values = this.$input.invoke();

			if (! values) { return; }

			digest_handler(this, values);
		},
		create_component : function (index, value, stagger_index) {
			var self      = this,
				node      = self.node.clone(),
				component = self.$component.inherit();

			component.controller    = {};
			component.controller_as = self.name;
			component.controller[self.$variable] = value;
			
			compile_nodes([node], component).then(function (fragment) {
				component.$element = jqlite(fragment.firstChild);

				if (self.$component.children[index - 1]) {
					self.$component.children[index - 1].$element.after(fragment);
				} else {
					self.$comment.after(fragment);
				}
				self.$component.children.splice(index, 0, component);

				/*
				if (self.$component.children.length) {
					var index = self.$component.children.length - 1;
					self.$component.children[index].$element.after(fragment);
				} else {
					self.$comment.after(fragment);
				}
				self.$component.children.push(component);
				*/

				$animator.enter(component.$element, stagger_index);

				self.$children.push(component);
			});
		},
		on_render : function () {
			if (this.$children.length) {
				for (var i = 0; i < this.$children.length; ++i) {
					this.$children[i].trigger_render();
				}
				this.$children = [];
			}
		}
	}
};
