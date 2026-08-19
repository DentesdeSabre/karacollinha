import { useState, useEffect } from 'react';
import { supabase, uploadImage, deleteImage } from '../../lib/supabase';
import { useStoreSettings } from '../../hooks/useStoreSettings';
import { Save, Upload, X } from 'lucide-react';
import './Settings.css';

export default function Settings() {
  const { settings, refetch } = useStoreSettings();
  const [storeName, setStoreName] = useState('');
  const [storeSlogan, setStoreSlogan] = useState('');
  const [storeDescription, setStoreDescription] = useState('');
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [bannerUrl, setBannerUrl] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [originPostalCode, setOriginPostalCode] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [originalBannerUrl, setOriginalBannerUrl] = useState('');
  const [originalLogoUrl, setOriginalLogoUrl] = useState('');

  useEffect(() => {
    if (settings) {
      setStoreName(settings.store_name || '');
      setStoreSlogan(settings.store_slogan || '');
      setStoreDescription(settings.store_description || '');
      setWhatsappNumber(settings.whatsapp_number || '');
      setBannerUrl(settings.banner_url || '');
      setLogoUrl(settings.logo_url || '');
      setOriginPostalCode(settings.origin_postal_code || '');
      setOriginalBannerUrl(settings.banner_url || '');
      setOriginalLogoUrl(settings.logo_url || '');
    }
  }, [settings]);

  const deleteOldImage = async (url: string) => {
    if (!url) return;
    try {
      const path = url.split('/store-settings/')[1];
      if (path) await deleteImage('store-settings', path);
    } catch {}
  };

  const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingBanner(true);
    try {
      const path = `banner_${Date.now()}_${file.name}`;
      const url = await uploadImage(file, 'store-settings', path);
      setBannerUrl(url);
    } catch {
      alert('Falha ao enviar banner');
    } finally {
      setUploadingBanner(false);
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingLogo(true);
    try {
      const path = `logo_${Date.now()}_${file.name}`;
      const url = await uploadImage(file, 'store-settings', path);
      setLogoUrl(url);
    } catch {
      alert('Falha ao enviar logo');
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleRemoveBanner = async () => {
    await deleteOldImage(bannerUrl);
    setBannerUrl('');
    setOriginalBannerUrl('');
  };

  const handleRemoveLogo = async () => {
    await deleteOldImage(logoUrl);
    setLogoUrl('');
    setOriginalLogoUrl('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaved(false);

    const data = {
      store_name: storeName,
      store_slogan: storeSlogan,
      store_description: storeDescription,
      whatsapp_number: whatsappNumber,
      banner_url: bannerUrl,
      logo_url: logoUrl,
      origin_postal_code: originPostalCode.replace(/\D/g, ''),
    };

    let saveError = false;

    if (settings?.id) {
      const { error } = await supabase.from('store_settings').update(data).eq('id', settings.id);
      if (error) {
        alert('Erro ao salvar: ' + error.message);
        setSaving(false);
        return;
      }
    } else {
      const { data: existing } = await supabase
        .from('store_settings')
        .select('id')
        .limit(1)
        .maybeSingle();

      if (existing?.id) {
        const { error } = await supabase.from('store_settings').update(data).eq('id', existing.id);
        if (error) {
          alert('Erro ao salvar: ' + error.message);
          setSaving(false);
          return;
        }
      } else {
        const { error } = await supabase.from('store_settings').insert(data);
        if (error) {
          alert('Erro ao salvar: ' + error.message);
          setSaving(false);
          return;
        }
      }
    }

    if (!saveError) {
      if (originalBannerUrl && originalBannerUrl !== bannerUrl) {
        await deleteOldImage(originalBannerUrl);
      }
      if (originalLogoUrl && originalLogoUrl !== logoUrl) {
        await deleteOldImage(originalLogoUrl);
      }
      setOriginalBannerUrl(bannerUrl);
      setOriginalLogoUrl(logoUrl);
    }

    refetch();
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="settings-page">
      <div className="page-header">
        <h1>Configurações da Loja</h1>
        <p>Gerencie as informações da sua loja</p>
      </div>

      <form onSubmit={handleSubmit} className="settings-form">
        <div className="form-card">
          <h3>Informações da Loja</h3>
          <div className="form-field">
            <label>Nome da loja</label>
            <input
              type="text"
              value={storeName}
              onChange={(e) => setStoreName(e.target.value)}
              placeholder="Ex: Karacol & Linha"
            />
          </div>

          <div className="form-field">
            <label>Slogan</label>
            <input
              type="text"
              value={storeSlogan}
              onChange={(e) => setStoreSlogan(e.target.value)}
              placeholder="Ex: Peças artesanais feitas com amor"
            />
          </div>

          <div className="form-field">
            <label>Descrição da loja</label>
            <textarea
              value={storeDescription}
              onChange={(e) => setStoreDescription(e.target.value)}
              rows={3}
              placeholder="Descreva sua loja..."
            />
          </div>
        </div>

        <div className="form-card">
          <h3>WhatsApp</h3>
          <div className="form-field">
            <label>Número do WhatsApp (com código do país)</label>
            <input
              type="text"
              value={whatsappNumber}
              onChange={(e) => setWhatsappNumber(e.target.value)}
              placeholder="5511999999999"
            />
            <span className="field-hint">Formato: código do país + DDD + número (ex: 5511999999999)</span>
          </div>
        </div>

        <div className="form-card">
          <h3>Frete</h3>
          <div className="form-field">
            <label>CEP de origem da loja</label>
            <input
              type="text"
              value={originPostalCode}
              onChange={(e) => {
                const v = e.target.value.replace(/\D/g, '').slice(0, 8);
                setOriginPostalCode(v.length > 5 ? `${v.slice(0, 5)}-${v.slice(5)}` : v);
              }}
              placeholder="00000-000"
              maxLength={9}
            />
            <span className="field-hint">CEP de onde os produtos serão enviados. Utilizado para cálculo de frete.</span>
          </div>
        </div>

        <div className="form-card">
          <h3>Imagens</h3>

          <div className="form-field">
            <label>Banner da loja</label>
            {bannerUrl ? (
              <div className="image-upload-preview">
                <img src={bannerUrl} alt="Banner" className="image-preview" />
                <button type="button" className="remove-image-btn" onClick={handleRemoveBanner}>
                  <X size={16} /> Remover
                </button>
              </div>
            ) : (
              <label className="upload-btn">
                <Upload size={18} />
                {uploadingBanner ? 'Enviando...' : 'Carregar banner'}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleBannerUpload}
                  disabled={uploadingBanner}
                  style={{ display: 'none' }}
                />
              </label>
            )}
          </div>

          <div className="form-field">
            <label>Logo da loja</label>
            {logoUrl ? (
              <div className="image-upload-preview">
                <img src={logoUrl} alt="Logo" className="image-preview logo" />
                <button type="button" className="remove-image-btn" onClick={handleRemoveLogo}>
                  <X size={16} /> Remover
                </button>
              </div>
            ) : (
              <label className="upload-btn">
                <Upload size={18} />
                {uploadingLogo ? 'Enviando...' : 'Carregar logo'}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  disabled={uploadingLogo}
                  style={{ display: 'none' }}
                />
              </label>
            )}
          </div>
        </div>

        <div className="settings-actions">
          {saved && <span className="save-success">Salvo com sucesso!</span>}
          <button type="submit" className="save-btn" disabled={saving}>
            <Save size={18} />
            {saving ? 'Salvando...' : 'Salvar configurações'}
          </button>
        </div>
      </form>
    </div>
  );
}
