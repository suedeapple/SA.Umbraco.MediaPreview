import type { UmbLocalizationDictionary } from '@umbraco-cms/backoffice/localization-api';

export default {
	saMediaPlay: {
		tabLabel: 'Preview',
		details: 'Details',
		format: 'Format',
		duration: 'Duration',
		resolution: 'Resolution',
		fileSize: 'File size',
		unknown: 'Unknown',
		openFile: 'Open file',
		noFile: 'This media item has no audio or video file to play.',
		cannotPlayHeadline: "Your browser can't play this file",
		cannotPlayFormat: (format: string) =>
			`The ${format} format, or the codec inside it, isn't supported by this browser. For reliable playback convert video to MP4 (H.264 + AAC) or WebM, and audio to MP3, M4A (AAC) or OGG.`,
		mayNotPlay: (format: string) => `Browsers often can't play ${format} files. If nothing plays, convert the file to MP4 or MP3.`,
		loadError: "The file couldn't be loaded. Check that it exists and that this site can access it.",
		decodeError: 'The file appears to be damaged or uses a codec this browser can only partly decode.',
	},
} satisfies UmbLocalizationDictionary;
