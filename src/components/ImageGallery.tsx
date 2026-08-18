import { useState } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import type { ProductImage } from '../types';
import './ImageGallery.css';

interface ImageGalleryProps {
  images: ProductImage[];
  productName: string;
}

export default function ImageGallery({ images, productName }: ImageGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  if (!images || images.length === 0) return null;

  const sorted = [...images].sort((a, b) => a.sort_order - b.sort_order);

  const navigate = (direction: 'prev' | 'next') => {
    setCurrentIndex((prev) => {
      if (direction === 'prev') return prev === 0 ? sorted.length - 1 : prev - 1;
      return prev === sorted.length - 1 ? 0 : prev + 1;
    });
  };

  return (
    <>
      <div className="gallery">
        <div className="gallery-main" onClick={() => setLightboxOpen(true)}>
          <img src={sorted[currentIndex].url} alt={sorted[currentIndex].alt || productName} />
          {sorted.length > 1 && (
            <>
              <button className="gallery-nav prev" onClick={(e) => { e.stopPropagation(); navigate('prev'); }}>
                <ChevronLeft size={20} />
              </button>
              <button className="gallery-nav next" onClick={(e) => { e.stopPropagation(); navigate('next'); }}>
                <ChevronRight size={20} />
              </button>
            </>
          )}
          <span className="gallery-count">{currentIndex + 1} / {sorted.length}</span>
        </div>

        {sorted.length > 1 && (
          <div className="gallery-thumbs">
            {sorted.map((img, i) => (
              <button
                key={img.id}
                className={`gallery-thumb ${i === currentIndex ? 'active' : ''}`}
                onClick={() => setCurrentIndex(i)}
              >
                <img src={img.url} alt={img.alt || productName} />
              </button>
            ))}
          </div>
        )}
      </div>

      {lightboxOpen && (
        <div className="lightbox" onClick={() => setLightboxOpen(false)}>
          <button className="lightbox-close" onClick={() => setLightboxOpen(false)}>
            <X size={24} />
          </button>
          <img src={sorted[currentIndex].url} alt={sorted[currentIndex].alt || productName} onClick={(e) => e.stopPropagation()} />
          {sorted.length > 1 && (
            <>
              <button className="lightbox-nav prev" onClick={(e) => { e.stopPropagation(); navigate('prev'); }}>
                <ChevronLeft size={32} />
              </button>
              <button className="lightbox-nav next" onClick={(e) => { e.stopPropagation(); navigate('next'); }}>
                <ChevronRight size={32} />
              </button>
            </>
          )}
        </div>
      )}
    </>
  );
}
