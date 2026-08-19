import { useState } from 'react';
import type { ShippingOption } from '../types';

interface UseFreteReturn {
  options: ShippingOption[];
  loading: boolean;
  error: string | null;
  calculate: (productId: string, cep: string) => Promise<void>;
  clear: () => void;
}

export function useFrete(): UseFreteReturn {
  const [options, setOptions] = useState<ShippingOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const calculate = async (productId: string, cep: string) => {
    const cleanCep = cep.replace(/\D/g, '');
    if (cleanCep.length !== 8) {
      setError('CEP inválido. Informe 8 dígitos.');
      return;
    }

    setLoading(true);
    setError(null);
    setOptions([]);

    try {
      const response = await fetch('/api/frete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product_id: productId,
          to_postal_code: cleanCep,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Erro ao calcular frete.');
        return;
      }

      if (!data.options || data.options.length === 0) {
        setError('Nenhuma transportadora disponível para este CEP.');
        return;
      }

      setOptions(data.options);
    } catch {
      setError('Erro de conexão. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const clear = () => {
    setOptions([]);
    setError(null);
    setLoading(false);
  };

  return { options, loading, error, calculate, clear };
}
