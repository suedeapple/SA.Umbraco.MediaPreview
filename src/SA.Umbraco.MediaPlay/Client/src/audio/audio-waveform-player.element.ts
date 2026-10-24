import { getWaveformPeaks } from './waveform.js';
import { css, customElement, html, property, query, state, svg, type PropertyValues } from '@umbraco-cms/backoffice/external/lit';
import { UmbLitElement } from '@umbraco-cms/backoffice/lit-element';

const BARS = 160;
const KEYBOARD_STEP_SECONDS = 5;

function formatTime(seconds: number) {
	if (!Number.isFinite(seconds)) return '0:00';
	const total = Math.floor(seconds);
	const h = Math.floor(total / 3600);
	const m = Math.floor((total % 3600) / 60);
	const s = String(total % 60).padStart(2, '0');
	return h > 0 ? `${h}:${String(m).padStart(2, '0')}:${s}` : `${m}:${s}`;
}

/** An audio player drawn as a waveform: click or drag on the waveform to seek, arrow keys step through it. */
@customElement('sa-audio-waveform-player')
export class SaAudioWaveformPlayerElement extends UmbLitElement {
	@property()
	url = '';

	@property({ type: Boolean })
	autoplay = false;

	@state()
	private _peaks?: Array<number> | null;

	@state()
	private _playing = false;

	@state()
	private _currentTime = 0;

	@state()
	private _duration = 0;

	@state()
	private _error = false;

	@query('audio')
	private _audio?: HTMLAudioElement;

	#dragging = false;

	protected override updated(changed: PropertyValues) {
		super.updated(changed);
		if (changed.has('url') && this.url) {
			const url = this.url;
			this._peaks = undefined;
			this._error = false;
			getWaveformPeaks(url, BARS).then((peaks) => {
				if (url === this.url) this._peaks = peaks ?? null;
			});
		}
	}

	override disconnectedCallback() {
		super.disconnectedCallback();
		this._audio?.pause();
	}

