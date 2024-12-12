module.exports.config = {
	capabilities: [
		{
			browserName: "chrome",
			browserVersion: "stable",
			"goog:chromeOptions": {
				args: ["headless", "disable-gpu", "window-size=1024,768"],
			},
		},
	],

	logLevel: "warn",
	framework: "mocha",
	reporters: ["spec"],
	waitforTimeout: 120000,

	services: [
		[
			"qunit",
			{
				paths: [
					"http://localhost:8080/test/wdio-qunit/unit/unitTests.qunit.html",
				],
			},
		],
	],

	mochaOpts: {
		ui: "bdd",
		timeout: 30000,
	},
};
