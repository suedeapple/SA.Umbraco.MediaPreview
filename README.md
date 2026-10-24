# SA.Umbraco.MediaPlay

Adds a **Preview** button to media cards in the Umbraco media library. It appears when you hover over a card (or tab to it), next to Umbraco's own card actions, and opens the media item's standard editor as a fly-out from the right. You can view the image or play the video or audio with Umbraco's built-in players without leaving the media section, then close the fly-out to carry on where you were.

It uses only what Umbraco already provides: the fly-out is the same media editor the Media Picker opens, and the cards are otherwise unchanged. Folders don't get the button.

Requires Umbraco 17.5 or later.

## Install

```bash
dotnet add package SA.Umbraco.MediaPlay
```

No configuration needed.

## Where the button appears

The button is added to the media library's grid view, using Umbraco's `entityCollectionItemCard` extension point (added in Umbraco 17.3). This package registers a media card with a higher weight than the core one, renders the same card, and adds the button. The fly-out is a modal route for Umbraco's `UMB_WORKSPACE_MODAL`, registered the same way the Media Picker does it.

Umbraco doesn't offer an extension point for the cards in the media picker dialog or the media picker property editor, so those are unchanged.

## Development

The backoffice extension lives in `src/SA.Umbraco.MediaPlay/Client` (TypeScript, Lit, Vite). It builds into `src/SA.Umbraco.MediaPlay/wwwroot`, which the Razor Class Library serves from `/App_Plugins/SA.Umbraco.MediaPlay/`.

Building the project runs `npm ci` and `npm run build` automatically, so you need Node.js 20.19+ or 22.12+ installed.

```bash
# Build the NuGet package
dotnet pack src/SA.Umbraco.MediaPlay -c Release -o ./artifacts

# Work on the client with rebuild on save
cd src/SA.Umbraco.MediaPlay/Client
npm run watch
```

To try it in a local Umbraco site, add a project reference to `src/SA.Umbraco.MediaPlay/SA.Umbraco.MediaPlay.csproj`, or add `./artifacts` as a local NuGet source and install the package.

To skip the client build (for example when a CI step has already built `wwwroot`), pass `-p:SkipClientBuild=true`.

### Versioning

Keep the version in `SA.Umbraco.MediaPlay.csproj` and `Client/public/umbraco-package.json` in step.
