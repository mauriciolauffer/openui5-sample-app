module.exports.config = {
	specs: ["./**/*.test.js"],

	suites: {
		unit: ["unit/*.test.js"],
		opa: ["integration/*.test.js"]
	},

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
		"qunit",
		[
			"monocart",
			{
				name: "WebdriverIO Coverage Report",
				filter: {
					"**/resources/**": false,
					"**/test-resources/**": false,
					"**/test/**": false,
					"**/**": true,
				},
				reports: ["v8"],
				outputDir: "./coverage",
			},
		],
	],

	mochaOpts: {
		ui: "bdd",
		timeout: 30000,
	},
};
