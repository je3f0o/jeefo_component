/* -.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.
* File Name   : directive.js
* Created at  : 2017-08-07
* Updated at  : 2017-09-17
* Author      : jeefo
* Purpose     :
* Description :
_._._._._._._._._._._._._._._._._._._._._.*/

module.exports = function Directive (name, definition) {
	this.name             = name;
	this.definition       = definition;
	this.change_detectors = [];
};
