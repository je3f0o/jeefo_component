/* -.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.
* File Name   : input_specs.js
* Created at  : 2017-09-28
* Updated at  : 2017-10-19
* Author      : jeefo
* Purpose     :
* Description :
_._._._._._._._._._._._._._._._._._._._._.*/
// ignore:start
"use strict";

/* globals */
/* exported */

// ignore:end

var Component = function (controller_as, controller, parent) {
	this.parent        = parent || null;
	this.controller    = controller;
	this.controller_as = controller_as;
};

var md_tabs = new Component("$md_tabs", { prev : function () { return "Yupii!"; } });
var md_tab  = new Component("$md_tab", { prop : "value", computed_prop : "length" }, md_tabs);
var c1      = new Component("$ctrl", { my_prop : "my_value", toggle : false }, md_tab);

var Input  = require("../src/input"),
	expect = require("expect");

describe("Input", () => {

	describe("Primitives", () => {
		it("Should be Number", () => {
			var input = new Input(c1, "20");
			expect(input.invoke()).toBe(20);
		});
		it("Should be String", () => {
			var input = new Input(c1, "'String'");
			expect(input.invoke()).toBe("String");
		});
		it("Should be Null", () => {
			var input = new Input(c1, "null");
			expect(input.invoke()).toBe(null);
		});
		it("Should be Boolean", () => {
			var input = new Input(c1, "true");
			expect(input.invoke()).toBe(true);

			input = new Input(c1, "false");
			expect(input.invoke()).toBe(false);
		});
	});

	describe("Math expressions", () => {
		it("Should be '5 + 5 = 10'", () => {
			var input = new Input(c1, "5 + 5");
			expect(input.invoke()).toBe(10);
		});
		it("Should be '20 - 5 = 15'", () => {
			var input = new Input(c1, "20 - 5");
			expect(input.invoke()).toBe(15);
		});
		it("Should be '15 * 5 = 75'", () => {
			var input = new Input(c1, "15 * 5");
			expect(input.invoke()).toBe(75);
		});
		it("Should be '15 / 5 = 3'", () => {
			var input = new Input(c1, "15 / 5");
			expect(input.invoke()).toBe(3);
		});
		it("Should be '5 ** 3 = 125'", () => {
			var input = new Input(c1, "5 ** 3");
			expect(input.invoke()).toBe(125);
		});
	});

	describe("Find contexts", () => {
		it("Should be 'my_value'", () => {
			var input = new Input(c1, "my_prop");
			expect(input.invoke()).toBe("my_value");
		});
		it("Should be 'value'", () => {
			var input = new Input(c1, "prop");
			expect(input.invoke()).toBe("value");
		});
		it("Should be 'function'", () => {
			var input = new Input(c1, "$md_tabs.prev");
			expect(typeof input.invoke()).toBe("function");
		});
	});

	describe("Member expressions", () => {
		it("Should be 5 (uncomputed)", () => {
			var input = new Input(c1, "prop.length");
			expect(input.invoke()).toBe(5);
		});

		it("Should be 5 (computed)", () => {
			var input = new Input(c1, "prop[computed_prop]");
			expect(input.invoke()).toBe(5);
		});
	});

	describe("Function call", () => {
		it("Should be 'Yupii!'", () => {
			var input = new Input(c1, "$md_tabs.prev()");
			expect(input.invoke()).toBe("Yupii!");
		});
	});

	describe("Overwrite", () => {
		var input = new Input(c1, "$md_tabs.next($event)");

		it("Should be same context", () => {
			md_tabs.controller.next = function () {
				expect(this).toBe(md_tabs.controller);
			};
			input.invoke();
		});

		it("Should be get arguments", () => {
			md_tabs.controller.next = function (event) {
				expect(this).toBe(md_tabs.controller);
				expect(event).toBe("Event");
			};
			input.invoke({ $event : "Event" });
		});
	});

	describe("Unary Expression", () => {
		var input = new Input(c1, "! prop.length");
		it("Should be negated", () => {
			expect(input.invoke()).toBe(false);
		});

		var input2 = new Input(c1, "! undefined.length");
		it("Should be negated", () => {
			expect(input2.invoke()).toBe(true);
		});
	});

	describe("Assignemnt Expression", () => {
		var input = new Input(c1, "toggle = ! toggle");

		it("Should be true", () => {
			expect(input.invoke()).toBe(true);
		});
	});

	describe("Setter", () => {
		md_tab.controller.o   = {};
		md_tab.controller.arr = [];

		var input0 = new Input(c1, "fff = 'hello'");
		it("Should be assign", () => {
			input0.invoke();
			expect(md_tab.controller.fff).toBe("hello");
		});

		var input = new Input(c1, "_value");
		input.build_setter();

		it("Should be set to property", () => {
			input.set(10);
			expect(md_tab.controller._value).toBe(10);
		});

		var input2 = new Input(c1, "arr[5]");
		input2.build_setter();

		it("Should be set into array", () => {
			input2.set(10);
			expect(md_tab.controller.arr[5]).toBe(10);
		});

		var input3 = new Input(c1, "o['hello']");
		input3.build_setter();

		it("Should be set into computed string member", () => {
			input3.set(10);
			expect(md_tab.controller.o.hello).toBe(10);
		});
	});

});