	#toggle() {
		const audio = this._audio;
		if (!audio) return;
		if (audio.paused) void audio.play().catch(() => (this._playing = false));
		else audio.pause();
	}

	#seekTo(seconds: number) {
		const audio = this._audio;
		if (!audio || !Number.isFinite(audio.duration)) return;
		audio.currentTime = Math.min(audio.duration, Math.max(0, seconds));
		this._currentTime = audio.currentTime;
	}

	#seekToPointer(event: PointerEvent) {
		const waveform = event.currentTarget as HTMLElement;
		const rect = waveform.getBoundingClientRect();
		const ratio = Math.min(1, Math.max(0, (event.clientX - rect.left) / rect.width));
		this.#seekTo(ratio * this._duration);
	}

	#onPointerDown(event: PointerEvent) {
		if (!this._duration) return;
		this.#dragging = true;
		(event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
		this.#seekToPointer(event);
	}

	#onPointerMove(event: PointerEvent) {
		if (this.#dragging) this.#seekToPointer(event);
	}

	#onPointerUp(event: PointerEvent) {
		if (!this.#dragging) return;
		this.#dragging = false;
		(event.currentTarget as HTMLElement).releasePointerCapture(event.pointerId);
	}

	#onKeyDown(event: KeyboardEvent) {
		const keys: Record<string, () => void> = {
			ArrowLeft: () => this.#seekTo(this._currentTime - KEYBOARD_STEP_SECONDS),
			ArrowRight: () => this.#seekTo(this._currentTime + KEYBOARD_STEP_SECONDS),
			Home: () => this.#seekTo(0),
			End: () => this.#seekTo(this._duration),
			' ': () => this.#toggle(),
		};
		const action = keys[event.key];
		if (!action) return;
		event.preventDefault();
		action();
	}

	#onTimeUpdate() {
		const audio = this._audio;
		if (!audio) return;
		this._currentTime = audio.currentTime;
		this._duration = Number.isFinite(audio.duration) ? audio.duration : 0;
	}

	override render() {
		const progress = this._duration ? this._currentTime / this._duration : 0;
		const playLabel = this.localize.term(this._playing ? 'saMediaPlay_pause' : 'saMediaPlay_play');

		return html`
			<audio
				src=${this.url}
				preload="auto"
				?autoplay=${this.autoplay}
				@play=${() => (this._playing = true)}
				@pause=${() => (this._playing = false)}
				@ended=${() => (this._playing = false)}
				@timeupdate=${this.#onTimeUpdate}
				@loadedmetadata=${this.#onTimeUpdate}
				@durationchange=${this.#onTimeUpdate}
				@error=${() => (this._error = true)}></audio>

			<button id="toggle" type="button" aria-label=${playLabel} title=${playLabel} @click=${this.#toggle}>
				${this._playing
					? svg`<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="6" y="5" width="4" height="14" rx="1"></rect><rect x="14" y="5" width="4" height="14" rx="1"></rect></svg>`
					: svg`<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5.5v13a1 1 0 0 0 1.5.86l10.5-6.5a1 1 0 0 0 0-1.72L9.5 4.64A1 1 0 0 0 8 5.5z"></path></svg>`}
			</button>

			<div
				id="waveform"
				class=${this._peaks === undefined ? 'loading' : ''}
				role="slider"
				tabindex="0"
				aria-label=${this.localize.term('saMediaPlay_seek')}
				aria-valuemin="0"
				aria-valuemax=${Math.round(this._duration)}
				aria-valuenow=${Math.round(this._currentTime)}
				aria-valuetext=${`${formatTime(this._currentTime)} / ${formatTime(this._duration)}`}
				@pointerdown=${this.#onPointerDown}
				@pointermove=${this.#onPointerMove}
				@pointerup=${this.#onPointerUp}
				@pointercancel=${this.#onPointerUp}
				@keydown=${this.#onKeyDown}>
				${this.#renderBars()}
				<div id="played" style="clip-path: inset(0 ${(1 - progress) * 100}% 0 0)">${this.#renderBars()}</div>
				<div id="playhead" style="left: ${progress * 100}%"></div>
			</div>

			<div id="time">
				${this._error
					? this.localize.term('saMediaPlay_cannotPlay')
					: html`${formatTime(this._currentTime)} <span>/ ${formatTime(this._duration)}</span>`}
			</div>
		`;
	}

	#renderBars() {
		// While loading, or when the file is too big to analyse, show a flat line of short bars.
		const peaks = this._peaks ?? Array.from({ length: BARS }, () => 0.04);
		const width = 100 / peaks.length;
		return html`<svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
			${peaks.map((peak, i) => {
				const height = Math.max(3, peak * 100);
				return svg`<rect x=${i * width + width * 0.15} y=${(100 - height) / 2} width=${width * 0.7} height=${height}></rect>`;
			})}
		</svg>`;
	}

	static override styles = css`
		:host {
			display: grid;
			grid-template-columns: auto 1fr;
			grid-template-rows: auto auto;
			column-gap: 24px;
			row-gap: 10px;
			align-items: center;
			padding: 32px;
			box-sizing: border-box;
			border-radius: 12px;
			background: #1d1d23;
			box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
			color: #fff;
		}

		audio {
			display: none;
		}

		#toggle {
			grid-row: 1 / span 2;
			display: flex;
			align-items: center;
			justify-content: center;
			width: 64px;
			height: 64px;
			padding: 0;
			border: 0;
			border-radius: 50%;
			background: #fff;
			color: #111;
			cursor: pointer;
			transition: transform 120ms;
		}

		#toggle:hover {
			transform: scale(1.06);
		}

		#toggle:focus-visible,
		#waveform:focus-visible {
			outline: 2px solid var(--uui-color-focus, #3879ff);
			outline-offset: 4px;
		}

		#toggle svg {
			width: 28px;
			height: 28px;
			fill: currentColor;
		}

		#waveform {
			position: relative;
			height: 120px;
			cursor: pointer;
			touch-action: none;
		}

		#waveform svg {
			position: absolute;
			inset: 0;
			width: 100%;
			height: 100%;
			fill: rgba(255, 255, 255, 0.28);
		}

		#waveform.loading svg {
			animation: pulse 1.2s ease-in-out infinite alternate;
		}

		@keyframes pulse {
			from {
				opacity: 0.4;
			}
			to {
				opacity: 1;
			}
		}

		#played {
			position: absolute;
			inset: 0;
		}

		#played svg {
			fill: #fff;
		}

		#playhead {
			position: absolute;
			top: 0;
			bottom: 0;
			width: 2px;
			margin-left: -1px;
			background: var(--uui-color-interactive-emphasis, #3544b1);
			box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.6);
			pointer-events: none;
		}

		#time {
			font-size: 13px;
			font-variant-numeric: tabular-nums;
		}

		#time span {
			opacity: 0.6;
		}
	`;
}

declare global {
	interface HTMLElementTagNameMap {
		'sa-audio-waveform-player': SaAudioWaveformPlayerElement;
	}
}
