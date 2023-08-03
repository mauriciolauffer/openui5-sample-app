/** @type {import('jest').Config} */
const config = {
	verbose: true,
	restoreMocks: true,
	//preset: "jest-puppeteer",
	//testEnvironment: '@mediaeventservices/jest-environment-jsdom-external-scripts',
	/* testEnvironment: 'jsdom',
	testEnvironmentOptions: {
		resources: 'usable',
		//url: "http://localhost:8080/", // "https://ui5.sap.com/",
		referrer: "https://ui5.sap.com/",
		runScripts: 'dangerously',
		pretendToBeVisual: true,
		beforeParse: (jsdomWindow) => {
			jsdomWindow.matchMedia = function () {
				return {
					matches: false,
					addListener: function () {},
					removeListener: function () {}
				};
			};
			jsdomWindow.performance.timing = {
				fetchStart: Date.now(),
				navigationStart: Date.now(),
			};
		}
	}, */
	/* testEnvironment: "@happy-dom/jest-environment",
	testEnvironmentOptions: {
		url: 'https://ui5.sap.com/',
		//url: 'http://localhost:8080/',
		width: 1024,
		height: 768,
		settings: {
			enableFileSystemHttpRequests: true
		}
	} */
};

//export default config;
module.exports = config;
