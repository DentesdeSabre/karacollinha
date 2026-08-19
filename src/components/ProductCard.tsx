import { Link } from 'react-router-dom';
import { Tag, ShoppingCart } from 'lucide-react';
import type { Product } from '../types';
import { useStoreSettings } from '../hooks/useStoreSettings';
import './ProductCard.css';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { settings } = useStoreSettings();
  const whatsappNumber = settings?.whatsapp_number || import.meta.env.VITE_WHATSAPP_NUMBER;
  const mainImage = product.images?.[0]?.url || '/placeholder.svg';
  const discount = product.is_promo && product.promo_price
    ? Math.round(((product.price - product.promo_price) / product.price) * 100)
    : 0;

  const handleWhatsAppClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const message = encodeURIComponent(
      `Olá! Tenho interesse no produto ${product.name}, no valor de R$ ${(product.promo_price || product.price).toFixed(2).replace('.', ',')}. Gostaria de saber mais informações.`
    );
    window.open(`https://wa.me/${whatsappNumber}?text=${message}`, '_blank');
  };

  return (
    <div className="product-card">
      <Link to={`/produto/${product.id}`} className="product-card-link">
        <div className="product-card-image-wrapper">
          <img src={mainImage} alt={product.name} className="product-card-image" />
          {product.is_promo && (
            <span className="product-badge promo">
              <Tag size={12} /> -{discount}%
            </span>
          )}
          {product.is_featured && (
            <span className="product-badge featured">Destaque</span>
          )}
          {product.stock <= 0 && (
            <span className="product-badge out-of-stock">Esgotado</span>
          )}
        </div>

        <div className="product-card-body">
          {product.category && (
            <span className="product-category">{product.category.name}</span>
          )}
          <h3 className="product-name">{product.name}</h3>
          <p className="product-desc">{product.description?.substring(0, 80)}...</p>

          <div className="product-pricing">
            {product.is_promo && product.promo_price ? (
              <>
                <span className="product-price-old">
                  R$ {product.price.toFixed(2).replace('.', ',')}
                </span>
                <span className="product-price">
                  R$ {product.promo_price.toFixed(2).replace('.', ',')}
                </span>
              </>
            ) : (
              <span className="product-price">
                R$ {product.price.toFixed(2).replace('.', ',')}
              </span>
            )}
          </div>

          <div className="product-availability">
            {product.stock > 0 ? (
              <span className="available">Disponível</span>
            ) : (
              <span className="unavailable">Indisponível</span>
            )}
          </div>
        </div>
      </Link>

      <div className="product-card-actions">
        <Link to={`/produto/${product.id}`} className="btn-view">
          Ver produto
        </Link>
        {product.stock > 0 && (
          <button onClick={handleWhatsAppClick} className="btn-whatsapp">
            <ShoppingCart size={16} /> Comprar
          </button>
        )}
      </div>
    </div>
  );
}
