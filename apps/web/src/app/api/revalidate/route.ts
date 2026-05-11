import { revalidatePath, revalidateTag } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';
import env from '@/config/env';

type RevalidatePayload = {
  source?: string;
  cacheTag?: string;
  tags?: string[];
  paths?: string[];
};

export async function POST(request: NextRequest): Promise<NextResponse> {
  const secret = request.headers.get('x-revalidate-secret');

  if (secret !== env.revalidationSecret) {
    return NextResponse.json({ success: false, message: 'Nao autorizado.' }, { status: 401 });
  }

  const payload = (await request.json()) as RevalidatePayload;
  const tags = payload.tags ?? (payload.cacheTag ? [payload.cacheTag] : []);
  const paths = payload.paths ?? ['/'];

  tags.forEach((tag) => revalidateTag(tag, 'max'));
  paths.forEach((path) => revalidatePath(path));

  return NextResponse.json({ success: true, source: payload.source ?? 'manual' });
}
