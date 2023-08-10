'use strict';

import { describe, it, before, beforeEach, after, afterEach, mock } from 'node:test';
import assert from 'node:assert';
import { JSDOM } from 'jsdom';

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
	return JSDOM.fromFile('webapp/test/test-jsdom.html', options);
};

function buildFromUrl() {
	const options = { ...optionsDefault };
	return JSDOM.fromURL('http://localhost:8080/test/test-jsdom.html', options);
};

describe('test suite JSDOM', function () {
	let dom = {};
	let window = {};
	let document = {};
	let sap = {};

	before(async () => {
		dom = await buildFromFile();
		window = dom.window;
		document = dom.window.document;
		await new Promise((resolve) => {
			window.onUi5ModulesLoaded = () => {
				sap = window.sap;
				resolve();
			};
		});
	});

	after(() => {
		window.close();
	});

	afterEach(() => {
		mock.reset();
	});

	describe('Test JSDOM', async function () {
		it('test if node:test works correctly', function () {
			assert.ok(1);
		});

		it('test if JSDOM has been loaded', function () {
			assert.ok(dom.window);
			assert.ok(dom.window.document);
			assert.ok(dom.window.document.body);
		});

		it('test if UI5 has been loaded', function () {
			assert.ok(sap);
			assert.ok(sap.ui.demo.todo.controller.App);
		});
	});

	describe('Test init state', async function () {
		beforeEach((context) => {
			context.oAppController = new sap.ui.demo.todo.controller.App();
			context.oViewStub = new sap.ui.base.ManagedObject({});
			context.oJSONModelStub = new sap.ui.model.json.JSONModel({
				todos: []
			});
			mock.method(sap.ui.core.mvc.Controller.prototype, "getView", () => context.oViewStub);
			context.oViewStub.setModel(context.oJSONModelStub);
		});

		it('Check controller initial state', (context) => {
			// Act
			context.oAppController.onInit();

			// Assert
			assert.deepEqual(context.oAppController.aSearchFilters, [], "Search filters have been instantiated empty");
			assert.deepEqual(context.oAppController.aTabFilters, [], "Tab filters have been instantiated empty");

			var oModel = context.oAppController.getView().getModel("view").getData();
			assert.deepEqual(oModel, { isMobile: sap.ui.Device.browser.mobile, filterText: undefined });
		});
	});


	describe('Test model modification', async function () {
		beforeEach((context) => {
			context.oAppController = new sap.ui.demo.todo.controller.App();
			context.oViewStub = new sap.ui.base.ManagedObject({});
			context.oJSONModelStub = new sap.ui.model.json.JSONModel({
				todos: []
			});
			mock.method(sap.ui.core.mvc.Controller.prototype, "getView", () => context.oViewStub);
			context.oViewStub.setModel(context.oJSONModelStub);
		});

		it('Should add a todo element to the model', (context) => {
			assert.strictEqual(context.oJSONModelStub.getObject("/todos").length, 0, "There must be no todos defined.");

			// Act
			context.oJSONModelStub.setProperty("/todos", [{ title: "Completed item", completed: true }]);
			context.oJSONModelStub.setProperty("/newTodo", "new todo item");
			context.oAppController.addTodo();

			// Assumption
			assert.strictEqual(context.oJSONModelStub.getObject("/todos").length, 2, "There are couple items in ToDo list.");
		});

		it("Should toggle the completed items in the model", (context) => {
			// Arrange
			var oModelData = {
				todos: [{
					"title": "Start this app",
					"completed": false
				}],
				itemsLeftCount: 1
			};
			context.oJSONModelStub.setData(oModelData);

			// initial assumption
			assert.strictEqual(context.oJSONModelStub.getObject("/todos").length, 1, "There is one item.");
			assert.strictEqual(context.oJSONModelStub.getProperty("/itemsLeftCount"), 1, "There is one item left.");

			// Act
			context.oJSONModelStub.setProperty("/todos/0/completed", true);
			context.oAppController.updateItemsLeftCount();

			// Assumption
			assert.strictEqual(context.oJSONModelStub.getProperty("/itemsLeftCount"), 0, "There is no item left.");
		});

		it("Should clear the completed items", (context) => {
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
			context.oJSONModelStub.setData(oModelData);


			// initial assumption
			assert.strictEqual(context.oJSONModelStub.getObject("/todos").length, 2, "There are two items.");
			assert.strictEqual(context.oJSONModelStub.getProperty("/itemsLeftCount"), 1, "There is no item left.");

			// Act
			context.oAppController.clearCompleted();
			context.oAppController.updateItemsLeftCount();

			// Assumption
			assert.strictEqual(context.oJSONModelStub.getObject("/todos").length, 1, "There is one item left.");
			assert.strictEqual(context.oJSONModelStub.getProperty("/itemsLeftCount"), 1, "There is one item left.");
		});

		it("Should update items left count when no todos are loaded, yet", (context) => {
			// Arrange
			var oModelData = {};
			context.oJSONModelStub.setData(oModelData);

			// initial assumption
			assert.strictEqual(context.oJSONModelStub.getObject("/todos"), undefined, "There are no items.");
			assert.strictEqual(context.oJSONModelStub.getProperty("/itemsLeftCount"), undefined, "Items left is not set");

			// Act
			context.oAppController.updateItemsLeftCount();

			// Assumption
			assert.strictEqual(context.oJSONModelStub.getProperty("/itemsLeftCount"), 0, "There is no item left.");
		});
	});


	describe('Test search', function () {
		beforeEach((context) => {
			context.oAppController = new sap.ui.demo.todo.controller.App();
			context.oViewStub = new sap.ui.base.ManagedObject({});
			context.oListStub = new sap.ui.base.ManagedObject({});
			mock.method(sap.ui.core.mvc.Controller.prototype, "getView", () => context.oViewStub);
			mock.method(sap.ui.core.mvc.Controller.prototype, "byId", () => context.oListStub);
			mock.method(context.oListStub, "getBinding", () => {
				return { filter: function () { } };
			});

			context.oJSONModelStub = new sap.ui.model.json.JSONModel({
				todos: [],
			});
			context.oViewStub.setModel(context.oJSONModelStub);
			context.oViewStub.setModel(new sap.ui.model.json.JSONModel({}), "view");
			context.oViewStub.setModel(
				new sap.ui.model.resource.ResourceModel({ bundleName: "sap.ui.demo.todo.i18n.i18n" }),
				"i18n"
			);
		});

		it("Empty search", (context) => {
			// Setup
			var oEvent = {
				getSource: function () {
					return { getValue: function () { return ""; } };
				}
			};

			// Act
			context.oAppController.onSearch(oEvent);

			// Assert
			assert.strictEqual(
				context.oAppController.sSearchQuery,
				"",
				"The search term is an empty string"
			);
			assert.deepEqual(
				context.oAppController.aSearchFilters,
				[],
				"Search filters are empty"
			);
			assert.strictEqual(
				context.oAppController
					.getView()
					.getModel()
					.getProperty("/itemsRemovable"),
				true,
				"Button toggle is properly set"
			);
		});

		it("Do a search", (context) => {
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
			context.oAppController.onSearch(oEvent);

			// Assert
			assert.strictEqual(
				context.oAppController.sSearchQuery,
				sSearchQuery,
				"The search term is an empty string"
			);
			assert.strictEqual(
				context.oAppController.aSearchFilters.length,
				1,
				"A search filter is constructed"
			);
			assert.strictEqual(
				context.oAppController
					.getView()
					.getModel()
					.getProperty("/itemsRemovable"),
				false,
				"Button toggle is properly set"
			);
		});
	});


	describe("Test filtering", function () {
		beforeEach((context) => {
			context.oAppController = new sap.ui.demo.todo.controller.App();
			context.oViewStub = new sap.ui.base.ManagedObject({});
			context.oListStub = new sap.ui.base.ManagedObject({});
			mock.method(sap.ui.core.mvc.Controller.prototype, "getView", () => context.oViewStub);
			mock.method(sap.ui.core.mvc.Controller.prototype, "byId", () => context.oListStub);
			mock.method(context.oListStub, "getBinding", () => {
				return { filter: function () { } };
			});

			context.oJSONModelStub = new sap.ui.model.json.JSONModel({
				todos: [],
			});
			context.oViewStub.setModel(context.oJSONModelStub);
			context.oViewStub.setModel(new sap.ui.model.json.JSONModel({}), "view");
			context.oViewStub.setModel(
				new sap.ui.model.resource.ResourceModel({ bundleName: "sap.ui.demo.todo.i18n.i18n" }),
				"i18n"
			);
		});

		it("Toggle filters", (context) => {
			// Setup
			var sKey = "";
			var oEvent = {
				getParameter: function () {
					return { getKey: function () { return sKey; } };
				}
			};

			// Act
			context.oAppController.aSearchFilters = [];
			context.oAppController.onFilter(oEvent);

			// Assert
			assert.strictEqual(
				context.oAppController.sFilterKey,
				sKey,
				"Correct filter key is applied"
			);
			assert.strictEqual(
				context.oAppController.aTabFilters.length,
				0,
				"Empty key == no filter"
			);

			// Act
			sKey = "active"; // alters oEvent
			context.oAppController.onFilter(oEvent);
			// Assert
			assert.strictEqual(
				context.oAppController.sFilterKey,
				sKey,
				"Correct filter key is applied"
			);
			assert.strictEqual(
				context.oAppController.aTabFilters.length,
				1,
				"A filter is constructed"
			);

			// Act
			sKey = "completed"; // alters oEvent
			context.oAppController.onFilter(oEvent);
			// Assert
			assert.strictEqual(
				context.oAppController.sFilterKey,
				sKey,
				"Correct filter key is applied"
			);
			assert.strictEqual(
				context.oAppController.aTabFilters.length,
				1,
				"A filter is constructed"
			);

			// Act
			sKey = "completed"; // alters oEvent
			context.oAppController.sSearchQuery = "test";
			context.oAppController.onFilter(oEvent);
			// Assert
			assert.strictEqual(
				context.oAppController.sFilterKey,
				sKey,
				"Correct filter key is applied"
			);
			assert.strictEqual(
				context.oAppController.aTabFilters.length,
				1,
				"A filter is constructed"
			);

			// Act
			sKey = "all"; // alters oEvent
			context.oAppController.onFilter(oEvent);
			// Assert
			assert.strictEqual(
				context.oAppController.sFilterKey,
				sKey,
				"Correct filter key is applied"
			);
			assert.strictEqual(
				context.oAppController.aTabFilters.length,
				0,
				"Cleans up filters"
			);
		});
	});

});
