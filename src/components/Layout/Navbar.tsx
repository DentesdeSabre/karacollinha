import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Phone } from 'lucide-react';
import { useStoreSettings } from '../../hooks/useStoreSettings';
import './Navbar.css';

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const { settings } = useStoreSettings();
  const whatsappNumber = settings?.whatsapp_number || import.meta.env.VITE_WHATSAPP_NUMBER;

  const links = [
    { to: '/', label: 'Início' },
    { to: '/catalogo', label: 'Catálogo' },
    { to: '/categorias', label: 'Categorias' },
    { to: '/ofertas', label: 'Ofertas' },
    { to: '/contato', label: 'Contato' },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-brand">
          <span className="brand-icon">🧶</span>
          <span className="brand-text">{settings?.store_name || 'Karacol & Linha'}</span>
        </Link>

        <div className={`navbar-links ${menuOpen ? 'active' : ''}`}>
          {links.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`navbar-link ${isActive(link.to) ? 'active' : ''}`}
              onClick={() => setMenuOpen(false)}
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="navbar-actions">
          <a
            href={`https://wa.me/${whatsappNumber}`}
            target="_blank"
            rel="noopener noreferrer"
            className="whatsapp-btn-nav"
          >
            <Phone size={18} />
            <span>WhatsApp</span>
          </a>
          <button
            className="menu-toggle"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>
    </nav>
  );
}
