import { SA_MEDIA_PREVIEW_CONDITION_ALIAS } from './constants.js';
import { UMB_MEDIA_ENTITY_TYPE } from '@umbraco-cms/backoffice/media';

export const manifests: Array<UmbExtensionManifest> = [
	{
		type: 'condition',
		alias: SA_MEDIA_PREVIEW_CONDITION_ALIAS,
		name: 'SA Media Play Can Preview Media Condition',
		api: () => import('./condition/can-preview-media.condition.js'),
	},
	{
		type: 'entityAction',
		kind: 'default',
		alias: 'SA.MediaPlay.EntityAction.Media.Preview',
		name: 'SA Media Play Preview Media Entity Action',
		// Media cards show their highest weighted action as a one-click button next to the "..." menu. Create is
		// 1200, so Preview takes that spot on files; Create moves into the "..." menu for them.
		weight: 1300,
		api: () => import('./entity-action/preview-media.entity-action.js'),
		forEntityTypes: [UMB_MEDIA_ENTITY_TYPE],
		meta: {
			icon: 'icon-eye',
			label: '#saMediaPlay_preview',
		},
		conditions: [{ alias: SA_MEDIA_PREVIEW_CONDITION_ALIAS }],
	},
	{
		type: 'localization',
		alias: 'SA.MediaPlay.Localization.En',
		name: 'SA Media Play English',
		meta: { culture: 'en' },
		js: () => import('./lang/en.js'),
	},
];
