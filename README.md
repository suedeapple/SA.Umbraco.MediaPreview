# SA.Umbraco.MediaPreview

![Media library with the Preview eye button on a video card](https://raw.githubusercontent.com/suedeapple/SA.Umbraco.MediaPreview/main/docs/screenshots/02-media-library.png)

Preview images, video and audio straight from the Umbraco media library.

Hover over a file's card and click the eye next to the "..." menu. The media item opens in a fly-out from the right, where you can view the image or play the video or audio with Umbraco's built-in players. Close the fly-out and you're back where you were, in the same folder and position.

<img src="https://raw.githubusercontent.com/suedeapple/SA.Umbraco.MediaPreview/main/docs/screenshots/01-preview-button.png" alt="Close-up of a media card with the Preview eye button highlighted" width="360">

## Requirements

Umbraco 17.3 or later, including Umbraco 18. Earlier 17.x versions have no buttons on media cards, so there is nowhere for the eye to appear.

## Install

```bash
dotnet add package SA.Umbraco.MediaPreview
```

No configuration needed. Rebuild and run your site, then open the Media section.

## What changes

- **Files** in the media library show the eye as their one-click button. The Create (+) action moves into the "..." menu for files.
- **Folders** keep Create (+) as their one-click button.
- **The media tree** on the left is unchanged.

The fly-out is Umbraco's own media editor, the same one that opens when you click a picked item in a Media Picker, so you can also make and save changes there. Umbraco's cards aren't replaced or modified.

## Support

Found a problem or have an idea? [Open an issue](https://github.com/suedeapple/SA.Umbraco.MediaPreview/issues).
