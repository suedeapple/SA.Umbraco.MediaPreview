import { SA_MEDIA_PLAY_BYTES_PROPERTY_ALIAS, SA_MEDIA_PLAY_FILE_PROPERTY_ALIAS } from './constants.js';

export type SaMediaKind = 'video' | 'audio';

export interface SaPlayableFile {
	kind: SaMediaKind;
	/** The `src` from the property value, normally a server relative path. */
	src: string;
	fileName: string;
	/** Lower case extension without the dot. */
	extension: string;
	mimeType: string;
	bytes?: number;
}

interface SaPropertyValue {
	alias: string;
	value?: unknown;
}

// Includes formats browsers usually can't play (wmv, avi, flv...) so the preview can explain why rather than hide.
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

function getSrc(value: unknown): string | undefined {
	if (typeof value === 'string') return value || undefined;
	if (value && typeof value === 'object' && 'src' in value && typeof value.src === 'string') return value.src || undefined;
	return undefined;
}

function getBytes(value: unknown): number | undefined {
	const bytes = typeof value === 'number' ? value : parseInt(String(value ?? ''), 10);
	return Number.isFinite(bytes) && bytes > 0 ? bytes : undefined;
}

/**
 * Works out whether the media item's saved file is audio or video, judged by its extension.
 * Unsaved uploads are ignored: their src is a blob URL that Umbraco's upload field revokes as soon as the
 * Details tab is left, so there would be nothing to play.
 */
export function resolvePlayableFile(values: Array<SaPropertyValue> | undefined): SaPlayableFile | undefined {
	const src = getSrc(values?.find((x) => x.alias === SA_MEDIA_PLAY_FILE_PROPERTY_ALIAS)?.value);
	if (!src || src.startsWith('blob:')) return undefined;

	const rawFileName = src.split('?')[0].split('/').pop() ?? '';
	let fileName = rawFileName;
	try {
		fileName = decodeURIComponent(rawFileName);
	} catch {
		// Leave a malformed name as it is.
	}
	const extension = fileName.includes('.') ? fileName.split('.').pop()!.toLowerCase() : undefined;
	if (!extension) return undefined;

	const videoMimeType = VIDEO_MIME_TYPES[extension];
	const audioMimeType = AUDIO_MIME_TYPES[extension];
	if (!videoMimeType && !audioMimeType) return undefined;

	const bytes = getBytes(values?.find((x) => x.alias === SA_MEDIA_PLAY_BYTES_PROPERTY_ALIAS)?.value);
	return videoMimeType
		? { kind: 'video', src, fileName, extension, mimeType: videoMimeType, bytes }
		: { kind: 'audio', src, fileName, extension, mimeType: audioMimeType, bytes };
}
