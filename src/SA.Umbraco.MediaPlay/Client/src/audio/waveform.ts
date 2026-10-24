/** Files larger than this are not downloaded for a waveform; a flat placeholder is shown instead. */
const MAX_WAVEFORM_BYTES = 20 * 1024 * 1024;

const cache = new Map<string, Promise<Array<number> | undefined>>();

async function computePeaks(url: string, bars: number): Promise<Array<number> | undefined> {
	const abort = new AbortController();
	const response = await fetch(url, { signal: abort.signal, credentials: 'same-origin' });
	if (!response.ok) return undefined;

	const length = Number(response.headers.get('content-length'));
	if (length > MAX_WAVEFORM_BYTES) {
		abort.abort();
		return undefined;
	}

	const buffer = await response.arrayBuffer();
	if (buffer.byteLength > MAX_WAVEFORM_BYTES) return undefined;

	// An OfflineAudioContext can decode without the user gesture a normal AudioContext needs.
	const audio = await new OfflineAudioContext(1, 1, 44100).decodeAudioData(buffer);
	const channels = Array.from({ length: audio.numberOfChannels }, (_, i) => audio.getChannelData(i));
	const samplesPerBar = Math.max(1, Math.floor(audio.length / bars));

	const peaks: Array<number> = [];
	for (let bar = 0; bar < bars; bar++) {
		const start = bar * samplesPerBar;
		const end = Math.min(audio.length, start + samplesPerBar);
		let peak = 0;
		// Sampling every 16th value is plenty for a waveform graphic and keeps long files quick.
		for (let i = start; i < end; i += 16) {
			for (const data of channels) {
				const value = Math.abs(data[i]);
				if (value > peak) peak = value;
			}
		}
		peaks.push(peak);
	}

	const max = Math.max(...peaks);
	return max > 0 ? peaks.map((peak) => peak / max) : peaks;
}

/**
 * Returns normalised (0 to 1) peak levels for an audio file, or undefined when the file is too large or can't be
 * decoded. Results are cached for the lifetime of the page.
 */
export function getWaveformPeaks(url: string, bars: number): Promise<Array<number> | undefined> {
	const key = `${bars}|${url}`;
	let peaks = cache.get(key);
	if (!peaks) {
		peaks = computePeaks(url, bars).catch(() => undefined);
		cache.set(key, peaks);
	}
	return peaks;
}
