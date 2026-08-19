import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAllProducts } from '../../hooks/useProducts';
import { supabase, deleteImage } from '../../lib/supabase';
import { Plus, Edit, Trash2, Eye, EyeOff, Star } from 'lucide-react';
import './ProductsList.css';

export default function ProductsList() {
  const { products, loading, refetch } = useAllProducts();
  const [deleting, setDeleting] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este produto?')) return;
    setDeleting(id);

    const { data: images } = await supabase
      .from('product_images')
      .select('url')
      .eq('product_id', id);

    if (images) {
      for (const img of images) {
        try {
          const path = img.url.split('/product-images/')[1];
          if (path) await deleteImage('product-images', path);
        } catch {}
      }
    }

    const { error: imgError } = await supabase.from('product_images').delete().eq('product_id', id);
    if (imgError) {
      alert('Erro ao excluir imagens: ' + imgError.message);
      setDeleting(null);
      return;
    }

    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) {
      alert('Erro ao excluir produto: ' + error.message);
      setDeleting(null);
      return;
    }

    refetch();
    setDeleting(null);
  };

  const toggleActive = async (id: string, current: boolean) => {
    const { error } = await supabase.from('products').update({ is_active: !current }).eq('id', id);
    if (error) {
      alert('Erro ao alterar status: ' + error.message);
      return;
    }
    refetch();
  };

  const toggleFeatured = async (id: string, current: boolean) => {
    const { error } = await supabase.from('products').update({ is_featured: !current }).eq('id', id);
    if (error) {
      alert('Erro ao alterar destaque: ' + error.message);
      return;
    }
    refetch();
  };

  return (
    <div className="products-list-page">
      <div className="page-header-row">
        <div>
          <h1>Produtos</h1>
          <p>Gerencie seu catálogo de produtos</p>
        </div>
        <Link to="/admin/produtos/novo" className="btn-add">
          <Plus size={18} /> Novo produto
        </Link>
      </div>

      <div className="products-table-container">
        {loading ? (
          <p className="loading-text">Carregando produtos...</p>
        ) : products.length === 0 ? (
          <div className="empty-state">
            <p>Nenhum produto cadastrado.</p>
            <Link to="/admin/produtos/novo" className="btn-add">
              <Plus size={18} /> Adicionar primeiro produto
            </Link>
          </div>
        ) : (
          <table className="products-table">
            <thead>
              <tr>
                <th>Produto</th>
                <th>Preço</th>
                <th>Categoria</th>
                <th>Status</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => {
                const mainImage = product.images?.[0]?.url;
                return (
                  <tr key={product.id}>
                    <td className="product-cell">
                      {mainImage ? (
                        <img src={mainImage} alt={product.name} className="product-thumb" />
                      ) : (
                        <div className="product-thumb-placeholder">📷</div>
                      )}
                      <div>
                        <span className="product-cell-name">{product.name}</span>
                        {product.is_promo && <span className="promo-badge">Oferta</span>}
                      </div>
                    </td>
                    <td>
                      {product.is_promo && product.promo_price ? (
                        <div>
                          <span className="price-old">R$ {product.price.toFixed(2).replace('.', ',')}</span>
                          <span className="price-new">R$ {product.promo_price.toFixed(2).replace('.', ',')}</span>
                        </div>
                      ) : (
                        <span>R$ {product.price.toFixed(2).replace('.', ',')}</span>
                      )}
                    </td>
                    <td>{product.category?.name || '-'}</td>
                    <td>
                      <button
                        className={`status-toggle ${product.is_active ? 'active' : ''}`}
                        onClick={() => toggleActive(product.id, product.is_active)}
                      >
                        {product.is_active ? <Eye size={14} /> : <EyeOff size={14} />}
                        {product.is_active ? 'Ativo' : 'Inativo'}
                      </button>
                    </td>
                    <td className="actions-cell">
                      <button
                        className={`action-btn star ${product.is_featured ? 'active' : ''}`}
                        onClick={() => toggleFeatured(product.id, product.is_featured)}
                        title="Destaque"
                      >
                        <Star size={16} />
                      </button>
                      <Link to={`/admin/produtos/editar/${product.id}`} className="action-btn edit">
                        <Edit size={16} />
                      </Link>
                      <button
                        className="action-btn delete"
                        onClick={() => handleDelete(product.id)}
                        disabled={deleting === product.id}
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
