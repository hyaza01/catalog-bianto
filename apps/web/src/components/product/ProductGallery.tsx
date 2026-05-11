'use client';

import Image from 'next/image';
import { useMemo, useState } from 'react';
import { ProductImage } from '@/features/products/types';

type ProductGalleryProps = {
  images: ProductImage[];
};

export function ProductGallery({ images }: ProductGalleryProps): React.JSX.Element {
  const sortedImages = useMemo(
    () => [...images].sort((a, b) => Number(b.isCover) - Number(a.isCover) || a.sortOrder - b.sortOrder),
    [images],
  );

  const [selectedImageId, setSelectedImageId] = useState(sortedImages[0]?.id);

  const selected = sortedImages.find((image) => image.id === selectedImageId) ?? sortedImages[0];

  if (!selected) {
    return (
      <div className="flex aspect-square items-center justify-center rounded-2xl bg-[var(--brand-50)] text-sm text-[var(--neutral-500)]">
        Sem imagens
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="relative aspect-square overflow-hidden rounded-2xl bg-[var(--brand-50)]">
        <Image
          src={selected.url}
          alt={selected.altText}
          fill
          className="object-cover"
          sizes="(max-width: 1024px) 100vw, 50vw"
        />
      </div>
      <div className="grid grid-cols-4 gap-2">
        {sortedImages.map((image) => (
          <button
            type="button"
            key={image.id}
            onClick={() => setSelectedImageId(image.id)}
            className={`relative aspect-square overflow-hidden rounded-xl border ${
              selected.id === image.id
                ? 'border-[var(--brand-600)] ring-2 ring-[var(--brand-200)]'
                : 'border-[var(--brand-100)]'
            }`}
          >
            <Image
              src={image.url}
              alt={image.altText}
              fill
              className="object-cover"
              sizes="25vw"
            />
          </button>
        ))}
      </div>
    </div>
  );
}

