import crypto from 'crypto';

export function timingSafeCompare(a: string, b: string): boolean {
  if (typeof a !== 'string' || typeof b !== 'string') {
    return false;
  }

  const aBuffer = Buffer.from(a);
  const bBuffer = Buffer.from(b);

  if (aBuffer.length !== bBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(aBuffer, bBuffer);
}

export function verifyCronAuthorization(request: Request): boolean {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) {
    // If no cron secret configured, prevent unauthenticated execution in production
    return process.env.NODE_ENV === 'development';
  }

  const authHeader = request.headers.get('authorization') || '';
  const bearerToken = authHeader.startsWith('Bearer ') ? authHeader.substring(7) : '';
  const customHeader = request.headers.get('x-cron-secret') || '';

  const tokenToVerify = bearerToken || customHeader;
  return timingSafeCompare(tokenToVerify, cronSecret);
}

export function sanitizeText(text: string): string {
  if (!text) return '';
  return text
    .replace(/[<>]/g, '') // strip dangerous angle brackets
    .trim();
}
