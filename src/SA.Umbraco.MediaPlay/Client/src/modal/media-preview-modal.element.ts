import '../audio/audio-waveform-player.element.js';
import type { SaMediaPreviewModalData } from './media-preview-modal.token.js';
import { css, customElement, html, query, state } from '@umbraco-cms/backoffice/external/lit';
import { UmbModalBaseElement } from '@umbraco-cms/backoffice/modal';

/** Small images are enlarged to fill the screen, but by no more than this, beyond which they look too blurry. */
const MAX_IMAGE_UPSCALE = 2;

@customElement('sa-media-preview-modal')
export class SaMediaPreviewModalElement extends UmbModalBaseElement<SaMediaPreviewModalData, never> {
	@query('#stage')
	private _stage?: HTMLElement;

	@state()
	private _imageSize?: { width: number; height: number };

	#naturalSize?: { width: number; height: number };
	#resizeObserver = new ResizeObserver(() => this.#fitImage());

	#close = () => this._rejectModal();

	override disconnectedCallback() {
		super.disconnectedCallback();
		this.#resizeObserver.disconnect();
	}

	#onImageLoad(event: Event) {
		const img = event.target as HTMLImageElement;
		this.#naturalSize = { width: img.naturalWidth, height: img.naturalHeight };
		if (this._stage) this.#resizeObserver.observe(this._stage);
		this.#fitImage();
	}

	#fitImage() {
		const natural = this.#naturalSize;
		const stage = this._stage;
		// SVGs without an intrinsic size report 0; let CSS size those.
		if (!natural?.width || !natural.height || !stage) return;
		const scale = Math.min(MAX_IMAGE_UPSCALE, stage.clientWidth / natural.width, stage.clientHeight / natural.height);
		this._imageSize = { width: Math.floor(natural.width * scale), height: Math.floor(natural.height * scale) };
	}

	override render() {
		const data = this.data;
		if (!data) return html``;

		return html`
			<header>
				<h2 title=${data.name}>${data.name}</h2>
				<a href=${data.url} target="_blank" rel="noopener" class="header-button">
					<uui-icon name="icon-out"></uui-icon>
					<span>${this.localize.term('saMediaPlay_openFile')}</span>
				</a>
				<button type="button" class="header-button" @click=${this.#close} aria-label=${this.localize.term('general_close')}>
					<uui-icon name="icon-wrong"></uui-icon>
				</button>
			</header>
			<div id="stage">${this.#renderMedia(data)}</div>
		`;
	}

	#renderMedia(data: SaMediaPreviewModalData) {
		switch (data.kind) {
			case 'image':
				return html`<img
					src=${data.url}
					alt=${data.name}
					style=${this._imageSize ? `width: ${this._imageSize.width}px; height: ${this._imageSize.height}px` : ''}
					@load=${this.#onImageLoad} />`;
			case 'video':
				return html`<video src=${data.url} controls autoplay playsinline></video>`;
			case 'audio':
				return html`<sa-audio-waveform-player .url=${data.url} autoplay></sa-audio-waveform-player>`;
		}
	}

	static override styles = css`
		:host {
			display: contents;
			color: #fff;
		}

		header {
			position: fixed;
			top: 0;
			left: 0;
			right: 0;
			display: flex;
			align-items: center;
			gap: 8px;
			height: 56px;
			padding: 0 12px 0 24px;
			box-sizing: border-box;
		}

		h2 {
			flex: 1;
			margin: 0;
			font-size: 15px;
			font-weight: 600;
			white-space: nowrap;
			overflow: hidden;
			text-overflow: ellipsis;
		}

		.header-button {
			display: inline-flex;
			align-items: center;
			gap: 6px;
			height: 36px;
			min-width: 36px;
			justify-content: center;
			padding: 0 10px;
			border: 0;
			border-radius: 18px;
			background: rgba(255, 255, 255, 0.1);
			color: inherit;
			font: inherit;
			font-size: 13px;
			text-decoration: none;
			cursor: pointer;
		}

		.header-button:hover,
		.header-button:focus-visible {
			background: rgba(255, 255, 255, 0.22);
		}

		.header-button:focus-visible {
			outline: 2px solid var(--uui-color-focus, #3879ff);
			outline-offset: 2px;
		}

		#stage {
			display: flex;
			align-items: center;
			justify-content: center;
			width: 100%;
			height: 100%;
			min-height: 0;
		}

		img,
		video {
			display: block;
			max-width: 100%;
			max-height: 100%;
			object-fit: contain;
			border-radius: 4px;
			box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
		}

		img {
			/* Shows transparent areas of PNG/SVG files against a checkerboard, like Umbraco's thumbnails. */
			background: #fff
				url('data:image/svg+xml;charset=utf-8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" fill-opacity=".1"><path d="M50 0h50v50H50zM0 50h50v50H0z"/></svg>');
			background-size: 16px 16px;
		}

		video {
			background: #000;
			width: min(100%, 1280px);
		}

		sa-audio-waveform-player {
			width: min(100%, 900px);
		}
	`;
}

export { SaMediaPreviewModalElement as element };

declare global {
	interface HTMLElementTagNameMap {
		'sa-media-preview-modal': SaMediaPreviewModalElement;
	}
}
