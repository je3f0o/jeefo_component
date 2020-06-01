/* -.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.
* File Name   : interpreter.js
* Created at  : 2019-06-30
* Updated at  : 2020-03-08
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

const parser = require("./input/parser");

const no_operation = () => {};

function find_controller (property, controllers, input_component) {
    const build_script = ({ id, controller }) => {
        const ctrl_name = `ctrl_${ id }`;
        controllers[ctrl_name] = controller;
        return `$ctrls.${ ctrl_name }.${ property }`;
    };

    const is_matched = ({ controller, controller_name }) => {
        return (
            property === controller_name ||
            (controller && property in controller)
        );
    };

    const _find_controller = component => {
        if (is_matched(component)) {
            return build_script(component);
        }

        const directive = component.directives.find(is_matched);
        if (directive) {
            return build_script(directive);
        }
    };

    const script = _find_controller(input_component);
    if (script) { return script; }

    for (let p = input_component.parent; p; p = p.parent) {
        const script = _find_controller(p);
        if (script) { return script; }
    }

    // global
    if (window[property]) {
        return build_script({
            id         : "global",
            controller : window
        });
    }
}

function compile (node, controllers, component) {
	switch (node.id) {
		case "This keyword"    :
		case "Null literal"    :
		case "Boolean literal" :
		case "Numeric literal" :
		case "Identifier name" :
			return node.value;
		case "Literal" :
		case "Property name" :
		case "New expression" :
		case "Call expression" :
		case "Member expression" :
		case "Primary expression" :
		case "Assignment expression" :
		case "Left hand side expression" :
            return compile(node.expression, controllers, component);
		case "String literal" :
            const { quote } = node;
			return `${ quote }${ node.value }${ quote }`;
		case "Identifier reference" :
            const script = find_controller(
                node.value, controllers, component
            );
            if (! script) {
                throw new ReferenceError(
                    `Identifier '${ node.value }' is not found`
                );
            }
            return script || node.value;
		case "Array literal" :
            const elements = node.element_list.map(e => {
                return compile(e, controllers, component);
            });
			return `[${ elements.join(", ") }]`;
		case "Object literal" :
            const properties = node.property_definition_list.map(p => {
                return compile(p.expression, controllers, component);
            });
			return `{ ${ properties.join(", ") } }`;
		case "Property assignment" :
            const prop  = compile(node.property_name, controllers, component);
            const value = compile(node.expression, controllers, component);
            return `${ prop } : ${ value }`;
		case "Logical not operator" :
            return `! ${ compile(node.expression, controllers, component) }`;
		case "Logical or operator" :
		case "Logical and operator" :
            const left  = compile(node.left, controllers, component);
            const right = compile(node.right, controllers, component);
            return `${ left } ${ node.operator.value } ${ right }`;
		case "Conditional operator" :
            const falsy = compile(
                node.falsy_expression, controllers, component
            );
            const truthy = compile(
                node.truthy_expression, controllers, component
            );
            const condition = compile(node.condition, controllers, component);
            return `${ condition } ? ${ truthy } : ${ falsy }`;
		case "Member operator" : {
            const object = compile(node.object, controllers, component);
			return `${ object }.${ node.property.value }`;
        }
		case "Computed member expression" : {
            debugger
            const object = compile(
                node.object, controllers, component, is_member);
            const expression = compile(
                node.expression, controllers, component);
            return `${ object }[${ expression }]`;
        }
		case "Equality operator" :
		case "Arithmetic operator" :
		case "Assignment operator" :
		case "Comparision operator" : {
            const left  = compile(node.left , controllers, component);
            const right = compile(node.right, controllers, component);
            return `${ left } ${ node.operator.value } ${ right }`;
        }
		case "Function call expression" :
            const callee = compile(
                node.callee, controllers, component);
            const args = node.arguments.list.map(arg => {
                return compile(arg, controllers, component);
            });
            return `${ callee }(${ args.join(", ") })`;
		case "Expression statement" :
            return compile(node.expression, controllers, component);
		case "Template literal" :
            return node.body.map(element => {
                if (element.id === "Template literal string") {
                    return `"${ element.value }"`;
                }
                const expr = compile(
                    element.expression, controllers, component
                );
                return `(${ expr })`;
            }).join(" + ");
		default:
			throw new Error(`Invalid AST_Node: '${ node.id }'`);
	}
}

const build_setter = (stmt, controllers, component) => {
    const has_error_occurred = (
        stmt.length !== 1 ||
        stmt[0].id !== "Expression statement" ||
        stmt[0].expression.id !== "Primary expression"
    );
    if (has_error_occurred) {
        throw new Error("Invalid expression in two way bindings");
    }
    let lvalue;
    const expression = stmt[0].expression.expression;

    switch (expression.id) {
		case "Null literal"    :
		case "String literal"  :
		case "Boolean literal" :
		case "Numeric literal" :
			return no_operation;
        case "Identifier reference" : {
            const property = expression.value;
            lvalue = find_controller(
                property, controllers, component
            );
            break;
        }
        /*
        case "Member expression"          :
        case "Computed member expression" :
            lvalue = compile(expression, controllers, component);
            break;
            */
        default:
			throw new Error(
                `Invalid AST_Node in two way bindings: '${ expression.id }'`
            );
    }

    const fn_body = `${ lvalue } = value;`;
    return new Function("$ctrls", "value", fn_body); // jshint ignore:line
};

const build_fn_body = (statements) => {
    const indent = ' '.repeat(4);
    const body   = statements.map(stmt => `${ indent }${ stmt }`).join(";\n");

    return [
        "    let result;",
        `${ body };`,
        "    return result;"
    ].join('\n');
};

class Interpreter {
    constructor (source_code, component, to_build_setter = false) {
        this.ctrls  = {};
        this.setter = null;

        const statements = parser.parse(source_code);
        if (to_build_setter) {
            this.setter = build_setter(statements, this.ctrls, component);
        }

        const compiled_stmts = statements.map(ast_node => {
            return compile(ast_node, this.ctrls, component);
        });
        const last_index = compiled_stmts.length - 1;
        const last_stmt  = compiled_stmts[last_index];
        compiled_stmts[last_index] = `result = ${ last_stmt }`;

        const code = build_fn_body(compiled_stmts);
        /*
        console.log(code);
        console.log("-----------------------------");
        debugger
        */
        this.getter = new Function("$ctrls", code); // jshint ignore:line
    }

    get_value () {
        return this.getter(this.ctrls);
    }

    set_value (value) {
        this.setter(this.ctrls, value);
    }
}

module.exports = Interpreter;

/*
const component = {
    id : 1,
    controller : {
        method : () => "ZZZ",
        a : 0, b : 0, c : 0, d : 0, e : 0, f : 0, g : 0,
        z : 0,
        o : { z : 0 }
    },
    find_parent () {}
};
const i = new Interpreter(`
a = true;
b = false;
c = null;
d = 123;
e = [1,2,3];
f = { z : 1, 2 : 3, "zzz" : 2 };
g = "str";
o.z = 123;
o[d] = 123;
z = method(a, b);
`, component);
console.log(i.fn.toString());
i.invoke();
console.log(i);
*/
