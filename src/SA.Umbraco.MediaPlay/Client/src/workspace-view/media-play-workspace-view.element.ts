import { resolvePlayableFile, type SaPlayableFile } from '../playable-file.js';
import { css, customElement, html, nothing, state, when } from '@umbraco-cms/backoffice/external/lit';
import { UmbLitElement } from '@umbraco-cms/backoffice/lit-element';
import { UmbTextStyles } from '@umbraco-cms/backoffice/style';
import { UMB_MEDIA_WORKSPACE_CONTEXT } from '@umbraco-cms/backoffice/media';
import { UMB_SERVER_CONTEXT } from '@umbraco-cms/backoffice/server';
import { formatBytes } from '@umbraco-cms/backoffice/utils';
import type { UmbWorkspaceViewElement } from '@umbraco-cms/backoffice/workspace';

interface SaMediaPlayMetadata {
	duration?: number;
	width?: number;
	height?: number;
}

type SaMediaPlayError = 'notSupported' | 'load' | 'decode';

@customElement('sa-media-play-workspace-view')
export class SaMediaPlayWorkspaceViewElement extends UmbLitElement implements UmbWorkspaceViewElement {
	@state()
	private _file?: SaPlayableFile;

	@state()
	private _serverUrl = '';

	@state()
	private _metadata: SaMediaPlayMetadata = {};

	@state()
	private _error?: SaMediaPlayError;

	constructor() {
		super();

		this.consumeContext(UMB_SERVER_CONTEXT, (context) => {
			this._serverUrl = context?.getServerUrl() ?? '';
		});

		this.consumeContext(UMB_MEDIA_WORKSPACE_CONTEXT, (context) => {
			this.observe(
				context?.values,
				(values) => {
					const file = resolvePlayableFile(values);
					if (file?.src !== this._file?.src) {
						this._metadata = {};
						this._error = undefined;
					}
					this._file = file;
				},
				'_saObserveValues',
			);
		});
	}

	get #url() {
		const src = this._file?.src;
		if (!src) return '';
		if (/^https?:\/\//i.test(src)) return src;
		return this._serverUrl + src;
	}

