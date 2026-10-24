import { defineConfig } from 'vite';

export default defineConfig({
	build: {
		lib: {
			entry: 'src/bundle.manifests.ts',
			formats: ['es'],
			fileName: 'sa-media-play',
		},
		// Served from /App_Plugins/SA.Umbraco.MediaPlay/ via the Razor Class Library's StaticWebAssetBasePath.
		outDir: '../wwwroot',
		emptyOutDir: true,
		sourcemap: true,
		rollupOptions: {
			// Provided by the Umbraco backoffice at runtime through its import map.
			external: [/^@umbraco/],
		},
	},
});
