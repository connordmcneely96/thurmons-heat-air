import type { Metadata } from 'next';

export const SITE_URL = 'https://evergrowlandscaping.com';
export const SITE_NAME = 'Evergrow Landscaping';
export const DEFAULT_OG_IMAGE = '/api/assets/company-image.png';

type BuildPageMetadataInput = {
    title: string;
    description: string;
    path: string;
    ogImage?: string;
};

export function buildPageMetadata({
    title,
    description,
    path,
    ogImage = DEFAULT_OG_IMAGE,
}: BuildPageMetadataInput): Metadata {
    return {
        title,
        description,
        alternates: {
            canonical: path,
        },
        openGraph: {
            title,
            description,
            url: path,
            siteName: SITE_NAME,
            type: 'website',
            images: [{ url: ogImage }],
        },
        twitter: {
            card: 'summary_large_image',
            title,
            description,
            images: [ogImage],
        },
    };
}
