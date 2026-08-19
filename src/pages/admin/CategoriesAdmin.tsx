import { useState } from 'react';
import { useCategories } from '../../hooks/useCategories';
import { supabase, uploadImage } from '../../lib/supabase';
import { Plus, Edit, Trash2, X, Save, Upload } from 'lucide-react';
import './CategoriesAdmin.css';

export default function CategoriesAdmin() {
  const { categories, loading, refetch } = useCategories();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [sortOrder, setSortOrder] = useState('0');
  const [uploading, setUploading] = useState(false);

  const resetForm = () => {
    setName('');
    setSlug('');
    setImageUrl('');
    setSortOrder('0');
    setEditingId(null);
    setShowForm(false);
  };

  const handleEdit = (cat: typeof categories[0]) => {
    setName(cat.name);
    setSlug(cat.slug);
    setImageUrl(cat.image_url || '');
    setSortOrder(cat.sort_order.toString());
    setEditingId(cat.id);
    setShowForm(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const path = `categories/${Date.now()}_${file.name}`;
      const url = await uploadImage(file, 'product-images', path);
      setImageUrl(url);
    } catch {
      alert('Falha ao enviar imagem');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      name,
      slug: slug || name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
      image_url: imageUrl || null,
      sort_order: parseInt(sortOrder),
    };

    if (editingId) {
      const { error } = await supabase.from('categories').update(data).eq('id', editingId);
      if (error) {
        alert('Erro ao atualizar categoria: ' + error.message);
        return;
      }
    } else {
      const { error } = await supabase.from('categories').insert(data);
      if (error) {
        alert('Erro ao criar categoria: ' + error.message);
        return;
      }
    }

    resetForm();
    refetch();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta categoria?')) return;
    const { error } = await supabase.from('categories').delete().eq('id', id);
    if (error) {
      alert('Erro ao excluir categoria: ' + error.message);
      return;
    }
    refetch();
  };

  return (
    <div className="categories-admin-page">
      <div className="page-header-row">
        <div>
          <h1>Categorias</h1>
          <p>Gerencie as categorias de produtos</p>
        </div>
        <button className="btn-add" onClick={() => { resetForm(); setShowForm(true); }}>
          <Plus size={18} /> Nova categoria
        </button>
      </div>

      {showForm && (
        <div className="form-card category-form">
          <div className="form-card-header">
            <h3>{editingId ? 'Editar Categoria' : 'Nova Categoria'}</h3>
            <button className="close-btn" onClick={resetForm}><X size={18} /></button>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-field">
                <label>Nome</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  placeholder="Nome da categoria"
                />
              </div>
              <div className="form-field">
                <label>Slug</label>
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="gerado-automaticamente"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-field">
                <label>Ordem</label>
                <input
                  type="number"
                  min="0"
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value)}
                />
              </div>
              <div className="form-field">
                <label>Imagem</label>
                {imageUrl && (
                  <div className="category-preview">
                    <img src={imageUrl} alt={name} />
                    <button type="button" onClick={() => setImageUrl('')} className="remove-image-small">
                      <X size={12} />
                    </button>
                  </div>
                )}
                <label className="upload-btn small">
                  <Upload size={16} />
                  {uploading ? 'Enviando...' : 'Carregar imagem'}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={uploading}
                    style={{ display: 'none' }}
                  />
                </label>
              </div>
            </div>

            <div className="form-actions">
              <button type="button" className="btn-cancel" onClick={resetForm}>Cancelar</button>
              <button type="submit" className="btn-save"><Save size={16} /> Salvar</button>
            </div>
          </form>
        </div>
      )}

      <div className="categories-table-container">
        {loading ? (
          <p className="loading-text">Carregando...</p>
        ) : categories.length === 0 ? (
          <div className="empty-state">
            <p>Nenhuma categoria cadastrada.</p>
          </div>
        ) : (
          <table className="categories-table">
            <thead>
              <tr>
                <th>Imagem</th>
                <th>Nome</th>
                <th>Slug</th>
                <th>Ordem</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((cat) => (
                <tr key={cat.id}>
                  <td>
                    {cat.image_url ? (
                      <img src={cat.image_url} alt={cat.name} className="cat-thumb" />
                    ) : (
                      <div className="cat-thumb-placeholder">📁</div>
                    )}
                  </td>
                  <td><strong>{cat.name}</strong></td>
                  <td>{cat.slug}</td>
                  <td>{cat.sort_order}</td>
                  <td className="actions-cell">
                    <button className="action-btn edit" onClick={() => handleEdit(cat)}>
                      <Edit size={16} />
                    </button>
                    <button className="action-btn delete" onClick={() => handleDelete(cat.id)}>
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
