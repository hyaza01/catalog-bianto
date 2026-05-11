import { BadRequestException } from '@nestjs/common';
import { URL } from 'node:url';
import { isIP } from 'node:net';

const privatePrefixes = ['127.', '10.', '192.168.', '169.254.', '172.16.', '172.17.', '172.18.', '172.19.', '172.2', '::1'];

function isPrivateIp(hostname: string): boolean {
  if (!isIP(hostname)) {
    return false;
  }

  return privatePrefixes.some((prefix) => hostname.startsWith(prefix));
}

export function validateExternalHttpsImageUrl(value: string, allowedHosts: string[] = []): void {
  let parsed: URL;

  try {
    parsed = new URL(value);
  } catch {
    throw new BadRequestException('URL de imagem invalida.');
  }

  if (parsed.protocol !== 'https:') {
    throw new BadRequestException('A imagem deve usar HTTPS.');
  }

  if (parsed.hostname === 'localhost' || parsed.hostname.endsWith('.local') || isPrivateIp(parsed.hostname)) {
    throw new BadRequestException('Host da imagem nao permitido.');
  }

  if (allowedHosts.length > 0 && !allowedHosts.includes(parsed.hostname)) {
    throw new BadRequestException('Dominio da imagem nao permitido.');
  }
}
