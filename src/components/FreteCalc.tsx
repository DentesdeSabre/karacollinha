import { useState } from 'react';
import { Truck, Check, Loader2 } from 'lucide-react';
import { useFrete } from '../hooks/useFrete';
import type { ShippingOption } from '../types';
import './FreteCalc.css';

interface FreteCalcProps {
  productId: string;
  productPrice: number;
  onSelect: (option: ShippingOption | null) => void;
}

export default function FreteCalc({ productId, productPrice, onSelect }: FreteCalcProps) {
  const [cep, setCep] = useState('');
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const { options, loading, error, calculate } = useFrete();

  const handleCepChange = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 8);
    const formatted = digits.length > 5 ? `${digits.slice(0, 5)}-${digits.slice(5)}` : digits;
    setCep(formatted);
  };

  const handleCalculate = () => {
    if (loading) return;
    setSelectedId(null);
    onSelect(null);
    calculate(productId, cep);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleCalculate();
    }
  };

  const handleSelect = (option: ShippingOption) => {
    setSelectedId(option.id);
    onSelect(option);
  };

  const formatCurrency = (value: string) => {
    return `R$ ${parseFloat(value).toFixed(2).replace('.', ',')}`;
  };

  return (
    <div className="frete-calc">
      <h3 className="frete-title">
        <Truck size={20} /> Calcule o frete
      </h3>

      <div className="frete-input-row">
        <div className="frete-input-group">
          <input
            type="text"
            value={cep}
            onChange={(e) => handleCepChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="00000-000"
            maxLength={9}
            className="frete-input"
          />
        </div>
        <button
          onClick={handleCalculate}
          disabled={loading || cep.replace(/\D/g, '').length !== 8}
          className="frete-btn-calculate"
        >
          {loading ? <Loader2 size={16} className="spin" /> : 'Calcular'}
        </button>
      </div>

      {error && <p className="frete-error">{error}</p>}

      {loading && (
        <div className="frete-loading">
          <Loader2 size={20} className="spin" />
          <span>Calculando frete...</span>
        </div>
      )}

      {options.length > 0 && !loading && (
        <div className="frete-options">
          {options.map((opt) => (
            <button
              key={opt.id}
              className={`frete-option ${selectedId === opt.id ? 'selected' : ''}`}
              onClick={() => handleSelect(opt)}
            >
              <div className="frete-option-left">
                <div className="frete-option-radio">
                  {selectedId === opt.id && <Check size={12} />}
                </div>
                <div>
                  <span className="frete-option-name">{opt.company} - {opt.name}</span>
                  <span className="frete-option-time">
                    Prazo estimado: {opt.delivery_range.min === opt.delivery_range.max
                      ? `${opt.delivery_range.max} dias úteis`
                      : `${opt.delivery_range.min} a ${opt.delivery_range.max} dias úteis`}
                  </span>
                </div>
              </div>
              <span className="frete-option-price">{formatCurrency(opt.price)}</span>
            </button>
          ))}

          <div className="frete-total-preview">
            <span>Produto: {formatCurrency(productPrice.toString())}</span>
            {selectedId && (
              <span>
                + Frete: {formatCurrency(
                  options.find((o) => o.id === selectedId)?.price || '0'
                )} ={' '}
                <strong>
                  {formatCurrency(
                    (
                      productPrice +
                      parseFloat(options.find((o) => o.id === selectedId)?.price || '0')
                    ).toString()
                  )}
                </strong>
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
