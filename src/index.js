/* -.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.
* File Name   : index.js
* Created at  : 2017-08-08
* Updated at  : 2019-09-29
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

[
    {
        selector : "for-each",
        filename : "for_each"
    },
    {
        selector : "switch",
        filename : "switch"
    },
    {
        selector : "jf-bind",
        filename : "jf_bind"
    },
    {
        selector : "jf-class",
        filename : "jf_class"
    },
    /*
    {
        selector : "init-class",
        filename : "init_class"
    },
    */
].forEach(({ selector, filename }) => {
    const path = `${ __dirname }/directives/${ filename }`;
    definitions_table.register_directive(selector, path);
});

module.exports = definitions_table;
