/* -.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.
* File Name   : for_each_directive.js
* Created at  : 2017-07-25
* Updated at  : 2017-11-01
* Author      : jeefo
* Purpose     :
* Description :
_._._._._._._._._._._._._._._._._._._._._.*/

var Input         = require("../input"),
	jqlite        = require("jeefo_jqlite"),
	parser        = require("../input/parser"),
	$animator     = require("jeefo_animate"),
	compile_nodes = require("../compiler/nodes");

var add_children = function (instance, values) {
	var i        = values.length,
		prop     = instance.$variable,
		_values  = [],
		children = instance.$component.children,
		stagger_index = 0, value, index;

	while (i--) {
		_values[i] = values[i];
	}

	i = children.length;
	while (i--) {
		value = children[i].controller[prop];
		index = _values.indexOf(value);
		if (index !== -1) {
			_values.splice(index, 1);
		}
	}

	for (i = 0; i < _values.length; ++i) {
		value = _values[i];
		index = values.indexOf(value);

		instance.create_component(index, value, stagger_index++);
	}
};

var remove_children = function (children, values, prop) {
	var i = children.length, _children = [], value, index;

	while (i--) {
		_children[i] = children[i];
	}

	i = _children.length;
	while (i--) {
		value = _children[i].controller[prop];
		index = values.indexOf(value);
		if (index !== -1) {
			_children.splice(i, 1);
		}
	}

	i = _children.length;
	while (i--) {
		_children[i].remove();
	}

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
			this.$last_element = this.$comment;

			this.$children = [];

			this.on_digest();
		},
		on_digest : function () {
			var values   = this.$input.invoke(),
				children = this.$component.children;

			if (! values) { return; }

			if (values.length < children.length) {
				remove_children(children, values, this.$variable);
			} else if (values.length > children.length) {
				add_children(this, values);
			} else {
				var i = values.length;
				while (i--) {
					children[i].controller.$index          = i;
					children[i].controller[this.$variable] = values[i];
				}
			}

			if (children.length) {
				this.$last_element = children[children.length - 1].$element;
			}
		},
		create_component : function (index, value, stagger_index) {
			var self      = this,
				node      = self.node.clone(),
				component = self.$component.inherit();

			component.controller    = { $index : index };
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
