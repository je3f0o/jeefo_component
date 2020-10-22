/* -.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.
* File Name   : tokenizer.js
* Created at  : 2019-07-09
* Updated at  : 2020-10-23
* Author      : jeefo
* Purpose     :
* Description :
* Reference   :
.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.*/
// ignore:start
"use strict";

/* globals*/
/* exported*/

// ignore:end

// ES5 tokenizer
const tokenizer = require("@jeefo/ecma_parser/es5/tokenizer");
// ES6 tokenizer
const register_tokes = require("@jeefo/ecma_parser/es6/tokenizer");
register_tokes(tokenizer);

tokenizer.register({
    id       : "JeefoBinder",
    priority : 41,

    is : (current_character, streamer) => {
        return current_character === '{' && streamer.is_next_character('{');
    },

    initialize : (token, character, streamer) => {
        const start = streamer.clone_cursor_position();
        streamer.cursor.move(1);

        token.value = "{{";
        token.start = start;
        token.end   = streamer.clone_cursor_position();
    }
});

module.exports = tokenizer;
