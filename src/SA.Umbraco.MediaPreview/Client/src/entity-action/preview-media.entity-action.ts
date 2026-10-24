import { UmbEntityActionBase } from '@umbraco-cms/backoffice/entity-action';
import { UMB_COLLECTION_CONTEXT } from '@umbraco-cms/backoffice/collection';
import { UMB_MEDIA_ENTITY_TYPE } from '@umbraco-cms/backoffice/media';
import type { UmbModalRouteBuilder } from '@umbraco-cms/backoffice/router';
import type { Observable } from '@umbraco-cms/backoffice/external/rxjs';

interface SaCollectionWithWorkspacePath {
	workspacePathBuilder?: Observable<UmbModalRouteBuilder | undefined>;
}

/**
 * Opens the media item's standard editor as a fly-out over the media library.
 *
 * Umbraco's media collection already registers a fly-out route for its items (`entity/:entityType`), which is
 * what this links to, so there's no routing of our own and the result is the same editor the Media Picker opens.
 */
export class SaPreviewMediaEntityAction extends UmbEntityActionBase<never> {
	#href: Promise<string | undefined>;

	constructor(...args: ConstructorParameters<typeof UmbEntityActionBase<never>>) {
		super(...args);

		this.#href = new Promise((resolve) => {
			this.consumeContext(UMB_COLLECTION_CONTEXT, (context) => {
				const pathBuilder = (context as SaCollectionWithWorkspacePath | undefined)?.workspacePathBuilder;
				if (!pathBuilder || !this.args.unique) {
					resolve(undefined);
					return;
				}
				this.observe(
					pathBuilder,
					(routeBuilder) => {
						if (routeBuilder) resolve(`${routeBuilder({ entityType: UMB_MEDIA_ENTITY_TYPE })}edit/${this.args.unique}`);
					},
					'_saObserveWorkspacePath',
				);
			});
		});
	}

	override getHref() {
		return this.#href;
	}

	override async execute() {
		// The action is a link (see getHref), so there is nothing to run when it's clicked.
	}
}

export { SaPreviewMediaEntityAction as api };
