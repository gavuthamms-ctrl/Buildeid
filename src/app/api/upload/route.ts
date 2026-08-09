// src/app/api/upload/route.ts
// Receives a PNG blob from the client, stores it, and returns a public URL.
// Uses Vercel Blob when BLOB_READ_WRITE_TOKEN is present.
// Falls back to a base64 data-URL in local dev (no storage needed).
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const maxDuration = 10;

async function storeBlob(buffer: Buffer, filename: string): Promise<string> {
  // Vercel Blob (production)
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    const { put } = await import('@vercel/blob');
    const result = await put(filename, buffer, { access: 'public' });
    return result.url;
  }
  // Local dev fallback: return a data URL (won't work for real OG crawlers, but lets the flow run)
  const base64 = buffer.toString('base64');
  return `data:image/png;base64,${base64}`;
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');
    if (!file || !(file instanceof Blob)) {
      return NextResponse.json({ error: 'No file provided.' }, { status: 400 });
    }
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const filename = `hhgoa-card-${Date.now()}.png`;
    const url = await storeBlob(buffer, filename);
    return NextResponse.json({ url });
  } catch (err) {
    console.error('[upload] error:', err);
    return NextResponse.json({ error: 'Upload failed.' }, { status: 500 });
  }
}
