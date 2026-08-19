import type { VercelRequest, VercelResponse } from '@vercel/node';
import { calculateShipping } from './melhor-envio/auth';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  const { product_id, to_postal_code } = req.body;

  if (!to_postal_code || !/^\d{8}$/.test(to_postal_code.replace('-', ''))) {
    return res.status(400).json({ error: 'CEP de destino inválido. Informe 8 dígitos.' });
  }

  if (!product_id) {
    return res.status(400).json({ error: 'Produto não informado.' });
  }

  try {
    const supabaseUrl = process.env.VITE_SUPABASE_URL;
    const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return res.status(500).json({ error: 'Configuração do Supabase indisponível.' });
    }

    const prodRes = await fetch(
      `${supabaseUrl}/rest/v1/products?id=eq.${product_id}&select=*,category:categories(name)`,
      { headers: { apikey: supabaseKey, Authorization: `Bearer ${supabaseKey}` } }
    );

    if (!prodRes.ok) {
      return res.status(500).json({ error: 'Erro ao buscar produto.' });
    }

    const products = await prodRes.json();
    const product = products[0];

    if (!product) {
      return res.status(404).json({ error: 'Produto não encontrado.' });
    }

    if (!product.weight || product.weight <= 0) {
      return res.status(400).json({ error: 'Produto sem peso configurado. Preencha o peso no painel administrativo.' });
    }

    if (!product.height || !product.width || !product.length) {
      return res.status(400).json({ error: 'Produto sem dimensões configuradas. Preencha altura, largura e comprimento no painel administrativo.' });
    }

    const settingsRes = await fetch(
      `${supabaseUrl}/rest/v1/store_settings?select=origin_postal_code&limit=1`,
      { headers: { apikey: supabaseKey, Authorization: `Bearer ${supabaseKey}` } }
    );

    let originPostalCode = '';

    if (settingsRes.ok) {
      const settings = await settingsRes.json();
      originPostalCode = settings[0]?.origin_postal_code?.replace(/\D/g, '') || '';
    }

    if (!originPostalCode || originPostalCode.length !== 8) {
      return res.status(400).json({ error: 'CEP de origem da loja não configurado. Configure-o nas configurações da loja.' });
    }

    const cleanedDest = to_postal_code.replace(/\D/g, '');

    const shippingPayload = {
      from: { postal_code: originPostalCode },
      to: { postal_code: cleanedDest },
      products: [
        {
          id: product.id,
          width: product.width,
          height: product.height,
          length: product.length,
          weight: product.weight,
          insurance_value: product.insurance_value || product.price,
          quantity: 1,
        },
      ],
      options: { receipt: false, own_hand: false },
    };

    const result = await calculateShipping(shippingPayload);

    const options = Array.isArray(result)
      ? result.map((item: any) => ({
          id: item.id,
          name: item.name,
          company: item.company?.name || '',
          company_picture: item.company?.picture || '',
          price: item.custom_price || item.price,
          delivery_time: item.custom_delivery_time || item.delivery_time,
          delivery_range: {
            min: item.custom_delivery_range?.min || item.delivery_range?.min || item.custom_delivery_time || item.delivery_time,
            max: item.custom_delivery_range?.max || item.delivery_range?.max || item.custom_delivery_time || item.delivery_time,
          },
        }))
      : [];

    return res.status(200).json({ options });
  } catch (error: any) {
    console.error('[API Frete] Erro:', error.message);
    return res.status(500).json({ error: error.message || 'Erro ao calcular frete.' });
  }
}
