import { defineConfig, type Plugin } from 'vite';

/**
 * Writes umbraco-package.json into the build output. The version comes from the .csproj (passed in by MSBuild as
 * SA_PACKAGE_VERSION, which a release tag overrides), so the NuGet package and Umbraco always report the same one.
 */
function umbracoPackageManifest(): Plugin {
	return {
		name: 'sa-umbraco-package-manifest',
		generateBundle() {
			const manifest = {
				id: 'SA.Umbraco.MediaPreview',
				name: 'SA.Umbraco.MediaPreview',
				version: process.env.SA_PACKAGE_VERSION || process.env.npm_package_version,
				allowTelemetry: true,
				extensions: [
					{
						type: 'bundle',
						alias: 'SA.MediaPreview.Bundle',
						name: 'SA Media Preview Bundle',
						js: '/App_Plugins/SA.Umbraco.MediaPreview/sa-media-preview.js',
					},
				],
			};
			this.emitFile({ type: 'asset', fileName: 'umbraco-package.json', source: JSON.stringify(manifest, null, 2) });
		},
	};
}

export default defineConfig({
	plugins: [umbracoPackageManifest()],
	build: {
		lib: {
			entry: 'src/bundle.manifests.ts',
			formats: ['es'],
			fileName: 'sa-media-preview',
		},
		// Served from /App_Plugins/SA.Umbraco.MediaPreview/ via the Razor Class Library's StaticWebAssetBasePath.
		outDir: '../wwwroot',
		emptyOutDir: true,
		sourcemap: true,
		rollupOptions: {
			// Provided by the Umbraco backoffice at runtime through its import map.
			external: [/^@umbraco/],
		},
	},
});
