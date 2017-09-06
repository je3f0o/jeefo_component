/* -.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.
* File Name   : for_each_directive.js
* Created at  : 2017-07-25
* Updated at  : 2017-09-06
* Author      : jeefo
* Purpose     :
* Description :
_._._._._._._._._._._._._._._._._._._._._.*/

var jqlite        = require("jeefo_jqlite"),
	$animator     = require("jeefo_animate"),
	tokenizer     = require("jeefo_javascript_parser/src/es5/tokenizer"),
	compile_nodes = require("./compiler/nodes"),

parse_input = function (str) {
	tokenizer.init(str);
	var input = {}, token = tokenizer.next();

	if (token.type === "Identifier") {
		input.variable = token.name;
	}

	token = tokenizer.next();
	if (token.name === "in") {
		token = tokenizer.next();
	}

	if (token.type === "Identifier") {
		input.input = token.name;
	}

	return input;
};

module.exports = {
	priority   : 1000,
	selector   : "for-each",
	controller : {
		on_init : function ($parser, $component) {
			var code     = $component.attrs.values["for-each"],
				input    = parse_input(code),
				$element = $component.$element;

			this.name       = input.variable;
			this.$parser    = $parser(input.input);
			this.$component = $component;
			
			// Clone dom tree
			this.node = $component.node;

			// Insert comment before remove $element
			this.$comment = jqlite(document.createComment(" For each: " + code + ' '));
			$element.before(this.$comment[0]);

			// Remove element and reset component
			$element.remove();
			this.$last_element = this.$comment;

			this.on_digest();
		},
		on_digest : function () {
			var i             = 0,
				values        = this.$parser.get(),
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
					removed_components[i].children[0].remove();
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
			
			var element = compile_nodes([node], component).firstChild;
			component.$element = jqlite(element);

			this.$component.children[index] = component;
			this.$last_element.after(element);

			$animator.enter(component.$element, stagger_index);
		}
	}
};
