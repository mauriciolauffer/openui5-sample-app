import { test, expect } from '@playwright/test';
import UIComponent from "sap/ui/core/UIComponent";
import OpaBuilder from "sap/ui/test/OpaBuilder";


test('run gremlins.js', async ({ page }) => {
  await page.goto('http://localhost:8080/index.html');
  const xx = await page.evaluate(() => sap.ui.getCore());
	await page.evaluate(() => sap.ui.require(['sap/ui/test/Opa5', 'sap/ui/test/OpaBuilder']));
	
  await page.waitForSelector('#container');

	/*
new xxxOpaBuilder()
	.hasType("sap.m.Input")
	.viewName("sap.ui.demo.todo.view.App")
	.success(console.dir)
	.execute()
	.emptyQueue()
	*/

  const opa5 = await page.evaluate(() => sap.ui.test.Opa5.getUtils());
	console.dir(opa5);
  const opabuilder = await page.evaluate(() => sap.ui.test.OpaBuilder);
	console.dir(opabuilder);
	console.dir(opabuilder);
	console.dir(UIComponent);
	console.dir(OpaBuilder);


  const code = await page.locator('#container');
  await expect(code).toBeTruthy();
  //test.slow();
  //const attack = await page.evaluate(() => gremlins.createHorde().unleash());
});
