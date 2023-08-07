/**
 * @vitest-environment node
 */

'use strict';

import path from 'path';
import { describe, it, beforeAll, beforeEach, afterAll, afterEach, expect, vi } from 'vitest';

describe.skip('test suite', function () {
	let sap = {};

	beforeAll(async () => {
		console.log(__dirname);
		//await page.goto('http://localhost:8080/test/test-jsdom.html');
		await page.goto(`file:${path.join(__dirname, '../test-jsdom.html')}`);
	});

	afterAll(() => {
		//page.close();
	});

	describe('Test jest', function () {
		it('test if node:test works correctly', () => {
			expect(1).toBe(1);
		});

		it('test if Puppeteer has been loaded', async () => {
			expect(page).toBeTruthy();
			await expect(page.title()).resolves.toMatch('OpenUI5 Todo App');
		});

		it('test if UI5 has been loaded', async () => {
			sap = await page.evaluate(() => sap);
			await expect(sap).toBeTruthy();
			await expect(sap.ui.demo.todo.controller.App).toBeTruthy();
			/* const appJS = await page.evaluate(() => sap.ui.demo.todo.controller.App);
			console.dir(appJS);
			await expect(appJS).toBeTruthy();
			appJS.yoooooooooo = "NEW STUFFF!!!!";
			console.dir(await page.evaluate(() => sap.ui.demo.todo.controller.App));
			console.dir(appJS); */
		});
	});

	describe('Test init state', function () {
		beforeEach(async () => {
			await page.evaluate(() => {
				window.oAppController = new sap.ui.demo.todo.controller.App();
				window.oViewStub = new sap.ui.base.ManagedObject({});
				window.oJSONModelStub = new sap.ui.model.json.JSONModel({
					todos: []
				});
				jest.spyOn(sap.ui.core.mvc.Controller.prototype, 'getView').mockReturnValue(window.oViewStub);
				window.oViewStub.setModel(window.oJSONModelStub);
			});
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
