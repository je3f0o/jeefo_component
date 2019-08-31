/* -.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.
* File Name   : index.js
* Created at  : 2017-08-08
* Updated at  : 2019-07-12
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

const definitions_table = require("./definitions_table");

definitions_table.register_directive(
    "for-each", "@jeefo/component/directives/for_each_directive"
);
definitions_table.register_directive(
    "switch", "@jeefo/component/directives/switch_directive"
);
definitions_table.register_directive(
    "jf-bind", "@jeefo/component/directives/jf_bind_directive"
);

//definitions_table.register_directive()
/*
require("./src/jf_class_directive");

require("./directives/if_directive");
require("./directives/for_each_directive");
require("./directives/jf_bind_directive.js");
*/

module.exports = definitions_table;
