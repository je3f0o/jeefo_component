/* -.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.
* File Name   : for_each_directive.js
* Created at  : 2017-07-25
* Updated at  : 2017-08-24
* Author      : jeefo
* Purpose     :
* Description :
_._._._._._._._._._._._._._._._._._._._._.*/

var jqlite        = require("jeefo_jqlite"),
	$animator     = require("jeefo_animate"),
	compile_nodes = require("./compiler").compile_nodes;

module.exports = {
	priority   : 1000,
	selector   : "for-each",
	controller : {
		on_init : function ($parser, $component) {
			var $element = $component.$element;

			this.$parser    = $parser("tabs"); // hard coded
			this.$component = $component;

			this.name    = "tab"; // hard coded
			this.code    = $element[0].getAttribute("for-each");
			
			// Clone dom tree
			this.node = $component.node;

			// Insert comment before remove $element
			this.$comment = jqlite(document.createComment(" For each: " + this.code + ' '));
			$element.before(this.$comment[0]);

			// Remove element and reset component
			$element.remove();
			this.$last_element = this.$comment;

			this.on_digest();
		},
		on_digest : function () {
			var i             = 0,
				values        = this.$parser.getter(),
				children      = this.$component.children,
				stagger_index = 0,
				removed_components;

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
					removed_components[i].remove();
				}

				if (children.length) {
					this.$last_element = children[children.length - 1].$element;
				}
			}
		},
		create_component : function (index, value, stagger_index) {
			var node      = this.node.clone(),
				component = this.$component.inherit();

			component.controller    = { $index : index };
			component.controller_as = this.name;
			component.controller[this.name] = value;
			
			var fragment = compile_nodes([node], component);
			component.$element = jqlite(fragment.firstChild);

			this.$component.children[index] = component;
			this.$last_element.after(component.$element[0]);

			$animator.enter(component.$element, stagger_index);
		},
	}
};
