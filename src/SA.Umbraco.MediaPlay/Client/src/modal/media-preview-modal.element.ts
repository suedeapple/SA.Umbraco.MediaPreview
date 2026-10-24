import '../audio/audio-waveform-player.element.js';
import type { SaMediaPreviewModalData } from './media-preview-modal.token.js';
import { css, customElement, html, nothing, state, when } from '@umbraco-cms/backoffice/external/lit';
import { UmbModalBaseElement } from '@umbraco-cms/backoffice/modal';
import { UmbTextStyles } from '@umbraco-cms/backoffice/style';

function formatDuration(seconds: number) {
	const total = Math.round(seconds);
	const h = Math.floor(total / 3600);
	const m = Math.floor((total % 3600) / 60);
	const s = String(total % 60).padStart(2, '0');
	return h > 0 ? `${h}:${String(m).padStart(2, '0')}:${s}` : `${m}:${s}`;
}

/** The fly-out panel that previews a media item's image, video or audio file. */
@customElement('sa-media-preview-modal')
export class SaMediaPreviewModalElement extends UmbModalBaseElement<SaMediaPreviewModalData, never> {
	@state()
	private _dimensions?: string;

	@state()
	private _duration?: string;

	#close = () => this._rejectModal();

	#onImageLoad(event: Event) {
		const img = event.target as HTMLImageElement;
		if (img.naturalWidth && img.naturalHeight) this._dimensions = `${img.naturalWidth} × ${img.naturalHeight}`;
	}

	#onMediaMetadata(event: Event) {
		const media = event.target as HTMLMediaElement;
		if (Number.isFinite(media.duration)) this._duration = formatDuration(media.duration);
		if (media instanceof HTMLVideoElement && media.videoWidth) {
			this._dimensions = `${media.videoWidth} × ${media.videoHeight}`;
		}
	}

	override render() {
		const data = this.data;
		if (!data) return nothing;

		return html`
			<umb-body-layout headline=${data.name}>
				<uui-box id="media">${this.#renderMedia(data)}</uui-box>
				<uui-box headline=${this.localize.term('general_details')}>${this.#renderDetails(data)}</uui-box>

				<div slot="actions">
					<uui-button label=${this.localize.term('general_close')} @click=${this.#close}></uui-button>
					<uui-button
						look="secondary"
						href=${data.url}
						target="_blank"
						rel="noopener"
						label=${this.localize.term('saMediaPlay_openFile')}></uui-button>
					${when(
						data.editHref,
						(href) => html`<uui-button
							look="primary"
							color="positive"
							href=${href}
							label=${this.localize.term('general_edit')}
							@click=${this.#close}></uui-button>`,
					)}
				</div>
			</umb-body-layout>
		`;
	}

	#renderMedia(data: SaMediaPreviewModalData) {
		switch (data.kind) {
			case 'image':
				return html`<img src=${data.url} alt=${data.name} @load=${this.#onImageLoad} />`;
			case 'video':
				return html`<video
					src=${data.url}
					controls
					autoplay
					playsinline
					@loadedmetadata=${this.#onMediaMetadata}></video>`;
			case 'audio':
				return html`<sa-audio-waveform-player
					.url=${data.url}
					autoplay
					@duration=${(event: CustomEvent<number>) => (this._duration = formatDuration(event.detail))}></sa-audio-waveform-player>`;
		}
	}

	#renderDetails(data: SaMediaPreviewModalData) {
		const extension = data.url.split('?')[0].split('.').pop()?.toUpperCase();
		return html`
			<dl>
				<dt>${this.localize.term('saMediaPlay_format')}</dt>
				<dd>${extension} <small>(${data.mimeType})</small></dd>
				${when(
					this._dimensions,
					(dimensions) => html`
						<dt>${this.localize.term(data.kind === 'image' ? 'saMediaPlay_dimensions' : 'saMediaPlay_resolution')}</dt>
						<dd>${dimensions}</dd>
					`,
				)}
				${when(
					this._duration,
					(duration) => html`
						<dt>${this.localize.term('saMediaPlay_duration')}</dt>
						<dd>${duration}</dd>
					`,
				)}
			</dl>
		`;
	}

	static override styles = [
		UmbTextStyles,
		css`
			uui-box + uui-box {
				margin-top: var(--uui-size-layout-1);
			}

			img,
			video {
				display: block;
				max-width: 100%;
				max-height: 70vh;
				margin: 0 auto;
			}

			img {
				/* Shows transparent areas of PNG/SVG files against a checkerboard, like Umbraco's thumbnails. */
				background: url('data:image/svg+xml;charset=utf-8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" fill-opacity=".1"><path d="M50 0h50v50H50zM0 50h50v50H0z"/></svg>');
				background-size: 16px 16px;
			}

			video {
				width: 100%;
				background: #000;
				border-radius: var(--uui-border-radius);
			}

			dl {
				display: grid;
				grid-template-columns: max-content 1fr;
				gap: var(--uui-size-space-3) var(--uui-size-space-6);
				margin: 0;
			}

			dt {
				font-weight: bold;
			}

			dd {
				margin: 0;
			}

			small {
				opacity: 0.7;
			}
		`,
	];
}

export { SaMediaPreviewModalElement as element };

declare global {
	interface HTMLElementTagNameMap {
		'sa-media-preview-modal': SaMediaPreviewModalElement;
	}
}
