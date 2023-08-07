import { defineConfig } from 'vite';

export default defineConfig({
	root: './webapp',
	/* server: {
	  open: '/webapp/index.html',
	} */
	test: {
		//include: ['test/*.{test,spec}.js'],
		environmentOptions: {

		},
		xxxbrowser: {
			provider: 'playwright',
			enabled: true,
			headless: true,
			name: 'chromium', // browser name is required
		},
	}
});
