import { UmbMediaUrlRepository } from '@umbraco-cms/backoffice/media';
import type { UmbControllerHost } from '@umbraco-cms/backoffice/controller-api';

/** The full URL of a media item's file, or undefined if it has none. */
export async function saRequestMediaUrl(host: UmbControllerHost, unique: string): Promise<string | undefined> {
	const { data } = await new UmbMediaUrlRepository(host).requestItems([unique]);
	const url = data?.[0]?.url;
	return url ? new URL(url, window.location.origin).href : undefined;
}
