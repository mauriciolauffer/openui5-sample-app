QUnit.config.autostart = false;

sap.ui.getCore().ready(() => {
  "use strict";

  sap.ui.require(["sap/ui/demo/todo/test/unit/unitTests.qunit"], () => QUnit.start());
});
