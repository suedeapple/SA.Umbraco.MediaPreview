import type { SaMediaKind } from '../media-kind.js';
import { UmbModalToken } from '@umbraco-cms/backoffice/modal';

export const SA_MEDIA_PREVIEW_MODAL_ALIAS = 'SA.MediaPlay.Modal.Preview';

export interface SaMediaPreviewModalData {
	name: string;
	url: string;
	kind: SaMediaKind;
	mimeType: string;
	/** Link to the media item's editor, when the card has one. */
	editHref?: string;
}

export const SA_MEDIA_PREVIEW_MODAL = new UmbModalToken<SaMediaPreviewModalData, never>(SA_MEDIA_PREVIEW_MODAL_ALIAS, {
	modal: {
		type: 'sidebar',
		size: 'medium',
	},
});
