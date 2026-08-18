import { useProducts } from '../hooks/useProducts';
import ProductCard from '../components/ProductCard';
import { Tag } from 'lucide-react';
import './Offers.css';

export default function Offers() {
  const { products, loading } = useProducts({ promo: true });

  return (
    <div className="offers-page">
      <div className="offers-header">
        <Tag size={28} />
        <h1>Ofertas Especiais</h1>
        <p>Aproveite nossos preços promocionais em peças artesanais</p>
      </div>

      <div className="catalog-content container">
        {loading ? (
          <div className="loading-grid">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="skeleton-card" />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="empty-state">
            <p>Nenhuma oferta disponível no momento. Volte em breve!</p>
          </div>
        ) : (
          <div className="products-grid">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
