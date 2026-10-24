import { SA_MEDIA_PLAY_IS_PLAYABLE_CONDITION_ALIAS, SA_MEDIA_PLAY_WORKSPACE_VIEW_ALIAS } from './constants.js';
import { UMB_WORKSPACE_CONDITION_ALIAS } from '@umbraco-cms/backoffice/workspace';
import { UMB_MEDIA_WORKSPACE_ALIAS } from '@umbraco-cms/backoffice/media';

export const manifests: Array<UmbExtensionManifest> = [
	{
		type: 'condition',
		alias: SA_MEDIA_PLAY_IS_PLAYABLE_CONDITION_ALIAS,
		name: 'SA Media Play Is Playable Media Condition',
		api: () => import('./condition/is-playable-media.condition.js'),
	},
	{
		type: 'workspaceView',
		alias: SA_MEDIA_PLAY_WORKSPACE_VIEW_ALIAS,
		name: 'SA Media Play Preview Workspace View',
		element: () => import('./workspace-view/media-play-workspace-view.element.js'),
		// Core "Details" is 200 and "Info" is 100, so the preview sits between them.
		weight: 150,
		meta: {
			label: '#saMediaPlay_tabLabel',
			pathname: 'preview',
			icon: 'icon-play',
		},
		conditions: [
			{ alias: UMB_WORKSPACE_CONDITION_ALIAS, match: UMB_MEDIA_WORKSPACE_ALIAS },
			{ alias: SA_MEDIA_PLAY_IS_PLAYABLE_CONDITION_ALIAS },
		],
	},
	{
		type: 'localization',
		alias: 'SA.MediaPlay.Localization.En',
		name: 'SA Media Play English',
		meta: { culture: 'en' },
		js: () => import('./lang/en.js'),
	},
];
