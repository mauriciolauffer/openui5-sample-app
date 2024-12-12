QUnit.config.autostart = false;

sap.ui.getCore().ready(() => {
  "use strict";

  sap.ui.require(["sap/ui/demo/todo/test/integration/opaTests.qunit"], () => QUnit.start());
});
