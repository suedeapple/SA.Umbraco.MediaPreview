# SA.Umbraco.MediaPlay

Adds a **Preview** button to media cards in the Umbraco media library. It appears when you hover over a card (or tab to it), next to Umbraco's own card actions, and opens the file in a full screen lightbox:

- **Images** are shown enlarged to fit the screen (small images are scaled up to at most 2× so they stay sharp enough).
- **Video** plays large with the browser's native controls.
- **Audio** plays with a waveform: click or drag on it to seek, or use the arrow keys.

Close with Escape, the close button, or a click on the dark background. "Open file" opens the original in a new tab.

No third party dependencies: the players are the browser's own `<video>` and `<audio>` elements, and the waveform is drawn from the audio file in the browser.

Requires Umbraco 17.5 or later.

## Install

```bash
dotnet add package SA.Umbraco.MediaPlay
```

No configuration needed.

## Supported formats

| Type  | Extensions |
| ----- | ---------- |
| Image | jpg, jpeg, png, gif, webp, avif, svg, bmp, ico |
| Video | mp4, m4v, mov, webm, ogv, mkv, mpeg, mpg, 3gp, 3g2 |
| Audio | mp3, m4a, aac, wav, ogg, oga, opus, weba, flac, aif, aiff |

The button only appears for video and audio the editor's browser says it can play, so files such as WMV, AVI or WMA don't get a button that would only fail. Waveforms are drawn for audio files up to 20 MB; larger files play normally with a flat placeholder instead of a waveform.

## Where the button appears

The button is added to the media library's grid view, using Umbraco's `entityCollectionItemCard` extension point (added in Umbraco 17.3). This package registers a media card with a higher weight than the core one, renders the same card, and adds the button.

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
