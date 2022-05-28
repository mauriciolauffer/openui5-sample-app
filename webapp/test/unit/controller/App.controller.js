sap.ui.define([
	"sap/ui/base/ManagedObject",
	"sap/ui/core/mvc/Controller",
	"sap/ui/demo/todo/controller/App.controller",
	"sap/ui/model/json/JSONModel"
], function (ManagedObject, Controller, AppController, JSONModel) {
	"use strict";

	const assert = chai.assert;

	describe("Test model modification", function () {
		beforeEach(function () {
			this.oAppController = new AppController();
			this.oViewStub = new ManagedObject({});
			sinon.stub(Controller.prototype, "getView").returns(this.oViewStub);

			this.oJSONModelStub = new JSONModel({
				todos: []
			});
			this.oViewStub.setModel(this.oJSONModelStub);
		});

		afterEach(function () {
			Controller.prototype.getView.restore();
			this.oViewStub.destroy();
		});

		it("Should add a todo element to the model", function() {
			// Arrange
			// initial assumption: to-do list is empty
			assert.strictEqual(this.oJSONModelStub.getObject("/todos").length, 0, "There must be no todos defined.");

			// Act
			this.oJSONModelStub.setProperty("/newTodo", "new todo item");
			this.oAppController.addTodo();

			// Assumption
			assert.strictEqual(this.oJSONModelStub.getObject("/todos").length, 1, "There is one new item.");
		});

		it("Should toggle the completed items in the model", function() {
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

		it("Should clear the completed items", function() {
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

		it("Should update items left count when no todos are loaded, yet", function() {
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
});
