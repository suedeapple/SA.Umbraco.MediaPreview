import { resolvePlayableFile } from '../playable-file.js';
import { UmbConditionBase } from '@umbraco-cms/backoffice/extension-registry';
import type { UmbConditionConfigBase, UmbConditionControllerArguments, UmbExtensionCondition } from '@umbraco-cms/backoffice/extension-api';
import type { UmbControllerHost } from '@umbraco-cms/backoffice/controller-api';
import { UMB_MEDIA_WORKSPACE_CONTEXT } from '@umbraco-cms/backoffice/media';

/** Permitted when the media item being edited has a saved audio or video file. */
export class SaIsPlayableMediaCondition extends UmbConditionBase<UmbConditionConfigBase> implements UmbExtensionCondition {
	constructor(host: UmbControllerHost, args: UmbConditionControllerArguments<UmbConditionConfigBase>) {
		super(host, args);

		this.consumeContext(UMB_MEDIA_WORKSPACE_CONTEXT, (context) => {
			this.observe(
				context?.values,
				(values) => {
					this.permitted = !!resolvePlayableFile(values);
				},
				'_saObserveValues',
			);
		});
	}
}

export { SaIsPlayableMediaCondition as api };
