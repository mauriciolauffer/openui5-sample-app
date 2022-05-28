module.exports = function (config) {
	"use strict";

	var chromeFlags = [
		"--window-size=1280,1024"
	];

	config.set({

		frameworks: ["mocha", "chai", "sinon"],

		files: [
			"https://ui5.sap.com/1.96.0/resources/sap-ui-core.js",
			"webapp/test/karma-mocha-ui5-config.js",
			{ pattern: "webapp/test/**/*.js", included: true, served: true, watched: true },
			{ pattern: "webapp/**/*.js", included: false, served: true, watched: true }
		],

		exclude: [
			'webapp/test/unit/*.js'
		],

		useIframe: false,

		browsers: ["CustomChrome"],

		browserConsoleLogOptions: {
			level: "error"
		},

		customLaunchers: {
			CustomChrome: {
				base: "Chrome",
				flags: chromeFlags
			},
			CustomChromeHeadless: {
				base: "ChromeHeadless",
				flags: chromeFlags
			}
		},

	});
};
