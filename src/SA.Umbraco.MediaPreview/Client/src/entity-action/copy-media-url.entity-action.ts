import { saRequestMediaUrl } from '../utils/request-media-url.js';
import { UmbEntityActionBase } from '@umbraco-cms/backoffice/entity-action';
import { UmbLocalizationController } from '@umbraco-cms/backoffice/localization-api';
import { UMB_NOTIFICATION_CONTEXT } from '@umbraco-cms/backoffice/notification';

export class SaCopyMediaUrlEntityAction extends UmbEntityActionBase<never> {
	#localize = new UmbLocalizationController(this);

	override async execute() {
		if (!this.args.unique) return;
		const url = saRequestMediaUrl(this, this.args.unique).then((url) => {
			if (!url) throw new Error('This media item has no file.');
			return new Blob([url], { type: 'text/plain' });
		});
		// Hand the clipboard a promise rather than awaiting the URL first: Safari only allows a copy during the click.
		await navigator.clipboard.write([new ClipboardItem({ 'text/plain': url })]);

		const notificationContext = await this.getContext(UMB_NOTIFICATION_CONTEXT);
		notificationContext?.peek('positive', { data: { message: this.#localize.term('clipboard_copySuccessHeadline') } });
	}
}

export { SaCopyMediaUrlEntityAction as api };
