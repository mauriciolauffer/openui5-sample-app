mocha.setup('bdd');
mocha.checkLeaks();

sap.ui.getCore().attachInit(function () {
	"use strict";

	sap.ui.require([
		"test/unit/AllTests"
	], function () {
		mocha.run();
	});
});
