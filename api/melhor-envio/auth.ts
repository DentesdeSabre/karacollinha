const MELHOR_ENVIO_BASE = 'https://melhorenvio.com.br';
const MELHOR_ENVIO_SANDBOX = 'https://sandbox.melhorenvio.com.br';

const isSandbox = () => process.env.MELHOR_ENVIO_SANDBOX === 'true';
const baseUrl = () => isSandbox() ? MELHOR_ENVIO_SANDBOX : MELHOR_ENVIO_BASE;

let cachedToken: { access_token: string; expires_at: number } | null = null;

export function getAuthorizationUrl(redirectUri: string): string {
  const clientId = process.env.MELHOR_ENVIO_CLIENT_ID;
  const scopes = 'shipping-calculate';
  return `${baseUrl()}/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${scopes}`;
}

export async function exchangeCodeForToken(code: string, redirectUri: string) {
  const clientId = process.env.MELHOR_ENVIO_CLIENT_ID;
  const clientSecret = process.env.MELHOR_ENVIO_CLIENT_SECRET;

  const response = await fetch(`${baseUrl()}/oauth/token`, {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'User-Agent': 'KaracolLinha (suporte@karacollinha.com.br)',
    },
    body: JSON.stringify({
      grant_type: 'authorization_code',
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      code,
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error_description || 'Falha ao obter token');
  }

  return response.json();
}

export async function refreshAccessToken(refreshToken: string) {
  const clientId = process.env.MELHOR_ENVIO_CLIENT_ID;
  const clientSecret = process.env.MELHOR_ENVIO_CLIENT_SECRET;

  const response = await fetch(`${baseUrl()}/oauth/token`, {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'User-Agent': 'KaracolLinha (suporte@karacollinha.com.br)',
    },
    body: JSON.stringify({
      grant_type: 'refresh_token',
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error_description || 'Falha ao renovar token');
  }

  return response.json();
}

export async function getAccessToken(): Promise<string> {
  if (cachedToken && Date.now() < cachedToken.expires_at) {
    return cachedToken.access_token;
  }

  const token = process.env.MELHOR_ENVIO_ACCESS_TOKEN;
  const refreshToken = process.env.MELHOR_ENVIO_REFRESH_TOKEN;
  const expiresAt = parseInt(process.env.MELHOR_ENVIO_TOKEN_EXPIRES_AT || '0', 10);

  if (token && Date.now() < expiresAt) {
    cachedToken = { access_token: token, expires_at: expiresAt };
    return token;
  }

  if (refreshToken) {
    const refreshed = await refreshAccessToken(refreshToken);
    const newExpiresAt = Date.now() + (refreshed.expires_in * 1000) - 60000;
    cachedToken = { access_token: refreshed.access_token, expires_at: newExpiresAt };
    console.log('[Melhor Envio] Token renovado. Atualize as env vars MELHOR_ENVIO_ACCESS_TOKEN e MELHOR_ENVIO_REFRESH_TOKEN na Vercel.');
    return refreshed.access_token;
  }

  throw new Error('Token do Melhor Envio não configurado. Execute o fluxo de autorização primeiro.');
}

export async function calculateShipping(payload: {
  from: { postal_code: string };
  to: { postal_code: string };
  products: Array<{
    id: string;
    width: number;
    height: number;
    length: number;
    weight: number;
    insurance_value: number;
    quantity: number;
  }>;
  options?: { receipt?: boolean; own_hand?: boolean };
  services?: string;
}) {
  const token = await getAccessToken();

  const response = await fetch(`${baseUrl()}/api/v2/me/shipment/calculate`, {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      'User-Agent': 'KaracolLinha (suporte@karacollinha.com.br)',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    console.error('[Melhor Envio] Erro na cotação:', response.status, err);
    throw new Error(err.message || `Erro na cotação (${response.status})`);
  }

  return response.json();
}
