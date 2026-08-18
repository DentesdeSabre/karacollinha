import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Tag, ShoppingCart, Package } from 'lucide-react';
import { useProduct } from '../hooks/useProducts';
import { useStoreSettings } from '../hooks/useStoreSettings';
import ImageGallery from '../components/ImageGallery';
import './ProductDetail.css';

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const { product, loading } = useProduct(id || '');
  const { settings } = useStoreSettings();
  const whatsappNumber = settings?.whatsapp_number || import.meta.env.VITE_WHATSAPP_NUMBER;

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="not-found">
        <h2>Produto não encontrado</h2>
        <Link to="/catalogo">Voltar ao catálogo</Link>
      </div>
    );
  }

  const discount = product.is_promo && product.promo_price
    ? Math.round(((product.price - product.promo_price) / product.price) * 100)
    : 0;

  const handleWhatsApp = () => {
    const message = encodeURIComponent(
      `Olá! Tenho interesse no produto ${product.name}, no valor de R$ ${(product.promo_price || product.price).toFixed(2).replace('.', ',')}. Gostaria de saber mais informações.`
    );
    window.open(`https://wa.me/${whatsappNumber}?text=${message}`, '_blank');
  };

  return (
    <div className="product-detail-page">
      <div className="container">
        <Link to="/catalogo" className="back-link">
          <ArrowLeft size={18} /> Voltar ao catálogo
        </Link>

        <div className="product-detail">
          <div className="product-detail-gallery">
            <ImageGallery images={product.images || []} productName={product.name} />
          </div>

          <div className="product-detail-info">
            {product.category && (
              <span className="detail-category">{product.category.name}</span>
            )}

            <h1 className="detail-name">{product.name}</h1>

            <div className="detail-pricing">
              {product.is_promo && product.promo_price ? (
                <>
                  <span className="detail-price-old">
                    R$ {product.price.toFixed(2).replace('.', ',')}
                  </span>
                  <span className="detail-price">
                    R$ {product.promo_price.toFixed(2).replace('.', ',')}
                  </span>
                  <span className="detail-discount">
                    <Tag size={14} /> -{discount}%
                  </span>
                </>
              ) : (
                <span className="detail-price">
                  R$ {product.price.toFixed(2).replace('.', ',')}
                </span>
              )}
            </div>

            <div className="detail-availability">
              <Package size={16} />
              {product.stock > 0 ? (
                <span className="available">Em estoque ({product.stock} {product.stock === 1 ? 'unidade' : 'unidades'})</span>
              ) : (
                <span className="unavailable">Fora de estoque</span>
              )}
            </div>

            <div className="detail-description">
              <h3>Descrição</h3>
              <p>{product.description}</p>
            </div>

            <div className="detail-actions">
              {product.stock > 0 && (
                <button onClick={handleWhatsApp} className="btn-buy-whatsapp">
                  <ShoppingCart size={20} /> Comprar pelo WhatsApp
                </button>
              )}
            </div>

            <div className="detail-info-list">
              <div className="info-item">
                <span className="info-icon">📦</span>
                <div>
                  <strong>Produto artesanal</strong>
                  <p>Feito à mão com amor e dedicação</p>
                </div>
              </div>
              <div className="info-item">
                <span className="info-icon">🚚</span>
                <div>
                  <strong>Entrega</strong>
                  <p>Prazo e frete combinados pelo WhatsApp</p>
                </div>
              </div>
              <div className="info-item">
                <span className="info-icon">💳</span>
                <div>
                  <strong>Pagamento</strong>
                  <p>Combine as condições pelo WhatsApp</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
