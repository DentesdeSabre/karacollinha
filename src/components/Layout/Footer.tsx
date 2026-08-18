import { Link } from 'react-router-dom';
import { Phone, MapPin, Heart } from 'lucide-react';
import { useStoreSettings } from '../../hooks/useStoreSettings';
import './Footer.css';

export default function Footer() {
  const { settings } = useStoreSettings();
  const whatsappNumber = settings?.whatsapp_number || import.meta.env.VITE_WHATSAPP_NUMBER;

  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-section">
          <h3 className="footer-title">
            <span>🧶</span> {settings?.store_name || 'Crochet & Arte'}
          </h3>
          <p className="footer-desc">
            {settings?.store_description || 'Produtos artesanais feitos com amor e carinho. Peças únicas de crochê para decorar e aquecer seu lar.'}
          </p>
        </div>

        <div className="footer-section">
          <h4>Navegação</h4>
          <Link to="/">Início</Link>
          <Link to="/catalogo">Catálogo</Link>
          <Link to="/categorias">Categorias</Link>
          <Link to="/ofertas">Ofertas</Link>
          <Link to="/contato">Contato</Link>
        </div>

        <div className="footer-section">
          <h4>Contato</h4>
          <a href={`https://wa.me/${whatsappNumber}`} target="_blank" rel="noopener noreferrer">
            <Phone size={16} /> WhatsApp
          </a>
          {settings?.store_description && (
            <span><MapPin size={16} /> Brasil</span>
          )}
        </div>
      </div>

      <div className="footer-bottom">
        <p>
          Feito com <Heart size={14} className="heart" /> {settings?.store_name || 'Crochet & Arte'} &copy; {new Date().getFullYear()}
        </p>
      </div>
    </footer>
  );
}
