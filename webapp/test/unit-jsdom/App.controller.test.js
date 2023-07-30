'use strict';

import { describe, it, before, after, mock } from 'node:test';
import assert from 'node:assert';
import { JSDOM } from 'jsdom';

const optionsDefault = {
	resources: 'usable',
	referrer: "https://ui5.sap.com/",
	runScripts: 'dangerously',
	pretendToBeVisual: true,
	beforeParse: (jsdomWindow) => {
		jsdomWindow.matchMedia = function () {
			return {
				matches: false,
				addListener: function () {},
				removeListener: function () {}
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
	const options = {...optionsDefault};
	return JSDOM.fromFile('webapp/test/test-jsdom.html', options);
};

function buildFromUrl() {
	console.log('buildFromUrl');
	const options = {...optionsDefault};

	return JSDOM.fromURL('http://localhost:8080/test/test-jsdom.html', options);
};

describe('test suite', async function () {
	let dom = {};
	let window = {};
	let sap = {};

	before(async () => {
		dom = await buildFromFile();
		//dom = await buildFromUrl();
		window = dom.window;
		console.log(window.location.origin);

		await new Promise((resolve) => {
			window.onUi5ModulesLoaded = () => {
				sap = window.sap;
				resolve();
			};
		});
	});

	after(() => {
		dom.window.close();
	});

	describe('Test JSDOM', async function () {
		it('test if node:test works correctly', function () {
			assert.equal(1, 1);
		});

		it('test if JSDOM has been loaded', function () {
			assert.ok(dom.window.document);
			assert.ok(dom.window.document.body);
		});

		it('test if UI5 has been loaded', function () {
			assert.ok(sap);
		});
	});

	describe('Test init state', async function () {
		before(() => {
			this.oAppController = new sap.ui.demo.todo.controller.App();
			this.oViewStub = new sap.ui.base.ManagedObject({});
			this.oJSONModelStub = new sap.ui.model.json.JSONModel({
				todos: []
			});
			mock.method(sap.ui.core.mvc.Controller.prototype, "getView", () => this.oViewStub);
			this.oViewStub.setModel(this.oJSONModelStub);
		});

		after(() => {
			mock.reset();
		});

		it('Check controller initial state', () => {
			// Act
			this.oAppController.onInit();

			// Assert
			assert.deepEqual(this.oAppController.aSearchFilters, [], "Search filters have been instantiated empty");
			assert.deepEqual(this.oAppController.aTabFilters, [], "Tab filters have been instantiated empty");

			var oModel = this.oAppController.getView().getModel("view").getData();
			assert.deepEqual(oModel, { isMobile: sap.ui.Device.browser.mobile, filterText: undefined });
		});
	});


	describe('Test model modification', async function () {
		before(() => {
			this.oAppController = new sap.ui.demo.todo.controller.App();
			this.oViewStub = new sap.ui.base.ManagedObject({});
			this.oJSONModelStub = new sap.ui.model.json.JSONModel({
				todos: []
			});
			mock.method(sap.ui.core.mvc.Controller.prototype, "getView", () => this.oViewStub);
			this.oViewStub.setModel(this.oJSONModelStub);
		});

		after(() => {
			mock.reset();
		});

		it('Should add a todo element to the model', () => {
			assert.strictEqual(this.oJSONModelStub.getObject("/todos").length, 0, "There must be no todos defined.");

			// Act
			this.oJSONModelStub.setProperty("/todos", [{ title: "Completed item", completed: true }]);
			this.oJSONModelStub.setProperty("/newTodo", "new todo item");
			this.oAppController.addTodo();

			// Assumption
			assert.strictEqual(this.oJSONModelStub.getObject("/todos").length, 2, "There are couple items in ToDo list.");
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
			this.oJSONModelStub.setData(oModelData);

			// initial assumption
			assert.strictEqual(this.oJSONModelStub.getObject("/todos").length, 1, "There is one item.");
			assert.strictEqual(this.oJSONModelStub.getProperty("/itemsLeftCount"), 1, "There is one item left.");

			// Act
			this.oJSONModelStub.setProperty("/todos/0/completed", true);
			this.oAppController.updateItemsLeftCount();

			// Assumption
			assert.strictEqual(this.oJSONModelStub.getProperty("/itemsLeftCount"), 0, "There is no item left.");
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
			this.oJSONModelStub.setData(oModelData);


			// initial assumption
			assert.strictEqual(this.oJSONModelStub.getObject("/todos").length, 2, "There are two items.");
			assert.strictEqual(this.oJSONModelStub.getProperty("/itemsLeftCount"), 1, "There is no item left.");

			// Act
			this.oAppController.clearCompleted();
			this.oAppController.updateItemsLeftCount();

			// Assumption
			assert.strictEqual(this.oJSONModelStub.getObject("/todos").length, 1, "There is one item left.");
			assert.strictEqual(this.oJSONModelStub.getProperty("/itemsLeftCount"), 1, "There is one item left.");
		});

		it("Should update items left count when no todos are loaded, yet", () => {
			// Arrange
			var oModelData = {};
			this.oJSONModelStub.setData(oModelData);

			// initial assumption
			assert.strictEqual(this.oJSONModelStub.getObject("/todos"), undefined, "There are no items.");
			assert.strictEqual(this.oJSONModelStub.getProperty("/itemsLeftCount"), undefined, "Items left is not set");

			// Act
			this.oAppController.updateItemsLeftCount();

			// Assumption
			assert.strictEqual(this.oJSONModelStub.getProperty("/itemsLeftCount"), 0, "There is no item left.");
		});
	});


	describe('Test search', function () {
		before(() => {
			this.oAppController = new sap.ui.demo.todo.controller.App();
			this.oViewStub = new sap.ui.base.ManagedObject({});
			this.oListStub = new sap.ui.base.ManagedObject({});
			mock.method(sap.ui.core.mvc.Controller.prototype, "getView", () => this.oViewStub);
			mock.method(sap.ui.core.mvc.Controller.prototype, "byId", () => this.oListStub);
			mock.method(this.oListStub, "getBinding", () => {
				return { filter: function () { } };
			});

			this.oJSONModelStub = new sap.ui.model.json.JSONModel({
				todos: [],
			});
			this.oViewStub.setModel(this.oJSONModelStub);
			this.oViewStub.setModel(new sap.ui.model.json.JSONModel({}), "view");
			this.oViewStub.setModel(
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
			this.oAppController.onSearch(oEvent);

			// Assert
			assert.strictEqual(
				this.oAppController.sSearchQuery,
				"",
				"The search term is an empty string"
			);
			assert.deepEqual(
				this.oAppController.aSearchFilters,
				[],
				"Search filters are empty"
			);
			assert.strictEqual(
				this.oAppController
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
			this.oAppController.onSearch(oEvent);

			// Assert
			assert.strictEqual(
				this.oAppController.sSearchQuery,
				sSearchQuery,
				"The search term is an empty string"
			);
			assert.strictEqual(
				this.oAppController.aSearchFilters.length,
				1,
				"A search filter is constructed"
			);
			assert.strictEqual(
				this.oAppController
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
			this.oAppController = new sap.ui.demo.todo.controller.App();
			this.oViewStub = new sap.ui.base.ManagedObject({});
			this.oListStub = new sap.ui.base.ManagedObject({});
			mock.method(sap.ui.core.mvc.Controller.prototype, "getView", () => this.oViewStub);
			mock.method(sap.ui.core.mvc.Controller.prototype, "byId", () => this.oListStub);
			mock.method(this.oListStub, "getBinding", () => {
				return { filter: function () { } };
			});

			this.oJSONModelStub = new sap.ui.model.json.JSONModel({
				todos: [],
			});
			this.oViewStub.setModel(this.oJSONModelStub);
			this.oViewStub.setModel(new sap.ui.model.json.JSONModel({}), "view");
			this.oViewStub.setModel(
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
			this.oAppController.aSearchFilters = [];
			this.oAppController.onFilter(oEvent);

			// Assert
			assert.strictEqual(
				this.oAppController.sFilterKey,
				sKey,
				"Correct filter key is applied"
			);
			assert.strictEqual(
				this.oAppController.aTabFilters.length,
				0,
				"Empty key == no filter"
			);

			// Act
			sKey = "active"; // alters oEvent
			this.oAppController.onFilter(oEvent);
			// Assert
			assert.strictEqual(
				this.oAppController.sFilterKey,
				sKey,
				"Correct filter key is applied"
			);
			assert.strictEqual(
				this.oAppController.aTabFilters.length,
				1,
				"A filter is constructed"
			);

			// Act
			sKey = "completed"; // alters oEvent
			this.oAppController.onFilter(oEvent);
			// Assert
			assert.strictEqual(
				this.oAppController.sFilterKey,
				sKey,
				"Correct filter key is applied"
			);
			assert.strictEqual(
				this.oAppController.aTabFilters.length,
				1,
				"A filter is constructed"
			);

			// Act
			sKey = "completed"; // alters oEvent
			this.oAppController.sSearchQuery = "test";
			this.oAppController.onFilter(oEvent);
			// Assert
			assert.strictEqual(
				this.oAppController.sFilterKey,
				sKey,
				"Correct filter key is applied"
			);
			assert.strictEqual(
				this.oAppController.aTabFilters.length,
				1,
				"A filter is constructed"
			);

			// Act
			sKey = "all"; // alters oEvent
			this.oAppController.onFilter(oEvent);
			// Assert
			assert.strictEqual(
				this.oAppController.sFilterKey,
				sKey,
				"Correct filter key is applied"
			);
			assert.strictEqual(
				this.oAppController.aTabFilters.length,
				0,
				"Cleans up filters"
			);
		});
	});

});
