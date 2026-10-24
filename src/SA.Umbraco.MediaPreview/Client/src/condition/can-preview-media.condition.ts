import { UmbConditionBase } from '@umbraco-cms/backoffice/extension-registry';
import { UMB_COLLECTION_CONTEXT } from '@umbraco-cms/backoffice/collection';
import { UMB_ENTITY_CONTEXT } from '@umbraco-cms/backoffice/entity';
import { observeMultiple } from '@umbraco-cms/backoffice/observable-api';
import type { UmbConditionConfigBase, UmbConditionControllerArguments, UmbExtensionCondition } from '@umbraco-cms/backoffice/extension-api';
import type { UmbControllerHost } from '@umbraco-cms/backoffice/controller-api';
import type { UmbMediaCollectionItemModel } from '@umbraco-cms/backoffice/media';

/** Key of Umbraco's built-in Folder media type. It's the same on every installation. */
const SA_FOLDER_MEDIA_TYPE_UNIQUE = 'f38bd2d7-65d0-48e6-95dc-87ce06ec2d3d';

/**
 * Permitted for media items shown in a collection (the media library grid or list), except folders.
 * Outside a collection, such as in the media tree, there's no grid for the fly-out to open over, so the
 * Preview action stays hidden and Umbraco's own first action (Create) is shown as before.
 *
 * The media type is read from the collection's items rather than from the card, because the card's actions
 * area sits outside the part of the card that provides the media type context.
 */
export class SaCanPreviewMediaCondition extends UmbConditionBase<UmbConditionConfigBase> implements UmbExtensionCondition {
	constructor(host: UmbControllerHost, args: UmbConditionControllerArguments<UmbConditionConfigBase>) {
		super(host, args);

		this.consumeContext(UMB_COLLECTION_CONTEXT, (collectionContext) => {
			if (!collectionContext) {
				this.permitted = false;
				return;
			}
			this.consumeContext(UMB_ENTITY_CONTEXT, (entityContext) => {
				if (!entityContext) {
					this.permitted = false;
					return;
				}
				this.observe(
					observeMultiple([collectionContext.items, entityContext.unique]),
					([items, unique]) => {
						const item = (items as Array<UmbMediaCollectionItemModel>).find((x) => x.unique === unique);
						const mediaTypeUnique = item?.mediaType?.unique?.toLowerCase();
						this.permitted = !!mediaTypeUnique && mediaTypeUnique !== SA_FOLDER_MEDIA_TYPE_UNIQUE;
					},
					'_saObserveItem',
				);
			});
		});
	}
}

export { SaCanPreviewMediaCondition as api };
