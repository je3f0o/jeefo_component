/* -.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.
* File Name   : build.js
* Created at  : 2017-08-24
* Updated at  : 2017-10-02
* Author      : jeefo
* Purpose     :
* Description :
_._._._._._._._._._._._._._._._._._._._._.*/
// ignore:start
"use strict";

/* globals */
/* exported */

// ignore:end

var fs   = require("fs"),
	pp   = require("jeefo_preprocessor").es6.clone(),
	path = require("path");

pp.actions.register("Comment", (_pp, token) => {
	switch (token.comment) {
		case "ignore:start" :
			_pp.state.ignore = {
				type  : "remove",
				start : token.start.index
			};
			break;
		case "ignore:end" :
			if (_pp.state.ignore) {
				_pp.state.ignore.end = token.end.index + 1;
				_pp.state.ignore_actions.push(_pp.state.ignore);

				_pp.state.ignore = null;
			}
			break;
	}
});

var parse = content => {
	pp.state.ignore_actions = [];
	pp.process("REPLACE ME FILENAME", content);

	if (pp.state.ignore_actions.length) {
		var actions = pp.state.ignore_actions, i = actions.length;
		while (i--) {
			pp.action(actions[i]);
		}

		return pp.code;
	}

	return content;
};

var files = [
	"index",
	"cache",
	"config",
	"binder",
	"counter",
	"observer",
	"component",
	"directive",
	"constructor",
	"transcluder",
	"template_cache",
	"template_resolver",
	"collect_components",
	"make_directive_controller",

	"compiler/nodes",
	"compiler/element",
	"compiler/template",
	"compiler/build_nodes",

	"input/index",
	"input/parser",
	"input/compiler",
	"input/tokenizer",
	"input/get_string",
	"input/symbol_table",

	"directives/if_directive",
	"directives/jf_bind_directive",
	"directives/for_each_directive",
];

files.forEach(function (file) {
	var filepath = path.resolve(`./src/${ file }.js`);
	var content  = fs.readFileSync(filepath, "utf8");

	content = parse(content);

	fs.writeFileSync(path.resolve(`./dist/${ file }.js`), content, "utf8");
});
