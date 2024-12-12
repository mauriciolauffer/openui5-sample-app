/* global browser */
describe("QUnit test page", function() {
  it("should pass QUnit v2 tests - LOCAL", async function() {
    await browser.url("http://localhost:8080/test/wdio-qunit/unit/unitTests.qunit.html");
    await browser.getQUnitResults();
  });
});
