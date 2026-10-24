# SA.Umbraco.MediaPlay

Adds a **Preview** tab to Umbraco media items that hold a video or audio file, so editors can play the file in the backoffice.

- Native browser `<video>` and `<audio>` players, no third party dependencies.
- Shows format, duration, resolution (video) and file size.
- The tab appears once the media item is saved. (Umbraco discards its in-browser copy of an unsaved upload when you leave the Details tab, so there is nothing to play until then.)
- Explains why a file won't play (unsupported format or codec, missing file, damaged file) instead of showing a blank player.
- Works on any media type whose file property uses the `umbracoFile` alias, including the built-in Video, Audio and File types and your own types.

Supports Umbraco 17 and later.

## Install

```bash
dotnet add package SA.Umbraco.MediaPlay
```

No configuration needed. Rebuild, run the site and open a media item that has a video or audio file.

## Supported formats

The tab appears for these extensions. Whether a file actually plays depends on the editor's browser and the codec inside the file.

| Type  | Extensions |
| ----- | ---------- |
| Video | mp4, m4v, mov, webm, ogv, mkv, mpeg, mpg, 3gp, 3g2, avi, wmv, flv |
| Audio | mp3, m4a, aac, wav, ogg, oga, opus, weba, flac, aif, aiff, wma |

MP4 (H.264 + AAC), WebM, MP3, M4A and WAV play in every modern browser. AVI, WMV, FLV and WMA generally don't. HEVC `.mov` files play in Safari and in some other browsers depending on the operating system. The preview tells the editor when a file can't play.

## Relationship to Umbraco's built-in preview

Since Umbraco 14 the upload field on the media item's main tab shows a small native player for many audio and video types. This package adds a dedicated tab with a larger player, file details and clear error messages, and it also recognises `.m4a` and `.flac`, which the built-in preview shows as a generic file.

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

To try it in a local Umbraco 17 site, add a project reference to `src/SA.Umbraco.MediaPlay/SA.Umbraco.MediaPlay.csproj`, or add `./artifacts` as a local NuGet source and install the package.

To skip the client build (for example when a CI step has already built `wwwroot`), pass `-p:SkipClientBuild=true`.

### Versioning

Keep the version in `SA.Umbraco.MediaPlay.csproj` and `Client/public/umbraco-package.json` in step.
