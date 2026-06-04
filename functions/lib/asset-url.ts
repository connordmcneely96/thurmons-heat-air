const ASSET_PATH_PREFIX = '/api/assets/';

export function normalizeAssetUrl(value: string | null | undefined): string | null {
    if (!value) {
        return null;
    }

    const trimmed = value.trim();
    if (!trimmed) {
        return null;
    }

    if (trimmed.startsWith(ASSET_PATH_PREFIX)) {
        return trimmed;
    }

    if (trimmed.startsWith('api/assets/')) {
        return `/${trimmed}`;
    }

    try {
        const parsed = new URL(trimmed);
        if ((parsed.protocol === 'https:' || parsed.protocol === 'http:') && parsed.pathname.startsWith(ASSET_PATH_PREFIX)) {
            return `${parsed.pathname}${parsed.search}`;
        }
    } catch {
        // Keep original URL when it is not an absolute URL.
    }

    return trimmed;
}
