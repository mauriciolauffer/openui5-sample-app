/**
 * @jest-environment node
 * @ XXX jest-environment jsdom
 * jest-environment jsdom doesn't work because we need to use JSDOM.fromFile
 */

'use strict';

/* const { TextEncoder, TextDecoder } = require('util');
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;
const { JSDOM } = require('jsdom'); */


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

describe.skip('test suite JSDOM', function () {
	let dom = {};
	let window = {};
	let document = {};
	let sap = {};
	let context = {};

	beforeAll(async () => {
		dom = await buildFromFile();
		window = dom.window;
		document = dom.window.document;
		await new Promise((resolve) => {
			window.onUi5ModulesLoaded = () => {
				sap = window.sap;
				resolve();
			};
		});
	}, 20000);

	afterAll(() => {
		window.close();
	});

	afterEach(() => {
		jest.clearAllMocks();
		context = {};
	});

	describe('Test JSDOM', function () {
		it('test if Jest works correctly', function () {
			expect(1).toBeTruthy();
		});

		it('test if JSDOM has been loaded', function () {
			expect(window).toBeTruthy();
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
			context.oAppController = new sap.ui.demo.todo.controller.App();
			context.oViewStub = new sap.ui.base.ManagedObject({});
			context.oJSONModelStub = new sap.ui.model.json.JSONModel({
				todos: []
			});
			jest.spyOn(sap.ui.core.mvc.Controller.prototype, 'getView').mockReturnValue(context.oViewStub);
			context.oViewStub.setModel(context.oJSONModelStub);
		});

		it('Check controller initial state', () => {
			// Act
			context.oAppController.onInit();

			// Assert
			expect(context.oAppController.aSearchFilters).toEqual([]); //"Search filters have been instantiated empty"
			expect(context.oAppController.aTabFilters).toEqual([]); //"Tab filters have been instantiated empty"

			var oModel = context.oAppController.getView().getModel("view").getData();
			expect(oModel).toEqual({ isMobile: sap.ui.Device.browser.mobile, filterText: undefined });
		});
	});


	describe('Test model modification', function () {
		beforeEach(() => {
			context.oAppController = new sap.ui.demo.todo.controller.App();
			context.oViewStub = new sap.ui.base.ManagedObject({});
			context.oJSONModelStub = new sap.ui.model.json.JSONModel({
				todos: []
			});
			jest.spyOn(sap.ui.core.mvc.Controller.prototype, "getView").mockReturnValue(context.oViewStub);
			context.oViewStub.setModel(context.oJSONModelStub);
		});

		it('Should add a todo element to the model', () => {
			expect(context.oJSONModelStub.getObject("/todos").length).toStrictEqual(0); //"There must be no todos defined."

			// Act
			context.oJSONModelStub.setProperty("/todos", [{ title: "Completed item", completed: true }]);
			context.oJSONModelStub.setProperty("/newTodo", "new todo item");
			context.oAppController.addTodo();

			// Assumption
			expect(context.oJSONModelStub.getObject("/todos").length).toStrictEqual(2); //"There are couple items in ToDo list."
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
			context.oJSONModelStub.setData(oModelData);

			// initial assumption
			expect(context.oJSONModelStub.getObject("/todos").length).toStrictEqual(1); //"There is one item."
			expect(context.oJSONModelStub.getProperty("/itemsLeftCount")).toStrictEqual(1); //"There is one item left."

			// Act
			context.oJSONModelStub.setProperty("/todos/0/completed", true);
			context.oAppController.updateItemsLeftCount();

			// Assumption
			expect(context.oJSONModelStub.getProperty("/itemsLeftCount")).toStrictEqual(0); //"There is no item left."
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
			context.oJSONModelStub.setData(oModelData);


			// initial assumption
			expect(context.oJSONModelStub.getObject("/todos").length).toStrictEqual(2); //"There are two items."
			expect(context.oJSONModelStub.getProperty("/itemsLeftCount")).toStrictEqual(1); //"There is no item left."

			// Act
			context.oAppController.clearCompleted();
			context.oAppController.updateItemsLeftCount();

			// Assumption
			expect(context.oJSONModelStub.getObject("/todos").length).toStrictEqual(1); //"There is one item left."
			expect(context.oJSONModelStub.getProperty("/itemsLeftCount")).toStrictEqual(1); //"There is one item left."
		});

		it("Should update items left count when no todos are loaded, yet", () => {
			// Arrange
			var oModelData = {};
			context.oJSONModelStub.setData(oModelData);

			// initial assumption
			expect(context.oJSONModelStub.getObject("/todos")).toBeUndefined(); //"There are no items."
			expect(context.oJSONModelStub.getProperty("/itemsLeftCount")).toBeUndefined(); //"Items left is not set"

			// Act
			context.oAppController.updateItemsLeftCount();

			// Assumption
			expect(context.oJSONModelStub.getProperty("/itemsLeftCount")).toStrictEqual(0); //"There is no item left."
		});
	});


	describe('Test search', function () {
		beforeEach(() => {
			context.oAppController = new sap.ui.demo.todo.controller.App();
			context.oViewStub = new sap.ui.base.ManagedObject({});
			context.oListStub = new sap.ui.base.ManagedObject({});
			jest.spyOn(sap.ui.core.mvc.Controller.prototype, "getView").mockReturnValue(context.oViewStub);
			jest.spyOn(sap.ui.core.mvc.Controller.prototype, "byId").mockReturnValue(context.oListStub);
			jest.spyOn(context.oListStub, "getBinding").mockReturnValue({ filter: function () { } });

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

		it("Empty search", () => {
			// Setup
			var oEvent = {
				getSource: function () {
					return { getValue: function () { return ""; } };
				}
			};

			// Act
			context.oAppController.onSearch(oEvent);

			// Assert
			expect(context.oAppController.sSearchQuery).toStrictEqual(""); //"The search term is an empty string"
			expect(context.oAppController.aSearchFilters).toEqual([]); //"Search filters are empty"
			expect(context.oAppController.getView().getModel().getProperty("/itemsRemovable")).toStrictEqual(true); //"Button toggle is properly set"
		});

		it("Do a search", () => {
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
			expect(context.oAppController.sSearchQuery).toStrictEqual(sSearchQuery); //"The search term is an empty string"
			expect(context.oAppController.aSearchFilters.length).toStrictEqual(1); //"A search filter is constructed"
			expect(context.oAppController.getView().getModel().getProperty("/itemsRemovable")).toStrictEqual(false); //"Button toggle is properly set"
		});
	});


	describe("Test filtering", function () {
		beforeEach(() => {
			context.oAppController = new sap.ui.demo.todo.controller.App();
			context.oViewStub = new sap.ui.base.ManagedObject({});
			context.oListStub = new sap.ui.base.ManagedObject({});
			jest.spyOn(sap.ui.core.mvc.Controller.prototype, "getView").mockReturnValue(context.oViewStub);
			jest.spyOn(sap.ui.core.mvc.Controller.prototype, "byId").mockReturnValue(context.oListStub);
			jest.spyOn(context.oListStub, "getBinding").mockReturnValue({ filter: function () { } });

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

		it("Toggle filters", () => {
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
			expect(context.oAppController.sFilterKey).toStrictEqual(sKey); //"Correct filter key is applied"
			expect(context.oAppController.aTabFilters.length).toStrictEqual(0); //"Empty key == no filter"

			// Act
			sKey = "active"; // alters oEvent
			context.oAppController.onFilter(oEvent);
			// Assert
			expect(context.oAppController.sFilterKey).toStrictEqual(sKey); //"Correct filter key is applied"
			expect(context.oAppController.aTabFilters.length).toStrictEqual(1); //"A filter is constructed"

			// Act
			sKey = "completed"; // alters oEvent
			context.oAppController.onFilter(oEvent);
			// Assert
			expect(context.oAppController.sFilterKey).toStrictEqual(sKey); //"Correct filter key is applied"
			expect(context.oAppController.aTabFilters.length).toStrictEqual(1); //"A filter is constructed"

			// Act
			sKey = "completed"; // alters oEvent
			context.oAppController.sSearchQuery = "test";
			context.oAppController.onFilter(oEvent);
			// Assert
			expect(context.oAppController.sFilterKey).toStrictEqual(sKey); //"Correct filter key is applied"
			expect(context.oAppController.aTabFilters.length).toStrictEqual(1); //"A filter is constructed"

			// Act
			sKey = "all"; // alters oEvent
			context.oAppController.onFilter(oEvent);
			// Assert
			expect(context.oAppController.sFilterKey).toStrictEqual(sKey); //"Correct filter key is applied"
			expect(context.oAppController.aTabFilters.length).toStrictEqual(0); //"Cleans up filters"
		});
	});

});
