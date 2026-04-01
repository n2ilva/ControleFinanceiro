import { Request, Response, NextFunction } from 'express';

/**
 * Middleware de autenticação por API Key.
 * A chave deve ser enviada no header: x-api-key
 * Configure a variável de ambiente API_KEY no .env
 */
export const apiKeyAuth = (req: Request, res: Response, next: NextFunction): void => {
  const apiKey = process.env.API_KEY;

  // Se não há API_KEY configurada, permite acesso (dev mode)
  if (!apiKey) {
    console.warn('⚠️  API_KEY não configurada! API aberta para qualquer requisição.');
    next();
    return;
  }

  const requestKey = req.headers['x-api-key'] as string;

  if (!requestKey || requestKey !== apiKey) {
    res.status(401).json({
      error: 'Não autorizado',
      message: 'API Key inválida ou ausente. Envie no header: x-api-key',
    });
    return;
  }

  next();
};
