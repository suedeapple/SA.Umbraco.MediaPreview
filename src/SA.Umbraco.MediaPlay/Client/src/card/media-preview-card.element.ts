import { css, customElement, html, ifDefined, nothing, property, state } from '@umbraco-cms/backoffice/external/lit';
import { UmbLitElement } from '@umbraco-cms/backoffice/lit-element';
import { UmbDeselectedEvent, UmbSelectedEvent } from '@umbraco-cms/backoffice/event';
import { UmbEntityContentTypeEntityContext } from '@umbraco-cms/backoffice/content-type';
import { UMB_MEDIA_TYPE_ENTITY_TYPE } from '@umbraco-cms/backoffice/media-type';
import { UMB_MEDIA_ENTITY_TYPE } from '@umbraco-cms/backoffice/media';
import { UmbModalRouteRegistrationController } from '@umbraco-cms/backoffice/router';
import { UMB_WORKSPACE_MODAL } from '@umbraco-cms/backoffice/workspace';
import type { UmbEntityCollectionItemElement } from '@umbraco-cms/backoffice/collection';
import type { UmbMediaCollectionItemModel } from '@umbraco-cms/backoffice/media';

/** Folders have nothing to preview, so they don't get the button. */
const FOLDER_MEDIA_TYPE_ALIAS = 'Folder';

/**
 * Replaces Umbraco's media collection card (`Umb.EntityCollectionItemCard.Media`) with the same card plus a
 * Preview button. The button opens the media item's standard editor as a fly-out, the same way the Media Picker
 * does, so editors can see or play the file without leaving the media section.
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
	private _flyoutPath?: string;

	constructor() {
		super();
		// Each collection item has its own route addendum, so this registers a fly-out route unique to this card.
		new UmbModalRouteRegistrationController(this, UMB_WORKSPACE_MODAL)
			.addAdditionalPath(UMB_MEDIA_ENTITY_TYPE)
			.onSetup(() => ({ data: { entityType: UMB_MEDIA_ENTITY_TYPE, preset: {} } }))
			.observeRouteBuilder((routeBuilder) => {
				this._flyoutPath = routeBuilder({});
			});
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
				${this.#renderPreviewButton(item)}
				<slot name="actions" slot="actions"></slot>
			</uui-card-media>
		`;
	}

	#renderPreviewButton(item: UmbMediaCollectionItemModel) {
		if (!this._flyoutPath || !item.unique || this.selectOnly || this.disabled) return nothing;
		if (item.mediaType?.alias === FOLDER_MEDIA_TYPE_ALIAS) return nothing;

		const label = this.localize.term('saMediaPlay_preview');
		// Sits in the card's hover-only actions area, next to Umbraco's own "..." and first-action buttons.
		return html`
			<uui-action-bar slot="actions" id="preview-bar">
				<uui-button
					label=${label}
					title=${label}
					href=${`${this._flyoutPath}edit/${item.unique}`}
					data-mark="action:sa-media-preview">
					<umb-icon name="icon-eye"></umb-icon>
				</uui-button>
			</uui-action-bar>
		`;
	}

	static override styles = [
		css`
			uui-card-media {
				height: 100%;
			}

			slot[name='actions'],
			#preview-bar {
				--uui-button-background-color: var(--uui-color-surface);
				--uui-button-background-color-hover: var(--uui-color-surface);
			}

			#preview-bar {
				margin-right: var(--uui-size-space-2);
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
