import { useParams, Link } from 'react-router-dom';
import { useCategories } from '../hooks/useCategories';
import { useProducts } from '../hooks/useProducts';
import ProductCard from '../components/ProductCard';
import './Categories.css';

export default function Categories() {
  const { slug } = useParams<{ slug: string }>();
  const { categories, loading: catsLoading } = useCategories();
  const { products, loading: prodsLoading } = useProducts(slug ? { category: slug } : undefined);

  if (slug) {
    const category = categories.find((c) => c.slug === slug);

    return (
      <div className="categories-page">
        <div className="categories-header">
          <h1>{category?.name || 'Categoria'}</h1>
          <p>Produtos desta categoria</p>
        </div>
        <div className="catalog-content container">
          {prodsLoading ? (
            <div className="loading-grid">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="skeleton-card" />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="empty-state">
              <p>Nenhum produto nesta categoria.</p>
              <Link to="/categorias" className="back-btn">Ver todas as categorias</Link>
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

  return (
    <div className="categories-page">
      <div className="categories-header">
        <h1>Nossas Categorias</h1>
        <p>Encontre exatamente o que procura</p>
      </div>

      <div className="categories-list container">
        {catsLoading ? (
          <div className="loading-grid">
            {[1, 2, 3].map((i) => (
              <div key={i} className="skeleton-card" style={{ height: 200 }} />
            ))}
          </div>
        ) : (
          <div className="categories-grid-full">
            {categories.map((cat) => (
              <Link key={cat.id} to={`/categorias/${cat.slug}`} className="category-card-full">
                {cat.image_url && <img src={cat.image_url} alt={cat.name} />}
                <div className="category-card-info">
                  <h3>{cat.name}</h3>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
