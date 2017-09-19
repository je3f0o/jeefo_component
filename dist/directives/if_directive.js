/* -.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.
* File Name   : if_directive.js
* Created at  : 2017-09-17
* Updated at  : 2017-09-19
* Author      : jeefo
* Purpose     :
* Description :
_._._._._._._._._._._._._._._._._._._._._.*/

var Input         = require("./input"),
	parser        = require("./parser"),
	jqlite        = require("jeefo_jqlite"),
	$animator     = require("jeefo_animate"),
	compile_nodes = require("../compiler/nodes"),

build = function (input, code) {
	var expr = parser.parse(code)[0].expression;

	input.init(code);
	code = input.compile(expr);

	input.build_getter(code);
};

module.exports = {
	priority : 900,
	selector : "if",
	bindings : {
		$condition : "@if"
	},
	controller : {
		on_init : function ($parser, $component) {
			this.$input     = new Input($parser);
			this.$component = $component;

			build(this.$input, this.$condition);
			
			// Clone dom tree
			this.node = $component.node;

			// Insert comment before remove $element
			this.$comment = jqlite(document.createComment(" If : " + this.$condition + ' '));
			$component.$element.before(this.$comment[0]);
			$component.$element.remove();

			this.on_change();
		},
		on_change : function () {
			if (this.$input.get()) {
				if (! this.$is_rendered) {
					this.create_component();
					this.$is_rendered = true;
				}
			} else if (this.$is_rendered) {

			}
		},
		create_component : function () {
			var node = this.node.clone();

			this.$child_component = this.$component.inherit();

			var element = compile_nodes([node], this.$child_component).firstChild;
			this.$comment.after(element);

			this.$child_component.trigger_render();
		},
		on_render : function () {
			if (this.$child_component) {
				this.$child_component.trigger_render();
			}
		}
	}
};
