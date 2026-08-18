import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase, uploadImage, deleteImage } from '../../lib/supabase';
import { useCategories } from '../../hooks/useCategories';
import type { ProductImage } from '../../types';
import { Upload, X, Save, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import './ProductForm.css';

export default function ProductForm() {
  const { id } = useParams<{ id: string }>();
  const isEditing = Boolean(id);
  const navigate = useNavigate();
  const { categories } = useCategories();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [promoPrice, setPromoPrice] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [isPromo, setIsPromo] = useState(false);
  const [isFeatured, setIsFeatured] = useState(false);
  const [isActive, setIsActive] = useState(true);
  const [stock, setStock] = useState('0');
  const [sortOrder, setSortOrder] = useState('0');
  const [images, setImages] = useState<ProductImage[]>([]);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isEditing && id) {
      const loadProduct = async () => {
        const { data } = await supabase
          .from('products')
          .select('*, images:product_images(*)')
          .eq('id', id)
          .single();

        if (data) {
          setName(data.name);
          setDescription(data.description);
          setPrice(data.price.toString());
          setPromoPrice(data.promo_price?.toString() || '');
          setCategoryId(data.category_id);
          setIsPromo(data.is_promo);
          setIsFeatured(data.is_featured);
          setIsActive(data.is_active);
          setStock(data.stock.toString());
          setSortOrder(data.sort_order.toString());
          setImages(data.images || []);
        }
      };
      loadProduct();
    }
  }, [id, isEditing]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || !id) return;

    setUploading(true);
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const path = `${id}/${Date.now()}_${file.name}`;
      const url = await uploadImage(file, 'product-images', path);

      const { data } = await supabase
        .from('product_images')
        .insert({
          product_id: id,
          url,
          alt: name,
          sort_order: images.length + i,
        })
        .select()
        .single();

      if (data) setImages((prev) => [...prev, data]);
    }
    setUploading(false);
  };

  const handleRemoveImage = async (image: ProductImage) => {
    const path = image.url.split('/').slice(-2).join('/');
    await deleteImage('product-images', path);
    await supabase.from('product_images').delete().eq('id', image.id);
    setImages((prev) => prev.filter((img) => img.id !== image.id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const productData = {
      name,
      description,
      price: parseFloat(price),
      promo_price: isPromo && promoPrice ? parseFloat(promoPrice) : null,
      category_id: categoryId,
      is_promo: isPromo,
      is_featured: isFeatured,
      is_active: isActive,
      stock: parseInt(stock),
      sort_order: parseInt(sortOrder),
    };

    if (isEditing && id) {
      await supabase.from('products').update(productData).eq('id', id);
    } else {
      const { data } = await supabase.from('products').insert(productData).select().single();
      if (data) {
        navigate(`/admin/produtos/editar/${data.id}`);
        return;
      }
    }

    setSaving(false);
    navigate('/admin/produtos');
  };

  return (
    <div className="product-form-page">
      <div className="page-header-row">
        <div>
          <Link to="/admin/produtos" className="back-link-admin">
            <ArrowLeft size={18} /> Voltar
          </Link>
          <h1>{isEditing ? 'Editar Produto' : 'Novo Produto'}</h1>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="product-form">
        <div className="form-grid">
          <div className="form-main">
            <div className="form-card">
              <h3>Informações básicas</h3>
              <div className="form-field">
                <label>Nome do produto</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  placeholder="Ex: Boneca de crochê"
                />
              </div>

              <div className="form-field">
                <label>Descrição</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  placeholder="Descreva o produto em detalhes..."
                />
              </div>

              <div className="form-row">
                <div className="form-field">
                  <label>Preço (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    required
                    placeholder="0,00"
                  />
                </div>

                <div className="form-field">
                  <label>Categoria</label>
                  <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} required>
                    <option value="">Selecione...</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-field">
                  <label>Estoque</label>
                  <input
                    type="number"
                    min="0"
                    value={stock}
                    onChange={(e) => setStock(e.target.value)}
                  />
                </div>
                <div className="form-field">
                  <label>Ordem</label>
                  <input
                    type="number"
                    min="0"
                    value={sortOrder}
                    onChange={(e) => setSortOrder(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="form-card">
              <h3>Promoção</h3>
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={isPromo}
                  onChange={(e) => setIsPromo(e.target.checked)}
                />
                Marcar como oferta
              </label>
              {isPromo && (
                <div className="form-field" style={{ marginTop: '1rem' }}>
                  <label>Preço promocional (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={promoPrice}
                    onChange={(e) => setPromoPrice(e.target.value)}
                    required
                    placeholder="0,00"
                  />
                </div>
              )}
            </div>
          </div>

          <div className="form-sidebar">
            <div className="form-card">
              <h3>Status</h3>
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                />
                Produto ativo
              </label>
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={isFeatured}
                  onChange={(e) => setIsFeatured(e.target.checked)}
                />
                Produto em destaque
              </label>
            </div>

            <div className="form-card">
              <h3>Imagens</h3>
              <div className="images-list">
                {images.map((img) => (
                  <div key={img.id} className="image-item">
                    <img src={img.url} alt={img.alt} />
                    <button
                      type="button"
                      className="remove-image"
                      onClick={() => handleRemoveImage(img)}
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>

              {isEditing && (
                <label className="upload-btn">
                  <Upload size={18} />
                  {uploading ? 'Enviando...' : 'Adicionar imagem'}
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageUpload}
                    disabled={uploading}
                    style={{ display: 'none' }}
                  />
                </label>
              )}

              {!isEditing && (
                <p className="upload-hint">Salve o produto primeiro para adicionar imagens.</p>
              )}
            </div>

            <button type="submit" className="save-btn" disabled={saving}>
              <Save size={18} />
              {saving ? 'Salvando...' : 'Salvar produto'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
