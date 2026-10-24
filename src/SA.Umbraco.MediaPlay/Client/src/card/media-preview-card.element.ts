import { getPreviewKind } from '../media-kind.js';
import { forgetMediaUrl, lookupMediaUrl } from '../media-url-lookup.js';
import { SA_MEDIA_PREVIEW_MODAL, type SaMediaPreviewModalData } from '../modal/media-preview-modal.token.js';
import { css, customElement, html, ifDefined, nothing, property, state } from '@umbraco-cms/backoffice/external/lit';
import { UmbLitElement } from '@umbraco-cms/backoffice/lit-element';
import { UmbDeselectedEvent, UmbSelectedEvent } from '@umbraco-cms/backoffice/event';
import { UmbEntityContentTypeEntityContext } from '@umbraco-cms/backoffice/content-type';
import { UMB_MEDIA_TYPE_ENTITY_TYPE } from '@umbraco-cms/backoffice/media-type';
import { UMB_ACTION_EVENT_CONTEXT } from '@umbraco-cms/backoffice/action';
import { UmbEntityUpdatedEvent } from '@umbraco-cms/backoffice/entity-action';
import { umbOpenModal } from '@umbraco-cms/backoffice/modal';
import type { UmbEntityCollectionItemElement } from '@umbraco-cms/backoffice/collection';
import type { UmbMediaCollectionItemModel } from '@umbraco-cms/backoffice/media';

/**
 * Replaces Umbraco's media collection card (`Umb.EntityCollectionItemCard.Media`) with the same card plus a
 * Preview button for images, video and audio. Everything else renders exactly as the core card does.
 */
@customElement('sa-media-preview-card')
export class SaMediaPreviewCardElement extends UmbLitElement implements UmbEntityCollectionItemElement {
	#item?: UmbMediaCollectionItemModel;
	#entityContentTypeContext = new UmbEntityContentTypeEntityContext(this);

	@property({ type: Object, attribute: false })
	get item() {
		return this.#item;
	}
	set item(value: UmbMediaCollectionItemModel | undefined) {
		const previous = this.#item;
		this.#item = value;
		const mediaTypeUnique = value?.mediaType?.unique;
		this.#entityContentTypeContext.setEntityType(mediaTypeUnique ? UMB_MEDIA_TYPE_ENTITY_TYPE : undefined);
		this.#entityContentTypeContext.setUnique(mediaTypeUnique);
		if (value?.unique !== previous?.unique) void this.#loadPreview();
		this.requestUpdate('item', previous);
	}

	@property({ type: Boolean })
	selectable = false;

	@property({ type: Boolean })
	selected = false;

	@property({ type: Boolean })
	selectOnly = false;

	@property({ type: Boolean })
	disabled = false;

	@property({ type: String })
	href?: string;

	@state()
	private _preview?: SaMediaPreviewModalData;

	constructor() {
		super();
		// Pick up a replaced file without a page reload.
		this.consumeContext(UMB_ACTION_EVENT_CONTEXT, (context) => {
			context?.addEventListener(UmbEntityUpdatedEvent.TYPE, (event) => {
				if (event instanceof UmbEntityUpdatedEvent && event.getUnique() === this.#item?.unique) {
					forgetMediaUrl(event.getUnique()!);
					void this.#loadPreview();
				}
			});
		});
	}

	async #loadPreview() {
		const item = this.#item;
		this._preview = undefined;
		if (!item?.unique) return;

		const media = await lookupMediaUrl(this, item.unique);
		if (item !== this.#item) return;

		const info = getPreviewKind(media?.extension);
		if (!media?.url || !info) return;

		this._preview = { name: item.name ?? '', url: media.url, kind: info.kind, mimeType: info.mimeType };
	}

	#onSelected(event: UmbSelectedEvent) {
		if (!this.#item) return;
		event.stopPropagation();
		this.dispatchEvent(new UmbSelectedEvent(this.#item.unique));
	}

	#onDeselected(event: UmbDeselectedEvent) {
		if (!this.#item) return;
		event.stopPropagation();
		this.dispatchEvent(new UmbDeselectedEvent(this.#item.unique));
	}

	async #openPreview(event: Event) {
		event.stopPropagation();
		if (!this._preview) return;
		await umbOpenModal(this, SA_MEDIA_PREVIEW_MODAL, { data: this._preview }).catch(() => undefined);
	}

	override render() {
		const item = this.#item;
		if (!item) return nothing;

		return html`
			<uui-card-media
				name=${ifDefined(item.name)}
				href=${ifDefined(this.href)}
				data-mark="${item.entityType}:${item.unique}"
				?selectable=${this.selectable}
				?select-only=${this.selectOnly}
				?selected=${this.selected}
				?disabled=${this.disabled}
				@selected=${this.#onSelected}
				@deselected=${this.#onDeselected}>
				<umb-imaging-thumbnail
					.unique=${item.unique}
					alt=${ifDefined(item.name)}
					icon=${ifDefined(item.icon ?? undefined)}></umb-imaging-thumbnail>
				${this.#renderPreviewButton()}
				<slot name="actions" slot="actions"></slot>
			</uui-card-media>
		`;
	}

	#renderPreviewButton() {
		if (!this._preview || this.selectOnly) return nothing;
		const label = this.localize.term('saMediaPlay_preview');
		const icon = this._preview.kind === 'image' ? 'icon-zoom-in' : 'icon-play';
		return html`
			<uui-button
				slot="tag"
				id="preview"
				look="secondary"
				compact
				label=${label}
				title=${label}
				data-mark="action:sa-media-preview"
				@click=${this.#openPreview}>
				<uui-icon name=${icon}></uui-icon>
			</uui-button>
		`;
	}

	static override styles = [
		css`
			uui-card-media {
				height: 100%;
			}

			slot[name='actions'] {
				--uui-button-background-color: var(--uui-color-surface);
				--uui-button-background-color-hover: var(--uui-color-surface);
			}

			#preview {
				--uui-button-background-color: var(--uui-color-surface);
				--uui-button-background-color-hover: var(--uui-color-surface-emphasis);
				--uui-button-border-radius: 50%;
				font-size: 14px;
				box-shadow: var(--uui-shadow-depth-1);
			}
		`,
	];
}

export { SaMediaPreviewCardElement as element };

declare global {
	interface HTMLElementTagNameMap {
		'sa-media-preview-card': SaMediaPreviewCardElement;
	}
}