	get #formatLabel() {
		return this._file?.extension.toUpperCase() ?? '';
	}

	/** True when the browser says outright it can't play this type. Playback is still attempted, as the answer is a guess. */
	get #likelyUnsupported() {
		const file = this._file;
		if (!file) return false;
		return document.createElement(file.kind).canPlayType(file.mimeType) === '';
	}

	#onLoadedMetadata(event: Event) {
		const media = event.target as HTMLMediaElement;
		const video = media instanceof HTMLVideoElement ? media : undefined;
		this._metadata = {
			duration: Number.isFinite(media.duration) ? media.duration : undefined,
			width: video?.videoWidth || undefined,
			height: video?.videoHeight || undefined,
		};
		this._error = undefined;
	}

	#onError(event: Event) {
		const code = (event.target as HTMLMediaElement).error?.code;
		if (code === MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED) this._error = 'notSupported';
		else if (code === MediaError.MEDIA_ERR_DECODE) this._error = 'decode';
		else if (code === MediaError.MEDIA_ERR_NETWORK) this._error = 'load';
	}

	#formatDuration(seconds: number) {
		const total = Math.round(seconds);
		const h = Math.floor(total / 3600);
		const m = Math.floor((total % 3600) / 60);
		const s = String(total % 60).padStart(2, '0');
		return h > 0 ? `${h}:${String(m).padStart(2, '0')}:${s}` : `${m}:${s}`;
	}

	override render() {
		if (!this._file) {
			return html`<uui-box><p>${this.localize.term('saMediaPlay_noFile')}</p></uui-box>`;
		}

		return html`
			<uui-box headline=${this._file.fileName}>
				${this.#renderPlayer()} ${this.#renderMessage()}
			</uui-box>
			<uui-box headline=${this.localize.term('saMediaPlay_details')}>${this.#renderDetails()}</uui-box>
		`;
	}

	#renderPlayer() {
		const url = this.#url;
		if (this._file?.kind === 'video') {
			return html`
				<div class="player player--video">
					<video
						controls
						playsinline
						preload="metadata"
						src=${url}
						@loadedmetadata=${this.#onLoadedMetadata}
						@error=${this.#onError}></video>
				</div>
			`;
		}
		return html`
			<div class="player player--audio">
				<audio
					controls
					preload="metadata"
					src=${url}
					@loadedmetadata=${this.#onLoadedMetadata}
					@error=${this.#onError}></audio>
			</div>
		`;
	}

	#renderMessage() {
		const format = this.#formatLabel;

		if (this._error) {
			const message =
				this._error === 'notSupported'
					? this.localize.term('saMediaPlay_cannotPlayFormat', format)
					: this._error === 'decode'
						? this.localize.term('saMediaPlay_decodeError')
						: this.localize.term('saMediaPlay_loadError');
			return html`
				<div class="message message--danger" role="alert">
					<uui-icon name="icon-alert"></uui-icon>
					<div>
						<strong>${this.localize.term('saMediaPlay_cannotPlayHeadline')}</strong>
						<p>${message}</p>
					</div>
				</div>
			`;
		}

		if (this.#likelyUnsupported && this._metadata.duration === undefined) {
			return html`
				<div class="message message--warning">
					<uui-icon name="icon-info"></uui-icon>
					<p>${this.localize.term('saMediaPlay_mayNotPlay', format)}</p>
				</div>
			`;
		}

		return nothing;
	}

	#renderDetails() {
		const file = this._file!;
		const unknown = this.localize.term('saMediaPlay_unknown');
		const { duration, width, height } = this._metadata;

		return html`
			<dl>
				<dt>${this.localize.term('saMediaPlay_format')}</dt>
				<dd>${this.#formatLabel} <small>(${file.mimeType})</small></dd>

				<dt>${this.localize.term('saMediaPlay_duration')}</dt>
				<dd>${duration !== undefined ? this.#formatDuration(duration) : unknown}</dd>

				${when(
					file.kind === 'video',
					() => html`
						<dt>${this.localize.term('saMediaPlay_resolution')}</dt>
						<dd>${width && height ? `${width} × ${height}` : unknown}</dd>
					`,
				)}

				<dt>${this.localize.term('saMediaPlay_fileSize')}</dt>
				<dd>${file.bytes ? formatBytes(file.bytes) : unknown}</dd>
			</dl>
			<uui-button
				look="outline"
				href=${this.#url}
				target="_blank"
				rel="noopener"
				label=${this.localize.term('saMediaPlay_openFile')}>
				<uui-icon name="icon-out"></uui-icon> ${this.localize.term('saMediaPlay_openFile')}
			</uui-button>
		`;
	}

	static override styles = [
		UmbTextStyles,
		css`
			:host {
				display: flex;
				flex-direction: column;
				gap: var(--uui-size-layout-1);
				padding: var(--uui-size-layout-1);
			}

			.player--video {
				display: flex;
				justify-content: center;
				background: #000;
				border-radius: var(--uui-border-radius);
				overflow: hidden;
			}

			video {
				display: block;
				width: 100%;
				max-height: 70vh;
			}

			audio {
				display: block;
				width: 100%;
			}

			.message {
				display: flex;
				gap: var(--uui-size-space-4);
				align-items: flex-start;
				margin-top: var(--uui-size-space-5);
				padding: var(--uui-size-space-4) var(--uui-size-space-5);
				border-radius: var(--uui-border-radius);
				border: 1px solid;
			}

			.message p {
				margin: 0;
			}

			.message uui-icon {
				flex: none;
				margin-top: 2px;
			}

			.message--danger {
				background: var(--uui-color-danger-emphasis);
				border-color: var(--uui-color-danger);
				color: var(--uui-color-danger-contrast);
			}

			.message--warning {
				background: var(--uui-color-warning);
				border-color: var(--uui-color-warning-emphasis);
				color: var(--uui-color-warning-contrast);
			}

			dl {
				display: grid;
				grid-template-columns: max-content 1fr;
				gap: var(--uui-size-space-3) var(--uui-size-space-6);
				margin: 0 0 var(--uui-size-space-5);
			}

			dt {
				font-weight: bold;
			}

			dd {
				margin: 0;
			}
		`,
	];
}

export { SaMediaPlayWorkspaceViewElement as element };

declare global {
	interface HTMLElementTagNameMap {
		'sa-media-play-workspace-view': SaMediaPlayWorkspaceViewElement;
	}
}
