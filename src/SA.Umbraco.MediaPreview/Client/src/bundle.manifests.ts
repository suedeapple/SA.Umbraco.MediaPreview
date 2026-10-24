import { SA_MEDIA_PREVIEW_CONDITION_ALIAS } from './constants.js';
import { UMB_MEDIA_ENTITY_TYPE } from '@umbraco-cms/backoffice/media';

export const manifests: Array<UmbExtensionManifest> = [
	{
		type: 'condition',
		alias: SA_MEDIA_PREVIEW_CONDITION_ALIAS,
		name: 'SA Media Preview Can Preview Media Condition',
		api: () => import('./condition/can-preview-media.condition.js'),
	},
	{
		type: 'entityAction',
		kind: 'default',
		alias: 'SA.MediaPreview.EntityAction.Media.Preview',
		name: 'SA Media Preview Preview Media Entity Action',
		// Media cards show their highest weighted action as a one-click button next to the "..." menu. Create is
		// 1200, so Preview takes that spot on files; Create moves into the "..." menu for them.
		weight: 1300,
		api: () => import('./entity-action/preview-media.entity-action.js'),
		forEntityTypes: [UMB_MEDIA_ENTITY_TYPE],
		meta: {
			icon: 'icon-eye',
			// Umbraco's own "Preview" term, already translated into the backoffice languages it ships.
			label: '#general_preview',
		},
		conditions: [{ alias: SA_MEDIA_PREVIEW_CONDITION_ALIAS }],
	},
];
