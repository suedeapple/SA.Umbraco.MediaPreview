export type SaMediaKind = 'image' | 'video' | 'audio';

export interface SaMediaKindInfo {
	kind: SaMediaKind;
	mimeType: string;
}

// Formats browsers can display directly. TIFF, HEIC and RAW files are left out because browsers can't show them.
const IMAGE_MIME_TYPES: Record<string, string> = {
	avif: 'image/avif',
	bmp: 'image/bmp',
	gif: 'image/gif',
	ico: 'image/x-icon',
	jpeg: 'image/jpeg',
	jpg: 'image/jpeg',
	png: 'image/png',
	svg: 'image/svg+xml',
	webp: 'image/webp',
};

const VIDEO_MIME_TYPES: Record<string, string> = {
	'3g2': 'video/3gpp2',
	'3gp': 'video/3gpp',
	avi: 'video/x-msvideo',
	flv: 'video/x-flv',
	m4v: 'video/mp4',
	mkv: 'video/x-matroska',
	mov: 'video/quicktime',
	mp4: 'video/mp4',
	mpeg: 'video/mpeg',
	mpg: 'video/mpeg',
	ogv: 'video/ogg',
	webm: 'video/webm',
	wmv: 'video/x-ms-wmv',
};

const AUDIO_MIME_TYPES: Record<string, string> = {
	aac: 'audio/aac',
	aif: 'audio/aiff',
	aiff: 'audio/aiff',
	flac: 'audio/flac',
	m4a: 'audio/mp4',
	mp3: 'audio/mpeg',
	oga: 'audio/ogg',
	ogg: 'audio/ogg',
	opus: 'audio/ogg; codecs=opus',
	wav: 'audio/wav',
	weba: 'audio/webm',
	wma: 'audio/x-ms-wma',
};

/**
 * Returns what kind of preview a file extension gets, or undefined when there's nothing this browser can show.
 * Video and audio are only offered when the browser says it might play them, so formats like WMV, AVI and WMA
 * don't get a Preview button that would only fail.
 */
export function getPreviewKind(extension: string | undefined): SaMediaKindInfo | undefined {
	const ext = extension?.replace(/^\./, '').split('?')[0].toLowerCase();
	if (!ext) return undefined;

	if (IMAGE_MIME_TYPES[ext]) return { kind: 'image', mimeType: IMAGE_MIME_TYPES[ext] };

	const videoMimeType = VIDEO_MIME_TYPES[ext];
	const audioMimeType = AUDIO_MIME_TYPES[ext];
	const kind = videoMimeType ? 'video' : audioMimeType ? 'audio' : undefined;
	const mimeType = videoMimeType ?? audioMimeType;
	if (!kind || document.createElement(kind).canPlayType(mimeType) === '') return undefined;
	return { kind, mimeType };
}
