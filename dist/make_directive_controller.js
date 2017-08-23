/* -.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.
* File Name   : make_directive_controller.js
* Created at  : 2017-08-10
* Updated at  : 2017-08-11
* Author      : jeefo
* Purpose     :
* Description :
_._._._._._._._._._._._._._._._._._._._._.*/

module.exports = function (controller) {
	var Controller = function () {};
	Controller.prototype = controller.protos;
	controller.protos = null;

	controller.Controller = Controller;
};
