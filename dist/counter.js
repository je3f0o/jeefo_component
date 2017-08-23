/* -.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.
* File Name   : counter.js
* Created at  : 2017-08-12
* Updated at  : 2017-08-12
* Author      : jeefo
* Purpose     :
* Description :
_._._._._._._._._._._._._._._._._._._._._.*/

var Counter = function (id) {
	this.id = id || 0;
};

Counter.prototype.increment = function () {
	this.id += 1;
};

module.exports = Counter;
