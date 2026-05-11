import { createHash } from 'node:crypto';

export function sha256(value: string): string {
  return createHash('sha256').update(value).digest('hex');
}

export function hashIp(ip: string | undefined): string | null {
  if (!ip) {
    return null;
  }

  return sha256(ip);
}
