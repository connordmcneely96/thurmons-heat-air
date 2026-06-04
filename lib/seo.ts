import type { Metadata } from 'next';
import { siteConfig } from './site.config';

export const SITE_URL = siteConfig.url;
export const SITE_NAME = siteConfig.name;
export const DEFAULT_OG_IMAGE = siteConfig.ogImage;

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
