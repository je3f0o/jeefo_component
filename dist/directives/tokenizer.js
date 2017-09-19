/* -.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.
* File Name   : tokenizer.js
* Created at  : 2017-09-18
* Updated at  : 2017-09-18
* Author      : jeefo
* Purpose     :
* Description :
_._._._._._._._._._._._._._._._._._._._._.*/

var assign     = require("jeefo/utils/object/assign"),
	Tokenizer  = require("jeefo/tokenizer"),
	DELIMITERS = [
		'.', ',',
		'/', '?',
		';', ':',
		"'", '"',
		'`', '~',
		'-',
		'=', '+',
		'\\', '|', 
		'(', ')',
		'[', ']',
		'{', '}',
		'<', '>',
		'!', '@', '#', '%', '^', '&', '*',
	].join(''),

	es5_tokenizer = new Tokenizer();

es5_tokenizer.
// Delimiter {{{1
register({
	is : function (character) {
		switch (character) {
			case ':' : case ';' :
			case ',' : case '?' :
			case '(' : case ')' :
			case '[' : case ']' :
			case '{' : case '}' :
				return true;
		}
	},
	protos : {
		type       : "Delimiter",
		precedence : 10,
		initialize : function (character, streamer) {
			this.type  = this.type;
			this.value = this.delimiter = character;
			this.start = streamer.get_cursor();
			this.end   = streamer.end_cursor();
		},
	}
}).

// Identifier {{{1
register({
	protos : {
		type       : "Identifier",
		DELIMITERS : DELIMITERS,
		initialize : function (character, streamer) {
			var start = streamer.get_cursor(), end = {};

			while (character && character > ' ' && this.DELIMITERS.indexOf(character) === -1) {
				assign(end, streamer.cursor);
				character = streamer.next();
			}

			this.type  = this.type;
			this.name  = streamer.seek(start.index);
			this.start = start;
			this.end   = streamer.get_cursor();

			streamer.cursor = end;
		},
	},
}).

// Number Literal {{{1
register({
	is     : function (character) { return character >= '0' && character <= '9'; },
	protos : {
		type       : "Number",
		precedence : 2,
		initialize : function (character, streamer) {
			var start = streamer.get_cursor(), end = {};

			while (character && character >= '0' && character <= '9') {
				assign(end, streamer.cursor);
				character = streamer.next();
			}

			if (character && character === '.') {
				character = streamer.next();
				while (character && character >= '0' && character <= '9') {
					assign(end, streamer.cursor);
					character = streamer.next();
				}
			}

			if (character && (character === 'e' || character === 'E')) {
				character = streamer.next();
				while (character && character >= '0' && character <= '9') {
					assign(end, streamer.cursor);
					character = streamer.next();
				}
			}

			this.type  = this.type;
			this.value = streamer.seek(start.index);
			this.start = start;
			this.end   = streamer.get_cursor();

			streamer.cursor = end;
		},
	},
}).

// String Literal {{{1
register({
	is     : function (character) { return character === '"' || character === "'"; },
	protos : {
		type       : "String",
		precedence : 1,
		initialize : function (character, streamer) {
			var start = streamer.get_cursor(), quote = character, start_index;

			character   = streamer.next();
			start_index = streamer.cursor.index;

			while (character && (character >= ' ' || character === '\t') && character !== quote) {
				if (character === '\\') {
					streamer.next();
				}
				character = streamer.next();
			}

			this.type  = this.type;
			this.quote = quote;
			this.value = streamer.seek(start_index);
			this.start = start;
			this.end   = streamer.end_cursor();
		},
	},
}).

// Operator {{{1
register({
	is : function (character, streamer) {
		switch (character) {
			// Member operator
			case '.' :
			// Comparation operators
			case '!' :
			case '<' :
			case '>' :
			// Assignment and math operators
			case '=' :
			case '+' :
			case '-' :
			case '*' :
			case '%' :
			// Binary operators
			case '&' :
			case '|' :
			case '^' :
			case '~' :
				return true;
			case '/' :
				return streamer.peek(streamer.cursor.index + 1) === '=';
		}
	},
	protos : {
		type       : "Operator",
		precedence : 20,
		initialize : function (character, streamer) {
			var start = streamer.get_cursor(), cursor = streamer.cursor;

			switch (character) {
				case '!' :
				case '=' :
					if (streamer.peek(cursor.index + 1) === '=') {
						streamer.move_right(1);

						if (streamer.peek(cursor.index + 1) === '=') {
							streamer.move_right(1);
						}
					}
					break;
				case '+' :
				case '-' :
				case '&' :
				case '|' :
					switch (streamer.peek(cursor.index + 1)) {
						case '='       :
						case character :
							streamer.move_right(1);
					}
					break;
				case '/' :
					streamer.move_right(1);
					break;
				case '%' :
				case '^' :
					if (streamer.peek(cursor.index + 1) === '=') {
						streamer.move_right(1);
					}
					break;
				case '*' :
					if (streamer.peek(cursor.index + 1) === '*') {
						streamer.move_right(1);
					}
					if (streamer.peek(cursor.index + 1) === '=') {
						streamer.move_right(1);
					}
					break;
				case '<' :
					if (streamer.peek(cursor.index + 1) === '<') {
						streamer.move_right(1);
					}
					if (streamer.peek(cursor.index + 1) === '=') {
						streamer.move_right(1);
					}
					break;
				case '>'  :
					if (streamer.peek(cursor.index + 1) === '>') {
						streamer.move_right(1);

						if (streamer.peek(cursor.index + 1) === '>') {
							streamer.move_right(1);
						}

					}
					if (streamer.peek(cursor.index + 1) === '=') {
						streamer.move_right(1);
					}
			}

			this.type     = this.type;
			this.operator = streamer.seek(start.index, cursor.index + 1);
			this.start    = start;
			this.end      = streamer.end_cursor();
		},
	},
}).

// Slash {{{1
register({
	is : function (character, streamer) {
		if (character === '/') {
			switch (streamer.peek(streamer.cursor.index + 1)) { case '*' : case '=' : case '/' : return false; }
			return true;
		}
	},
	protos : {
		type       : "Slash",
		precedence : 50,
		DELIMITERS : DELIMITERS,
		initialize : function (character, streamer) {
			this.type  = this.type;
			this.start = streamer.get_cursor();
			this.end   = streamer.end_cursor();
		},
	},
});
// }}}1

module.exports = es5_tokenizer;
