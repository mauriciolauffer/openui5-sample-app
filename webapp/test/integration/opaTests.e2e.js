/* global QUnit */

QUnit.config.autostart = false;

sap.ui.getCore().attachInit(function () {
	"use strict";

	sap.ui.require([
		"sap/ui/demo/todo/test/integration/AllJourneysE2E"
	], function() {
		QUnit.start();
	});
});
