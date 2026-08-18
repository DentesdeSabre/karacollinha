import { Phone, MessageCircle } from 'lucide-react';
import { useStoreSettings } from '../hooks/useStoreSettings';
import './Contact.css';

export default function Contact() {
  const { settings } = useStoreSettings();
  const whatsappNumber = settings?.whatsapp_number || import.meta.env.VITE_WHATSAPP_NUMBER;

  return (
    <div className="contact-page">
      <div className="contact-header">
        <h1>Fale Conosco</h1>
        <p>Estamos prontos para atender você!</p>
      </div>

      <div className="contact-content container">
        <div className="contact-cards">
          <a
            href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent('Olá! Gostaria de saber mais sobre seus produtos de crochê.')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="contact-card whatsapp"
          >
            <div className="contact-card-icon">
              <MessageCircle size={40} />
            </div>
            <h3>WhatsApp</h3>
            <p>Converse conosco pelo WhatsApp para tirar dúvidas e fazer pedidos.</p>
            <span className="contact-card-action">Iniciar conversa →</span>
          </a>

          <div className="contact-card info">
            <div className="contact-card-icon">
              <Phone size={40} />
            </div>
            <h3>Atendimento</h3>
            <p>Segunda a sábado, das 8h às 18h.</p>
            <span className="contact-card-detail">Pelo WhatsApp</span>
          </div>
        </div>

        <div className="contact-info-section">
          <h2>Como funciona?</h2>
          <div className="steps">
            <div className="step">
              <span className="step-number">1</span>
              <h4>Escolha seu produto</h4>
              <p>Navegue pelo nosso catálogo e encontre a peça perfeita.</p>
            </div>
            <div className="step">
              <span className="step-number">2</span>
              <h4>Fale conosco</h4>
              <p>Clique em "Comprar pelo WhatsApp" e nos envie uma mensagem.</p>
            </div>
            <div className="step">
              <span className="step-number">3</span>
              <h4>Combine os detalhes</h4>
              <p>Definiremos juntos as cores, tamanho, prazo e forma de pagamento.</p>
            </div>
            <div className="step">
              <span className="step-number">4</span>
              <h4>Receba em casa</h4>
              <p>Sua peça artesanal será entregue com carinho!</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
