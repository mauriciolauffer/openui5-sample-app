'use strict';

const { JSDOM } = require('jsdom');
const testrunner = require("node-qunit");

const optionsDefault = {
	resources: 'usable',
	referrer: "https://ui5.sap.com/",
	runScripts: 'dangerously',
	pretendToBeVisual: true,
	beforeParse: (jsdomWindow) => {
		// Patch window.matchMedia because it doesn't exist in JSDOM
		jsdomWindow.matchMedia = function () {
			return {
				matches: false,
				addListener: function () { },
				removeListener: function () { }
			};
		};
		// Patch window.performance.timing because it doesn't exist in nodejs nor JSDOM
		jsdomWindow.performance.timing = {
			fetchStart: Date.now(),
			navigationStart: Date.now(),
		};
	}
};

function buildFromFile() {
	const options = { ...optionsDefault };
	return JSDOM.fromFile('./webapp/test/test-jsdom.html', options);
};

function buildFromUrl() {
	const options = { ...optionsDefault };
	return JSDOM.fromURL('http://localhost:8080/test/test-jsdom.html', options);
};

//let dom = {};
let window = {};
let document = {};
var sap = {};

buildFromFile()
	.then((dom) => {
		window = dom.window;
		document = dom.window.document;
		return new Promise((resolve) => {
			console.log(111111);
			window.onUi5ModulesLoaded = () => {
				console.log(222222222);
				globalThis.sap = global.sap = sap = window.sap;
				resolve();
			};
		});
	})
	.then(() => {
		console.log(333333333);
		console.log(!!sap);
		testrunner.run({
			//code: "./webapp/controller/App.controller.js",
			code: "./webapp/test/dummy.js",
			tests: "./webapp/test/App.controller.jsdom.test.js"
			//tests: "./webapp/test/unit/controller/App.controller.js"
		}, function (err, report) {
			console.log(4444444);
			console.dir(err);
			console.dir(report);
		});
	});

/* dom = await buildFromFile();
globalThis.window = global.window = window = dom.window;
document = dom.window.document;
await new Promise((resolve) => {
	console.log(111111);
	window.onUi5ModulesLoaded = () => {
		console.log(222222222);
		globalThis.sap = global.sap = sap = window.sap;
		resolve();
	};
}); */

/* console.log(333333333);
testrunner.run({
	code: "../controller/App.controller.js",
	tests: "./App.controller.jsdom.test.js"
}, function (err, report) {
	console.log(4444444);
	console.dir(err);
	console.dir(report);
}); */
