/* -.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.
* File Name   : interpreter.js
* Created at  : 2019-06-30
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

const parser = require("./input/parser");

const no_operation = () => {};

const is_event_binder = ({event_binder}, prop) => {
    return event_binder && event_binder.hasOwnProperty(prop);
};

function find_controller (property, controllers, input_component) {
    if (is_event_binder(input_component, property)) {
        controllers.event_binder = input_component.event_binder;
        return `$ctrls.event_binder.${property}`;
    }

    const build_script = ({ id, controller, controller_name }) => {
        if (controller_name) {
            if (controller_name === property) {
                controllers[controller_name] = controller;
                return `$ctrls.${controller_name}`;
            }
        } else if (controller && property in controller) {
            const ctrl_name = `ctrl_${ id }`;
            controllers[ctrl_name] = controller;
            return `$ctrls.${ctrl_name}.${property}`;
        }
    };

    const _find_controller = component => {
        const script = build_script(component);
        if (script) { return script; }

        for (const directive of component.directives) {
            const script = build_script(directive);
            if (script) { return script; }
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
        controllers.__global = window;
        return `$ctrls.__global.${property}`;
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
		case "Assignment expression" :
            return compile(node.expression, controllers, component);
		case "New expression" :
            console.log("Hello ???");
            console.log(node);
            debugger;
            break;
		case "String literal" :
			return `${node.quote}${node.value}${node.quote}`;
		case "Identifier reference" :
            const script = find_controller(
                node.identifier.identifier_name.value, controllers, component
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
            return `${prop} : ${value}`;
		case "Positive plus operator"  :
		case "Negation minus operator" :
            const { operator: {value: op}, expression } = node;
            return `${op}${compile(expression, controllers, component)}`;
		case "Logical not operator" :
            return `! ${compile(node.expression, controllers, component)}`;

		case "Member operator" : {
            const object = compile(node.object, controllers, component);
			return `${object}.${node.property.value}`;
        }
		case "Computed member expression" : {
            const object = compile(node.object, controllers, component);
            const expr   = compile(node.member, controllers, component);
            return `${object}[${expr}]`;
        }

        // Conditional expression
		case "Conditional operator" :
            let {
                condition,
                falsy_expression  : falsy,
                truthy_expression : truthy,
            } = node;
            falsy     = compile(falsy, controllers, component);
            truthy    = compile(truthy, controllers, component);
            condition = compile(condition, controllers, component);
            return `${condition} ? ${truthy} : ${falsy}`;

        // Binary operators
        case "Assignment operator" :
        case "Logical or operator" :
        case "Logical and operator" :
        case "Bitwise or operator" :
        case "Bitwise xor operator" :
        case "Bitwise and operator" :
        case "Equality operator" :
        case "Relational operator" :
        case "Bitwise shift operator" :
        case "Additive operator" :
        case "Multiplicative operator" :
        case "Exponentiation operator" :
        case "Relational in operator" :
        case "Relational instanceof operator" : {
            const left  = compile(node.left , controllers, component);
            const right = compile(node.right, controllers, component);
            return `${left} ${node.operator.value} ${right}`;
        }

		case "Function call expression" :
            const callee = compile(node.callee, controllers, component);
            const args = node.arguments.list.map(arg => compile(
                arg, controllers, component
            ));
            return `${callee}(${args.join(", ")})`;

		case "Expression statement" :
            return compile(node.expression, controllers, component);
		case "Template literal" :
            return node.body.map(({id, expression, value}) => {
                if (id === "Template literal string") return `"${value}"`;
                const expr = compile(expression, controllers, component);
                return `(${expr})`;
            }).join(" + ");

        // DEBUG_START
		case "Debugger statement" :
            return node.keyword.value;
        // DEBUG_END

		default:
			throw new Error(`Invalid AST_Node: '${ node.id }'`);
	}
}

const build_setter = (stmt, controllers, component) => {
    if (stmt.length !== 1 || stmt[0].id !== "Expression statement") {
        throw new Error("Invalid expression in two way bindings");
    }
    let lvalue;
    const expr = stmt[0].expression;

    switch (expr.id) {
		case "Null literal"    :
		case "String literal"  :
		case "Boolean literal" :
		case "Numeric literal" :
			return no_operation;
        case "Identifier reference" : {
            lvalue = find_controller(
                expr.identifier.identifier_name.value, controllers, component
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
                `Invalid AST_Node in two way bindings: '${expr.id}'`
            );
    }

    const fn_body = `${lvalue} = value;`;
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
        if (statements[statements.length - 1].id !== "Debugger statement") {
            compiled_stmts[last_index] = `result = ${ last_stmt }`;
        }

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
