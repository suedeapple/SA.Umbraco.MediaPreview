import { saRequestMediaUrl } from '../utils/request-media-url.js';
import { UmbEntityActionBase } from '@umbraco-cms/backoffice/entity-action';

export class SaOpenMediaFileEntityAction extends UmbEntityActionBase<never> {
	override async execute() {
		if (!this.args.unique) return;
		// Open the tab straight away, while the click still counts, so browsers don't block it as a pop-up.
		const tab = window.open('', '_blank');
		if (!tab) return;
		tab.opener = null;
		const url = await saRequestMediaUrl(this, this.args.unique);
		if (url) tab.location.href = url;
		else tab.close();
	}
}

export { SaOpenMediaFileEntityAction as api };
