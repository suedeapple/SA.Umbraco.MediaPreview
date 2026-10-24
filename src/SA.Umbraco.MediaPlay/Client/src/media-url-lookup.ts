import { UmbMediaUrlRepository } from '@umbraco-cms/backoffice/media';
import type { UmbControllerHost } from '@umbraco-cms/backoffice/controller-api';

export interface SaMediaUrl {
	url?: string;
	extension?: string;
}

interface SaPendingLookup {
	host: UmbControllerHost;
	requests: Map<string, Array<(value: SaMediaUrl | undefined) => void>>;
}

const cache = new Map<string, Promise<SaMediaUrl | undefined>>();
let pending: SaPendingLookup | undefined;

async function flush(batch: SaPendingLookup) {
	const repository = new UmbMediaUrlRepository(batch.host);
	try {
		const { data } = await repository.requestItems([...batch.requests.keys()]);
		for (const [unique, resolvers] of batch.requests) {
			const item = data?.find((x) => x.unique === unique);
			resolvers.forEach((resolve) => resolve(item ? { url: item.url, extension: item.extension } : undefined));
		}
	} catch {
		batch.requests.forEach((resolvers) => resolvers.forEach((resolve) => resolve(undefined)));
	} finally {
		repository.destroy();
	}
}

/**
 * Looks up the file URL for a media item. Cards rendered together are combined into one request, because the
 * media grid doesn't include file URLs and a page can show dozens of cards at once.
 */
export function lookupMediaUrl(host: UmbControllerHost, unique: string): Promise<SaMediaUrl | undefined> {
	let result = cache.get(unique);
	if (result) return result;

	result = new Promise((resolve) => {
		if (!pending) {
			const batch: SaPendingLookup = { host, requests: new Map() };
			pending = batch;
			queueMicrotask(() => {
				pending = undefined;
				void flush(batch);
			});
		}
		const resolvers = pending.requests.get(unique) ?? [];
		resolvers.push(resolve);
		pending.requests.set(unique, resolvers);
	});

	// Don't keep failures, so a later attempt can succeed.
	result.then((value) => value === undefined && cache.delete(unique));
	cache.set(unique, result);
	return result;
}

/** Forget a cached URL, for example after the media item's file has been replaced. */
export function forgetMediaUrl(unique: string) {
	cache.delete(unique);
}
