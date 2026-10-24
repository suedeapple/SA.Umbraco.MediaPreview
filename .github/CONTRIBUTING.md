# Contributing

Contributions to this package are most welcome!

## Development setup

1. Fork the repository, then clone your fork
2. Open `SA.Umbraco.MediaPreview.slnx` in Visual Studio or Rider
3. Build the solution: `dotnet build`

Building runs `npm ci` and `npm run build` for the backoffice extension automatically, so you need Node.js 20.19+ or 22.12+ installed.

The backoffice extension lives in `src/SA.Umbraco.MediaPreview/Client` (TypeScript, Lit, Vite). It builds into `src/SA.Umbraco.MediaPreview/wwwroot`, which is served from `/App_Plugins/SA.Umbraco.MediaPreview/`. To rebuild it on save while you work:

```bash
cd src/SA.Umbraco.MediaPreview/Client
npm run watch
```

To test against a real Umbraco site, add a project reference from your local Umbraco site to `src/SA.Umbraco.MediaPreview/SA.Umbraco.MediaPreview.csproj`.

To skip the client build (for example when `wwwroot` is already built), pass `-p:SkipClientBuild=true`.

## How it works

Preview is a standard Umbraco entity action for media (`entity-action/preview-media.entity-action.ts`). Media cards show their highest weighted action as a one-click button beside the "..." menu; Preview has a higher weight than Create, so on files it takes that spot.

Copy URL (`entity-action/copy-media-url.entity-action.ts`) sits just below it in the "..." menu. It looks up the file's URL when clicked, using Umbraco's media URL repository. Umbraco has no "Copy URL" term, so its English label is registered in `bundle.manifests.ts`.

A condition (`condition/can-preview-media.condition.ts`) limits both actions to items shown in the media library's grid or list and excludes folders. Preview links to the fly-out route Umbraco's media collection already registers for its items.

## Supported Umbraco versions

The package supports Umbraco 17.3 up to 18 (`[17.3.0, 19.0.0)` in the `.csproj`), so NuGet won't install it on a newer major. When a new major is released, test against it and raise the upper bound.

## Releasing

Push a version tag to release to NuGet:

```bash
git tag 1.0.0
git push origin 1.0.0
```

The `Release to NuGet` workflow (`.github/workflows/release.yml`) packs the project with the tag as the version and pushes it to nuget.org using NuGet trusted publishing. Running the workflow by hand packs the version set in the `.csproj`.

The version only needs setting in one place: the build writes it into `umbraco-package.json`, so Umbraco and NuGet always agree.

`umbraco-marketplace.json` holds the listing details for the [Umbraco Marketplace](https://marketplace.umbraco.com), which picks up packages tagged `umbraco-marketplace` on NuGet.
