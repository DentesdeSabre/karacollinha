import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getAuthorizationUrl, exchangeCodeForToken } from './auth';

const REDIRECT_URI = process.env.MELHOR_ENVIO_REDIRECT_URI || '';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { code } = req.query;

  if (!code) {
    const redirectUri = REDIRECT_URI || `${req.headers.origin || 'https://karacollinha.vercel.app'}/api/melhor-envio/callback`;
    const authUrl = getAuthorizationUrl(redirectUri);
    return res.redirect(authUrl);
  }

  try {
    const redirectUri = REDIRECT_URI || `${req.headers.origin || 'https://karacollinha.vercel.app'}/api/melhor-envio/callback`;
    const tokenData = await exchangeCodeForToken(code as string, redirectUri);

    return res.status(200).send(`
      <!DOCTYPE html>
      <html>
        <head><title>Autorização Melhor Envio</title></head>
        <body style="font-family: sans-serif; text-align: center; padding: 3rem;">
          <h1>Autorização realizada com sucesso!</h1>
          <p>Configure as seguintes variáveis de ambiente no painel da Vercel:</p>
          <pre style="background: #f4f4f4; padding: 1rem; border-radius: 8px; text-align: left; max-width: 600px; margin: 1rem auto;">
MELHOR_ENVIO_ACCESS_TOKEN=${tokenData.access_token}
MELHOR_ENVIO_REFRESH_TOKEN=${tokenData.refresh_token}
MELHOR_ENVIO_TOKEN_EXPIRES_AT=${Date.now() + (tokenData.expires_in * 1000)}
          </pre>
          <p style="color: #666;">Copie e salve esses valores como Environment Variables na Vercel.</p>
          <p style="color: #666;">Depois, acesse <a href="/">a loja</a>.</p>
        </body>
      </html>
    `);
  } catch (error: any) {
    return res.status(500).send(`
      <!DOCTYPE html>
      <html>
        <head><title>Erro de Autorização</title></head>
        <body style="font-family: sans-serif; text-align: center; padding: 3rem;">
          <h1>Erro na autorização</h1>
          <p>${error.message}</p>
          <p>Tente novamente.</p>
        </body>
      </html>
    `);
  }
}
