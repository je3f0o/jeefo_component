/* -.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.
* File Name   : if_directive.js
* Created at  : 2017-09-17
* Updated at  : 2017-11-06
* Author      : jeefo
* Purpose     :
* Description :
_._._._._._._._._._._._._._._._._._._._._.*/

var Input         = require("../input"),
	jqlite        = require("jeefo_jqlite"),
	$animator     = require("jeefo_animate"),
	compile_nodes = require("../compiler/nodes");

module.exports = {
	priority : 900,
	selector : "if",
	bindings : {
		$condition : "@if"
	},
	controller : {
		on_init : function ($component) {
			this.$input     = new Input($component, this.$condition);
			this.$component = $component;
			
			// Clone dom tree
			this.node = $component.node;

			// Insert comment before remove $element
			this.$comment = jqlite(document.createComment(" If : " + this.$condition + ' '));
			$component.$element.before(this.$comment[0]);
			$component.$element.remove();

			this.on_digest();
		},
		on_digest : function () {
			if (this.$input.invoke()) {
				if (! this.$is_rendered) {
					this.create_component();
					this.$is_rendered = true;
				}
			} else if (this.$is_rendered) {
				this.$component.children[0].remove();
				this.$is_rendered = false;
			}
		},
		create_component : function () {
			var self      = this,
				node      = self.node.clone(),
				comment   = self.$comment,
				component = self.$component.inherit();

			compile_nodes([node], component).then(function (fragment) {
				component.$element = jqlite(fragment.firstChild);

				comment.after(fragment);
				self.$component.children.push(component);

				component.trigger_render();
			});
		},
	}
};
