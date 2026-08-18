import { useAllProducts } from '../../hooks/useProducts';
import { useCategories } from '../../hooks/useCategories';
import { Package, Tag, Star, TrendingUp } from 'lucide-react';
import './Dashboard.css';

export default function Dashboard() {
  const { products, loading: prodsLoading } = useAllProducts();
  const { categories } = useCategories();

  const activeProducts = products.filter((p) => p.is_active);
  const featuredProducts = products.filter((p) => p.is_featured);
  const promoProducts = products.filter((p) => p.is_promo);
  const outOfStock = products.filter((p) => p.stock <= 0);

  const stats = [
    { label: 'Produtos', value: products.length, icon: Package, color: '#6366f1' },
    { label: 'Ativos', value: activeProducts.length, icon: TrendingUp, color: '#16a34a' },
    { label: 'Destaques', value: featuredProducts.length, icon: Star, color: '#f59e0b' },
    { label: 'Ofertas', value: promoProducts.length, icon: Tag, color: '#ec4899' },
    { label: 'Categorias', value: categories.length, icon: Tag, color: '#8b5cf6' },
    { label: 'Sem estoque', value: outOfStock.length, icon: Package, color: '#ef4444' },
  ];

  return (
    <div className="dashboard">
      <div className="page-header">
        <h1>Dashboard</h1>
        <p>Visão geral da sua loja</p>
      </div>

      <div className="stats-grid">
        {stats.map((stat) => (
          <div key={stat.label} className="stat-card">
            <div className="stat-icon" style={{ background: `${stat.color}15`, color: stat.color }}>
              <stat.icon size={24} />
            </div>
            <div className="stat-info">
              <span className="stat-value">{prodsLoading ? '...' : stat.value}</span>
              <span className="stat-label">{stat.label}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="recent-section">
        <h2>Produtos recentes</h2>
        <div className="recent-table">
          <div className="table-header">
            <span>Produto</span>
            <span>Preço</span>
            <span>Status</span>
          </div>
          {prodsLoading ? (
            <p className="loading-text">Carregando...</p>
          ) : (
            [...products]
              .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
              .slice(0, 5)
              .map((p) => (
                <div key={p.id} className="table-row">
                  <span className="product-name-cell">{p.name}</span>
                  <span>
                    {p.is_promo && p.promo_price
                      ? `R$ ${p.promo_price.toFixed(2).replace('.', ',')}`
                      : `R$ ${p.price.toFixed(2).replace('.', ',')}`}
                  </span>
                  <span className={`status-badge ${p.is_active ? 'active' : 'inactive'}`}>
                    {p.is_active ? 'Ativo' : 'Inativo'}
                  </span>
                </div>
              ))
          )}
        </div>
      </div>
    </div>
  );
}
