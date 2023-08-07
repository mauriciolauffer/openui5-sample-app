/**
 * @vitest-environment jsdom
 */

'use strict';

import { describe, it, beforeAll, beforeEach, afterAll, afterEach, expect, vi } from 'vitest';

const optionsDefault = {
	resources: 'usable',
	referrer: "https://ui5.sap.com/",
	runScripts: 'dangerously',
	pretendToBeVisual: true,
	beforeParse: (jsdomWindow) => {
		jsdomWindow.matchMedia = function () {
			return {
				matches: false,
				addListener: function () { },
				removeListener: function () { }
			};
		};
		jsdomWindow.performance.timing = {
			fetchStart: Date.now(),
			navigationStart: Date.now(),
		};
	}
};

function buildFromFile() {
	console.log('buildFromFile');
	const options = { ...optionsDefault };
	return JSDOM.fromFile('webapp/test/test-jsdom.html', options);
};

function buildFromUrl() {
	console.log('buildFromUrl');
	const options = { ...optionsDefault };

	return JSDOM.fromURL('http://localhost:8080/test/test-jsdom.html', options);
};

describe('test suite', function () {
		console.dir(!!window);

	//let dom = {};
	//let window = {};
	let document = {};
	let sap = {};

	beforeAll(async () => {
		/* buildFromFile().then((dom) => {
			window = dom.window;
			document = dom.window.document;
			console.log(window.location.origin);
			window.onUi5ModulesLoaded = () => {
				sap = window.sap;
				done();
			};
		}); */

		dom = await buildFromFile();
		//dom = await buildFromUrl();
		window = dom.window;
		document = dom.window.document;
		console.log(window.location.origin);
		await new Promise((resolve) => {
			window.onUi5ModulesLoaded = () => {
				sap = window.sap;
				resolve();
			};
		});



		/* const scriptUi5Bootstrap = document.createElement('script');
		scriptUi5Bootstrap.id = "sap-ui-bootstrap";
		scriptUi5Bootstrap.src = "https://ui5.sap.com/resources/sap-ui-core.js";
		//scriptUi5Bootstrap.src = "http://localhost:8080/resources/sap-ui-core.js";
		scriptUi5Bootstrap.setAttribute('data-sap-ui-oninit', 'onUi5Boot()');
		scriptUi5Bootstrap.setAttribute('data-sap-ui-libs', "sap.m");
		scriptUi5Bootstrap.setAttribute('data-sap-ui-theme', "sap_horizon");
		scriptUi5Bootstrap.setAttribute('data-sap-ui-compatVersion', "edge");
		scriptUi5Bootstrap.setAttribute('data-sap-ui-async', "true");
		scriptUi5Bootstrap.setAttribute('data-sap-ui-language', "en");
		scriptUi5Bootstrap.setAttribute('data-sap-ui-resourceRoots', '{"sap.ui.demo.todo" : "../../../../../../"}');
		scriptUi5Bootstrap.crossorigin = "anonymous";
		document.body.appendChild(scriptUi5Bootstrap); */

		/* window.onUi5Boot = async function() {
			console.log(11111);
			console.dir(window.location.href);
			global.sap = window.sap;
			console.log(window.sap);
			console.log(global.sap);
			console.log(sap);
			sap.ui.require([
				"sap/ui/demo/todo/controller/App.controller"
			], function (App) {
				console.log(22222);
				done();
			}, function (err) {
				done(err);
			});
		} */

		/* await new Promise((resolve) => {
			console.dir(window.location.href);
			setTimeout(() => {
				global.sap = window.sap;
				sap.ui.require([
					"sap/ui/demo/todo/controller/App.controller"
				], function (App) {
					resolve();
				});
			}, 5000);
		}); */
	}, 20000);

	afterAll(() => {
		window.close();
	});

	describe('Test JSDOM', function () {
		it('test if node:test works correctly', function () {
			expect(1).toBe(1);
		});

		it('test if JSDOM has been loaded', function () {
			expect(window).toBeTruthy();
			expect(document).toBeTruthy();
			expect(document).toBeTruthy();
			expect(document.body).toBeTruthy();
		});

		it('test if UI5 has been loaded', function () {
			expect(sap).toBeTruthy();
			expect(sap.ui.demo.todo.controller.App).toBeTruthy();
		});
	});

	describe('Test init state', function () {
		beforeEach(() => {
			global.oAppController = new sap.ui.demo.todo.controller.App();
			global.oViewStub = new sap.ui.base.ManagedObject({});
			global.oJSONModelStub = new sap.ui.model.json.JSONModel({
				todos: []
			});
			jest.spyOn(sap.ui.core.mvc.Controller.prototype, 'getView').mockReturnValue(global.oViewStub);
			global.oViewStub.setModel(global.oJSONModelStub);
		});

		afterEach(() => {
			jest.clearAllMocks();
		});

		it('Check controller initial state', () => {
			// Act
			global.oAppController.onInit();

			// Assert
			expect(global.oAppController.aSearchFilters).toEqual([]);
			expect(global.oAppController.aTabFilters).toEqual([]);

			var oModel = global.oAppController.getView().getModel("view").getData();
			expect(oModel).toEqual({ isMobile: sap.ui.Device.browser.mobile, filterText: undefined });
		});
	});


	/* describe('Test model modification', function () {
		before(() => {
			global.oAppController = new sap.ui.demo.todo.controller.App();
			global.oViewStub = new sap.ui.base.ManagedObject({});
			global.oJSONModelStub = new sap.ui.model.json.JSONModel({
				todos: []
			});
			mock.method(sap.ui.core.mvc.Controller.prototype, "getView", () => global.oViewStub);
			global.oViewStub.setModel(global.oJSONModelStub);
		});

		after(() => {
			mock.reset();
		});

		it('Should add a todo element to the model', () => {
			assert.strictEqual(global.oJSONModelStub.getObject("/todos").length, 0, "There must be no todos defined.");

			// Act
			global.oJSONModelStub.setProperty("/todos", [{ title: "Completed item", completed: true }]);
			global.oJSONModelStub.setProperty("/newTodo", "new todo item");
			global.oAppController.addTodo();

			// Assumption
			assert.strictEqual(global.oJSONModelStub.getObject("/todos").length, 2, "There are couple items in ToDo list.");
		});

		it("Should toggle the completed items in the model", () => {
			// Arrange
			var oModelData = {
				todos: [{
					"title": "Start this app",
					"completed": false
				}],
				itemsLeftCount: 1
			};
			global.oJSONModelStub.setData(oModelData);

			// initial assumption
			assert.strictEqual(global.oJSONModelStub.getObject("/todos").length, 1, "There is one item.");
			assert.strictEqual(global.oJSONModelStub.getProperty("/itemsLeftCount"), 1, "There is one item left.");

			// Act
			global.oJSONModelStub.setProperty("/todos/0/completed", true);
			global.oAppController.updateItemsLeftCount();

			// Assumption
			assert.strictEqual(global.oJSONModelStub.getProperty("/itemsLeftCount"), 0, "There is no item left.");
		});

		it("Should clear the completed items", () => {
			// Arrange
			var oModelData = {
				todos: [{
					"title": "Start this app1",
					"completed": false
				}, {
					"title": "Start this app2",
					"completed": true
				}],
				itemsLeftCount: 1
			};
			global.oJSONModelStub.setData(oModelData);


			// initial assumption
			assert.strictEqual(global.oJSONModelStub.getObject("/todos").length, 2, "There are two items.");
			assert.strictEqual(global.oJSONModelStub.getProperty("/itemsLeftCount"), 1, "There is no item left.");

			// Act
			global.oAppController.clearCompleted();
			global.oAppController.updateItemsLeftCount();

			// Assumption
			assert.strictEqual(global.oJSONModelStub.getObject("/todos").length, 1, "There is one item left.");
			assert.strictEqual(global.oJSONModelStub.getProperty("/itemsLeftCount"), 1, "There is one item left.");
		});

		it("Should update items left count when no todos are loaded, yet", () => {
			// Arrange
			var oModelData = {};
			global.oJSONModelStub.setData(oModelData);

			// initial assumption
			assert.strictEqual(global.oJSONModelStub.getObject("/todos"), undefined, "There are no items.");
			assert.strictEqual(global.oJSONModelStub.getProperty("/itemsLeftCount"), undefined, "Items left is not set");

			// Act
			global.oAppController.updateItemsLeftCount();

			// Assumption
			assert.strictEqual(global.oJSONModelStub.getProperty("/itemsLeftCount"), 0, "There is no item left.");
		});
	});


	describe('Test search', function () {
		before(() => {
			global.oAppController = new sap.ui.demo.todo.controller.App();
			global.oViewStub = new sap.ui.base.ManagedObject({});
			global.oListStub = new sap.ui.base.ManagedObject({});
			mock.method(sap.ui.core.mvc.Controller.prototype, "getView", () => global.oViewStub);
			mock.method(sap.ui.core.mvc.Controller.prototype, "byId", () => global.oListStub);
			mock.method(global.oListStub, "getBinding", () => {
				return { filter: function () { } };
			});

			global.oJSONModelStub = new sap.ui.model.json.JSONModel({
				todos: [],
			});
			global.oViewStub.setModel(global.oJSONModelStub);
			global.oViewStub.setModel(new sap.ui.model.json.JSONModel({}), "view");
			global.oViewStub.setModel(
				new sap.ui.model.resource.ResourceModel({ bundleName: "sap.ui.demo.todo.i18n.i18n" }),
				"i18n"
			);
		});

		after(() => {
			mock.reset();
		});

		it("Empty search", () => {
			// Setup
			var oEvent = {
				getSource: function () {
					return { getValue: function () { return ""; } };
				}
			};

			// Act
			global.oAppController.onSearch(oEvent);

			// Assert
			assert.strictEqual(
				global.oAppController.sSearchQuery,
				"",
				"The search term is an empty string"
			);
			assert.deepEqual(
				global.oAppController.aSearchFilters,
				[],
				"Search filters are empty"
			);
			assert.strictEqual(
				global.oAppController
					.getView()
					.getModel()
					.getProperty("/itemsRemovable"),
				true,
				"Button toggle is properly set"
			);
		});

		it("Do a search", () => {
			assert.ok(1);
			// Setup
			var sSearchQuery = "ToDo item";
			var oEvent = {
				getSource: function () {
					return {
						getValue: function () {
							return sSearchQuery;
						}
					};
				}
			};

			// Act
			global.oAppController.onSearch(oEvent);

			// Assert
			assert.strictEqual(
				global.oAppController.sSearchQuery,
				sSearchQuery,
				"The search term is an empty string"
			);
			assert.strictEqual(
				global.oAppController.aSearchFilters.length,
				1,
				"A search filter is constructed"
			);
			assert.strictEqual(
				global.oAppController
					.getView()
					.getModel()
					.getProperty("/itemsRemovable"),
				false,
				"Button toggle is properly set"
			);
		});
	});


	describe("Test filtering", function () {
		before(() => {
			global.oAppController = new sap.ui.demo.todo.controller.App();
			global.oViewStub = new sap.ui.base.ManagedObject({});
			global.oListStub = new sap.ui.base.ManagedObject({});
			mock.method(sap.ui.core.mvc.Controller.prototype, "getView", () => global.oViewStub);
			mock.method(sap.ui.core.mvc.Controller.prototype, "byId", () => global.oListStub);
			mock.method(global.oListStub, "getBinding", () => {
				return { filter: function () { } };
			});

			global.oJSONModelStub = new sap.ui.model.json.JSONModel({
				todos: [],
			});
			global.oViewStub.setModel(global.oJSONModelStub);
			global.oViewStub.setModel(new sap.ui.model.json.JSONModel({}), "view");
			global.oViewStub.setModel(
				new sap.ui.model.resource.ResourceModel({ bundleName: "sap.ui.demo.todo.i18n.i18n" }),
				"i18n"
			);
		});

		after(() => {
			mock.reset();
		});

		it("Toggle filters", () => {
			// Setup
			var sKey = "";
			var oEvent = {
				getParameter: function () {
					return { getKey: function () { return sKey; } };
				}
			};

			// Act
			global.oAppController.aSearchFilters = [];
			global.oAppController.onFilter(oEvent);

			// Assert
			assert.strictEqual(
				global.oAppController.sFilterKey,
				sKey,
				"Correct filter key is applied"
			);
			assert.strictEqual(
				global.oAppController.aTabFilters.length,
				0,
				"Empty key == no filter"
			);

			// Act
			sKey = "active"; // alters oEvent
			global.oAppController.onFilter(oEvent);
			// Assert
			assert.strictEqual(
				global.oAppController.sFilterKey,
				sKey,
				"Correct filter key is applied"
			);
			assert.strictEqual(
				global.oAppController.aTabFilters.length,
				1,
				"A filter is constructed"
			);

			// Act
			sKey = "completed"; // alters oEvent
			global.oAppController.onFilter(oEvent);
			// Assert
			assert.strictEqual(
				global.oAppController.sFilterKey,
				sKey,
				"Correct filter key is applied"
			);
			assert.strictEqual(
				global.oAppController.aTabFilters.length,
				1,
				"A filter is constructed"
			);

			// Act
			sKey = "completed"; // alters oEvent
			global.oAppController.sSearchQuery = "test";
			global.oAppController.onFilter(oEvent);
			// Assert
			assert.strictEqual(
				global.oAppController.sFilterKey,
				sKey,
				"Correct filter key is applied"
			);
			assert.strictEqual(
				global.oAppController.aTabFilters.length,
				1,
				"A filter is constructed"
			);

			// Act
			sKey = "all"; // alters oEvent
			global.oAppController.onFilter(oEvent);
			// Assert
			assert.strictEqual(
				global.oAppController.sFilterKey,
				sKey,
				"Correct filter key is applied"
			);
			assert.strictEqual(
				global.oAppController.aTabFilters.length,
				0,
				"Cleans up filters"
			);
		});
	}); */

});
