import { Phone } from 'lucide-react';
import { useStoreSettings } from '../hooks/useStoreSettings';
import './WhatsAppButton.css';

export default function WhatsAppButton() {
  const { settings } = useStoreSettings();
  const whatsappNumber = settings?.whatsapp_number || import.meta.env.VITE_WHATSAPP_NUMBER;

  return (
    <a
      href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent('Olá! Gostaria de saber mais sobre seus produtos de crochê.')}`}
      target="_blank"
      rel="noopener noreferrer"
      className="whatsapp-float"
      aria-label="Contato via WhatsApp"
    >
      <Phone size={28} />
    </a>
  );
}
