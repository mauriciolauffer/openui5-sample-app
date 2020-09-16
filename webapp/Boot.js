sap.ui.define([
	"sap/ui/core/Core",
    "sap/ui/core/library", // avoid library preload of sap.ui.core
	"sap/m/library"        // avoid library preload of sap.m
], function(Core) {
    "use strict";
    // preload the library resources bundles async
    // which happens automatically for library preload
    Promise.all([
        Core.getLibraryResourceBundle("sap.ui.core", true),
        Core.getLibraryResourceBundle("sap.m", true),
		Promise.resolve()
    ]).then(function() {
        // boot the Core:
        //   - loads the Component-bundle defined in data-sap-ui-modules
        //   - using the ComponentSupport in sap-ui-onInit to load the declared component
        Core.boot();
    });

});
