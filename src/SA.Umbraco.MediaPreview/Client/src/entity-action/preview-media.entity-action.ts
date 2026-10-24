import { UmbEntityActionBase } from '@umbraco-cms/backoffice/entity-action';
import { UMB_COLLECTION_CONTEXT } from '@umbraco-cms/backoffice/collection';
import { UMB_EDIT_MEDIA_WORKSPACE_PATH_PATTERN, UMB_MEDIA_ENTITY_TYPE } from '@umbraco-cms/backoffice/media';
import type { UmbModalRouteBuilder } from '@umbraco-cms/backoffice/router';
import type { Observable } from '@umbraco-cms/backoffice/external/rxjs';

/** How long to wait for the collection's fly-out route before falling back to the normal edit page. */
const FLYOUT_ROUTE_TIMEOUT_MS = 5000;

interface SaCollectionWithWorkspacePath {
	workspacePathBuilder?: Observable<UmbModalRouteBuilder | undefined>;
}

/**
 * Opens the media item's standard editor as a fly-out over the media library.
 *
 * Umbraco's media collection already registers a fly-out route for its items (`entity/:entityType`), which is
 * what this links to, so there's no routing of our own and the result is the same editor the Media Picker opens.
 * If that route isn't available (for example if a future Umbraco version changes how collections register it),
 * the action links to the item's normal edit page instead, so the button never does nothing.
 */
export class SaPreviewMediaEntityAction extends UmbEntityActionBase<never> {
	#href: Promise<string | undefined>;

	constructor(...args: ConstructorParameters<typeof UmbEntityActionBase<never>>) {
		super(...args);

		const unique = this.args.unique;
		const editPage = unique ? UMB_EDIT_MEDIA_WORKSPACE_PATH_PATTERN.generateAbsolute({ unique }) : undefined;

		this.#href = new Promise((resolve) => {
			const fallback = setTimeout(() => resolve(editPage), FLYOUT_ROUTE_TIMEOUT_MS);
			const done = (href: string | undefined) => {
				clearTimeout(fallback);
				resolve(href);
			};

			this.consumeContext(UMB_COLLECTION_CONTEXT, (context) => {
				const pathBuilder = (context as SaCollectionWithWorkspacePath | undefined)?.workspacePathBuilder;
				if (!pathBuilder || !unique) {
					done(editPage);
					return;
				}
				this.observe(
					pathBuilder,
					(routeBuilder) => {
						if (routeBuilder) done(`${routeBuilder({ entityType: UMB_MEDIA_ENTITY_TYPE })}edit/${unique}`);
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
