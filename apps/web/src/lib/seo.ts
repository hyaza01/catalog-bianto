import type { Metadata } from 'next';
import siteConfig from '@/config/site';

export function buildMetadata(input?: {
  title?: string;
  description?: string;
  canonicalPath?: string;
}): Metadata {
  const title = input?.title ? `${input.title} | ${siteConfig.name}` : `${siteConfig.name} | ${siteConfig.slogan}`;
  const description = input?.description ?? siteConfig.description;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
    alternates: input?.canonicalPath
      ? {
          canonical: input.canonicalPath,
        }
      : undefined,
  };
}
