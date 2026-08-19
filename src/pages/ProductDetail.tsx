import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Tag, ShoppingCart, Package } from 'lucide-react';
import { useProduct } from '../hooks/useProducts';
import { useStoreSettings } from '../hooks/useStoreSettings';
import ImageGallery from '../components/ImageGallery';
import FreteCalc from '../components/FreteCalc';
import type { ShippingOption } from '../types';
import './ProductDetail.css';

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const { product, loading } = useProduct(id || '');
  const { settings } = useStoreSettings();
  const whatsappNumber = settings?.whatsapp_number || import.meta.env.VITE_WHATSAPP_NUMBER;
  const [selectedShipping, setSelectedShipping] = useState<ShippingOption | null>(null);

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

  const effectivePrice = product.is_promo && product.promo_price ? product.promo_price : product.price;

  const handleWhatsApp = () => {
    let message = `Olá! Tenho interesse neste produto:\n\n`;
    message += `Produto: ${product.name}\n`;
    message += `Preço: R$ ${effectivePrice.toFixed(2).replace('.', ',')}\n`;

    if (selectedShipping) {
      const cepInput = document.querySelector('.frete-input') as HTMLInputElement;
      const cepValue = cepInput?.value || '';
      const total = effectivePrice + parseFloat(selectedShipping.price);

      message += `CEP: ${cepValue}\n`;
      message += `Envio: ${selectedShipping.company} - ${selectedShipping.name}\n`;
      message += `Prazo estimado: ${selectedShipping.delivery_range.min === selectedShipping.delivery_range.max ? `${selectedShipping.delivery_range.max} dias úteis` : `${selectedShipping.delivery_range.min} a ${selectedShipping.delivery_range.max} dias úteis`}\n`;
      message += `Frete: R$ ${parseFloat(selectedShipping.price).toFixed(2).replace('.', ',')}\n`;
      message += `Total: R$ ${total.toFixed(2).replace('.', ',')}\n`;
    }

    message += `\nGostaria de finalizar a compra.`;

    window.open(`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`, '_blank');
  };

  const handleShippingSelect = (option: ShippingOption | null) => {
    setSelectedShipping(option);
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

            <FreteCalc
              productId={product.id}
              productPrice={effectivePrice}
              onSelect={handleShippingSelect}
            />

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
                  <p>Calcule o frete acima com seu CEP</p>
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
