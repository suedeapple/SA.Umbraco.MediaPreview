import { SA_MEDIA_PREVIEW_MODAL_ALIAS } from './modal/media-preview-modal.token.js';
import { UMB_MEDIA_ENTITY_TYPE } from '@umbraco-cms/backoffice/media';

export const manifests: Array<UmbExtensionManifest> = [
	{
		type: 'entityCollectionItemCard',
		alias: 'SA.MediaPlay.EntityCollectionItemCard.Media',
		name: 'SA Media Play Media Card',
		element: () => import('./card/media-preview-card.element.js'),
		// Umbraco renders the highest weighted card for an entity type, so this takes over from the core media card.
		// Upload placeholders aren't listed, so they keep using the core card.
		weight: 100,
		forEntityTypes: [UMB_MEDIA_ENTITY_TYPE],
	},
	{
		type: 'modal',
		alias: SA_MEDIA_PREVIEW_MODAL_ALIAS,
		name: 'SA Media Play Preview Modal',
		element: () => import('./modal/media-preview-modal.element.js'),
	},
	{
		type: 'localization',
		alias: 'SA.MediaPlay.Localization.En',
		name: 'SA Media Play English',
		meta: { culture: 'en' },
		js: () => import('./lang/en.js'),
	},
];
