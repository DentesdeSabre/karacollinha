import { Link } from 'react-router-dom';
import { ArrowRight, Star, Tag, Clock, Sparkles } from 'lucide-react';
import { useProducts } from '../hooks/useProducts';
import { useCategories } from '../hooks/useCategories';
import { useStoreSettings } from '../hooks/useStoreSettings';
import ProductCard from '../components/ProductCard';
import './Home.css';

export default function Home() {
  const { products: featured } = useProducts({ featured: true });
  const { products: promo } = useProducts({ promo: true });
  const { products: allProducts } = useProducts();
  const { categories } = useCategories();
  const { settings } = useStoreSettings();

  const recentProducts = [...allProducts]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 4);

  return (
    <div className="home">
      <section className="hero">
        <div className="hero-bg" style={settings?.banner_url ? { backgroundImage: `url(${settings.banner_url})` } : {}}>
          <div className="hero-overlay" />
        </div>
        <div className="hero-content">
          <h1 className="hero-title">
            <span className="hero-emoji">🧶</span>
            {settings?.store_name || 'Karacol & Linha'}
          </h1>
          <p className="hero-slogan">{settings?.store_slogan || 'Peças artesanais feitas com amor e carinho'}</p>
          <div className="hero-actions">
            <Link to="/catalogo" className="btn-primary">
              Ver Catálogo <ArrowRight size={18} />
            </Link>
            <a
              href={`https://wa.me/${settings?.whatsapp_number || import.meta.env.VITE_WHATSAPP_NUMBER}?text=${encodeURIComponent('Olá! Gostaria de saber mais sobre seus produtos.')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-outline"
            >
              Fale Conosco
            </a>
          </div>
        </div>
      </section>

      {categories.length > 0 && (
        <section className="section categories-section">
          <div className="container">
            <h2 className="section-title">
              <Sparkles size={20} /> Categorias
            </h2>
            <div className="categories-grid">
              {categories.map((cat) => (
                <Link key={cat.id} to={`/categorias/${cat.slug}`} className="category-card">
                  {cat.image_url && <img src={cat.image_url} alt={cat.name} />}
                  <span>{cat.name}</span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {featured.length > 0 && (
        <section className="section">
          <div className="container">
            <div className="section-header">
              <h2 className="section-title">
                <Star size={20} /> Destaques
              </h2>
              <Link to="/catalogo" className="section-link">Ver todos <ArrowRight size={16} /></Link>
            </div>
            <div className="products-grid">
              {featured.slice(0, 4).map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        </section>
      )}

      {promo.length > 0 && (
        <section className="section section-alt">
          <div className="container">
            <div className="section-header">
              <h2 className="section-title">
                <Tag size={20} /> Ofertas
              </h2>
              <Link to="/ofertas" className="section-link">Ver ofertas <ArrowRight size={16} /></Link>
            </div>
            <div className="products-grid">
              {promo.slice(0, 4).map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        </section>
      )}

      {recentProducts.length > 0 && (
        <section className="section">
          <div className="container">
            <div className="section-header">
              <h2 className="section-title">
                <Clock size={20} /> Novidades
              </h2>
              <Link to="/catalogo" className="section-link">Ver catálogo <ArrowRight size={16} /></Link>
            </div>
            <div className="products-grid">
              {recentProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="cta-section">
        <div className="container">
          <div className="cta-card">
            <h2>Encontrou algo que gostou?</h2>
            <p>Fale conosco pelo WhatsApp e garanta sua peça artesanal!</p>
            <a
              href={`https://wa.me/${settings?.whatsapp_number || import.meta.env.VITE_WHATSAPP_NUMBER}?text=${encodeURIComponent('Olá! Vi os produtos no site e gostaria de saber mais!')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-whatsapp-large"
            >
              <span className="wa-icon">📱</span> Chamar no WhatsApp
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
