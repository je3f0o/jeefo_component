/* -.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.
* File Name   : transcluder.js
* Created at  : 2017-08-26
* Updated at  : 2017-08-26
* Author      : jeefo
* Purpose     :
* Description :
_._._._._._._._._._._._._._._._._._._._._.*/

var Transcluder = function (target_node) {
	this.nodes  = [];
	this.target = target_node;
},
TranscludersMap = function () {
	this.reset();
};

Transcluder.prototype = {
	add : function (node) {
		node.parent = this.target.parent;
		this.nodes.push(node);
	},
	transclude : function () {
		var parent = this.target.parent,
			index  = parent.children.indexOf(this.target);

		parent.children.splice.apply(
			parent.children,
			[index, 1].concat(this.nodes)
		);
	}
};

TranscludersMap.prototype = {
	reset : function () {
		this.names               = [];
		this.transcluders        = {};
		this.default_transcluder = null;
	},

	find : function (nodes) {
		var i = nodes.length, name, attrs;

		while (i--) {
			if (nodes[i].name === "jf-content") {
				attrs = nodes[i].attrs;
				name  = attrs.keys.indexOf("select") === -1 ? null : attrs.values.select;

				this.add_transcluder(name, nodes[i]);
			} else {
				this.find(nodes[i].children);
			}
		}
	},

	add_transcluder : function (name, target_node) {
		var transcluder = new Transcluder(target_node);

		if (name === null) {
			name = "DEFAULT_TRANSCLUDER";
			this.default_transcluder = transcluder;
		}

		if (this.names.indexOf(name) !== -1) {
			throw new Error("Ambigious " + name + " transcluder detected.");
		}

		this.names.push(name);
		this.transcluders[name] = transcluder;
	},

	add_node : function (node) {
		var name = node.name;
		
		if (this.transcluders[name]) {
			this.transcluders[name].add(node);
		} else if (this.default_transcluder) {
			this.default_transcluder.add(node);
		} else {
			throw new Error("Transcluder is not found");
		}
	},

	transclude : function () {
		var i = this.names.length;

		while (i--) {
			this.transcluders[this.names[i]].transclude();
		}

		this.reset();
	}
};

module.exports = new TranscludersMap();
