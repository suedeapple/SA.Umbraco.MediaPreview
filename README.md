# SA.Umbraco.MediaPreview

![Media library with the Preview eye button on a video card](https://raw.githubusercontent.com/suedeapple/SA.Umbraco.MediaPreview/main/docs/screenshots/01-media-library.png)

Adds a **Preview** action to media items in the Umbraco media library. When you hover over a file's card, it's the one-click eye button next to the "..." menu, and it opens the media item's standard editor as a fly-out from the right. You can view the image or play the video or audio with Umbraco's built-in players without leaving the media section, then close the fly-out to carry on where you were.

It uses only what Umbraco already provides: the fly-out is the same media editor the Media Picker opens, and Umbraco's cards are not replaced or modified.

Requires Umbraco 17.3 or later. Earlier 17.x versions have no actions on media cards, so there is nowhere for the button to appear. Tested on 17.3.0, 17.7.1 and 18.2.1.

## Install

```bash
dotnet add package SA.Umbraco.MediaPreview
```

No configuration needed.

## How it works

Preview is a standard Umbraco **entity action** for media. Media cards show their highest weighted action as a one-click button beside the "..." menu; Preview has a higher weight than Create, so on files it takes that spot and Create moves into the "..." menu.

A condition limits Preview to items shown in the media library's grid or list (it links to the fly-out route Umbraco's collection already registers for its items) and excludes folders, so:

- **Files** in the media library show the eye button.
- **Folders** keep Create (+) as their one-click button.
- **The media tree** is unchanged.

### Future Umbraco versions

The package is built to fail safe rather than break:

- It finds which item a card is for in the same way Umbraco's own card actions do, so it keeps working as long as Umbraco's "..." menu does.
- If the media library's fly-out route ever isn't available, the eye opens the item's normal edit page instead of doing nothing.

## Development

The backoffice extension lives in `src/SA.Umbraco.MediaPreview/Client` (TypeScript, Lit, Vite). It builds into `src/SA.Umbraco.MediaPreview/wwwroot`, which the Razor Class Library serves from `/App_Plugins/SA.Umbraco.MediaPreview/`.

Building the project runs `npm ci` and `npm run build` automatically, so you need Node.js 20.19+ or 22.12+ installed.

```bash
# Build the NuGet package
dotnet pack src/SA.Umbraco.MediaPreview -c Release -o ./artifacts

# Work on the client with rebuild on save
cd src/SA.Umbraco.MediaPreview/Client
npm run watch
```

To try it in a local Umbraco site, add a project reference to `src/SA.Umbraco.MediaPreview/SA.Umbraco.MediaPreview.csproj`, or add `./artifacts` as a local NuGet source and install the package.

To skip the client build (for example when a CI step has already built `wwwroot`), pass `-p:SkipClientBuild=true`.

### Releasing

Push a version tag to release to NuGet:

```bash
git tag 1.0.0
git push origin 1.0.0
```

The `Release to NuGet` workflow (`.github/workflows/release.yml`) packs the project with the tag as the version and pushes it to nuget.org using NuGet trusted publishing, so no API key is stored in the repository. Running the workflow by hand packs the version set in the `.csproj`.

The version only needs setting in one place: the build writes it into `umbraco-package.json`, so Umbraco and NuGet always agree.

`umbraco-marketplace.json` holds the listing details for the [Umbraco Marketplace](https://marketplace.umbraco.com), which picks up packages tagged `umbraco-marketplace` on NuGet.
