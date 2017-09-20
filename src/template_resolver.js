/* -.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.
* File Name   : template_resolver.js
* Created at  : 2017-09-20
* Updated at  : 2017-09-20
* Author      : jeefo
* Purpose     :
* Description :
_._._._._._._._._._._._._._._._._._._._._.*/
// ignore:start

/* globals */
/* exported */

// ignore:end

var	$q        = require("jeefo/q"),
	cache     = require("./template_cache"),
	parser    = require("jeefo_template/parser"),
	$resource = require("jeefo/resource");

var clone_nodes = function (nodes) {
	var i = nodes.length, result = [];

	while (i--) {
		result[i] = nodes[i].clone();
	}

	return result;
};

exports.resolve_template = function (template, node) {
	if (IS_FUNCTION(template)) {
		template = template(node);
		if (! template) {
			return node;
		}
	}

	return parser(template);
};

exports.resolve_template_url = function (url, args) {
	var to_cache;

	if (IS_FUNCTION(url)) {
		url = args ? url.apply(url, args) : url();
	} else if (cache[url]) {
		return $q.when(clone_nodes(cache[url]));
	} else {
		to_cache = true;
	}

	return $resource.get_text(url).then(function (template) {
		if (to_cache) {
			cache[url] = parser(template);
			return clone_nodes(cache[url]);
		}
		return parser(template);
	});
};
