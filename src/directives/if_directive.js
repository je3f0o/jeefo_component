/* -.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.
* File Name   : if_directive.js
* Created at  : 2017-09-17
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
	compile_nodes = require("../compiler/nodes"),

build = function (input, code) {
	var expr = parser.parse(code)[0].expression;

	input.init(code);
	code = input.compile(expr);

	input.build_getter(code);
};

export default {
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
			this.$comment = jqlite(document.createComment(` If : ${ this.$condition } `));
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
			var node            = this.node.clone(),
				comment         = this.$comment,
				child_component = this.$child_component = this.$component.inherit();

			compile_nodes([node], this.$child_component).then(function (fragment) {
				comment.after(fragment);
				child_component.trigger_render();
			});
		},
		on_render : function () {
			if (this.$child_component) {
				this.$child_component.trigger_render();
			}
		}
	}
};
