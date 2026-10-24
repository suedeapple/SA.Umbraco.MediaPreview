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

A condition (`condition/can-preview-media.condition.ts`) limits Preview to items shown in the media library's grid or list and excludes folders. The action links to the fly-out route Umbraco's media collection already registers for its items.

The package is built to fail safe on future Umbraco versions:

- The condition finds which item a card is for through `UMB_ENTITY_CONTEXT`, the same way Umbraco's own card actions do, rather than relying on the actions bundle's fallback context, which Umbraco plans to remove in v19.
- If the collection's fly-out route isn't available, the action links to the item's normal edit page instead of doing nothing.

## Releasing

Push a version tag to release to NuGet:

```bash
git tag 1.0.0
git push origin 1.0.0
```

The `Release to NuGet` workflow (`.github/workflows/release.yml`) packs the project with the tag as the version and pushes it to nuget.org using NuGet trusted publishing. Running the workflow by hand packs the version set in the `.csproj`.

The version only needs setting in one place: the build writes it into `umbraco-package.json`, so Umbraco and NuGet always agree.

`umbraco-marketplace.json` holds the listing details for the [Umbraco Marketplace](https://marketplace.umbraco.com), which picks up packages tagged `umbraco-marketplace` on NuGet.
