/* -.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.
* File Name   : for_each_directive.js
* Created at  : 2017-07-25
* Updated at  : 2017-09-20
* Author      : jeefo
* Purpose     :
* Description :
_._._._._._._._._._._._._._._._._._._._._.*/
// ignore:start

/* globals */
/* exported */

// ignore:end

var Input         = require("./input"),
	parser        = require("./parser"),
	jqlite        = require("jeefo_jqlite"),
	$animator     = require("jeefo_animate"),
	compile_nodes = require("../compiler/nodes");

var build = function (input, code) {
	var expr = parser.parse(code)[0].expression;

	input.name = expr.left.name;

	input.init(code);
	code = input.compile(expr.right);

	input.build_getter(code);
};

export default {
	priority : 1000,
	selector : "for-each",
	bindings : {
		$expr : "@forEach"
	},
	controller : {
		on_init : function ($parser, $component) {
			this.$input     = new Input($parser);
			this.$component = $component;

			build(this.$input, this.$expr);
			
			// Clone dom tree
			this.node = $component.node;

			// Insert comment before remove $element
			this.$comment = jqlite(document.createComment(` For each: ${ this.$expr } `));
			$component.$element.before(this.$comment[0]);

			// Remove element and reset component
			$component.$element.remove();
			this.$last_element = this.$comment;

			this.$children = [];

			this.on_digest();
		},
		on_digest : function () {
			var i             = 0,
				values        = this.$input.get(),
				children      = this.$component.children,
				stagger_index = 0,
				removed_components;

			if (! values) { return; }

			this.$last_element = this.$comment;
			for (; i < values.length; ++i) {
				if (children[i]) {
					children[i].controller.$index     = i;
					children[i].controller[this.name] = values[i];
				} else {
					this.create_component(i, values[i], stagger_index++);
				}

				this.$last_element = children[i].$element;
			}

			if (i < children.length) {
				removed_components = children.splice(i);
				i = removed_components.length;
				while (i--) {
					removed_components[i].children[0].remove();
				}

				if (children.length) {
					this.$last_element = children[children.length - 1].$element;
				}
			}
		},
		create_component : function (index, value, stagger_index) {
			var self      = this,
				node      = self.node.clone(),
				component = self.$component.inherit();

			component.controller    = { $index : index };
			component.controller_as = self.name;
			component.controller[self.$input.name] = value;
			
			compile_nodes([node], component).then(function (fragment) {
				component.$element = jqlite(fragment.firstChild);

				self.$component.children[index] = component;
				self.$last_element.after(fragment);

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
