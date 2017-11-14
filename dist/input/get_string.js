/* -.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.
* File Name   : get_string.js
* Created at  : 2017-10-02
* Updated at  : 2017-10-02
* Author      : jeefo
* Purpose     :
* Description :
_._._._._._._._._._._._._._._._._._._._._.*/

var SINGLE_QUOTE_REGEX = /'/,
	DOUBLE_QUOTE_REGEX = /"/,
	DOUBLE_QUOTE_REPLACE_REGEX = /"/g;

module.exports = function get_string (value) {
	if (value === '') {
		return "''";
	}

	if (value.length === 1) {
		if (value === '"') {
			return "'\"'";
		} else if (value === "'") {
			return '"\'"';
		}
		return "'" + value + "'";
	}

	if (value.length === 2 && value.charAt(0) === '\\') {
		if (SINGLE_QUOTE_REGEX.test(value)) {
			return '"' + value + '"';
		}
		return "'" + value + "'";
	}

	if (DOUBLE_QUOTE_REGEX.test(value)) {
		if (SINGLE_QUOTE_REGEX.test(value)) {
			return '"' + value.replace(DOUBLE_QUOTE_REPLACE_REGEX, '\\"') + '"';
		}
		return "'" + value + "'";
	}

	return '"' + value + '"';
};
