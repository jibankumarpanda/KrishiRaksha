// Next.js API Route Proxy for farmer endpoints (dashboard, predict-yield)
import { NextRequest, NextResponse } from 'next/server';

// Prefer explicit backend URL for local dev; default to hosted backend if not provided
const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export async function GET(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  try {
    const { path: pathArray } = await params;
    const path = pathArray.join('/');
    const authHeader = request.headers.get('authorization');

    const response = await fetch(`${BACKEND_URL}/api/farmers/${path}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(authHeader && { Authorization: authHeader }),
      },
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error: any) {
    console.error('Farmer proxy GET error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const { path: pathArray } = await params;
    const path = pathArray.join('/');
    const authHeader = request.headers.get('authorization');

    const bodyText = await request.text();
    const backendUrl = `${BACKEND_URL}/api/farmers/${path}`;

    console.log(`[Farmer Proxy] POST ${backendUrl}`);
    console.log(`[Farmer Proxy] Path segments:`, pathArray);
    console.log(`[Farmer Proxy] Full path:`, path);

    const response = await fetch(backendUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(authHeader && { Authorization: authHeader }),
      },
      body: bodyText || '{}',
    });

    console.log(`[Farmer Proxy] Response status:`, response.status);
    console.log(`[Farmer Proxy] Response URL:`, response.url);

    let data;
    try {
      data = await response.json();
    } catch (e) {
      const text = await response.text();
      console.error('[Farmer Proxy] Failed to parse response:', text);
      data = { error: 'Failed to parse response', rawResponse: text };
    }

    if (!response.ok) {
      console.error('[Farmer Proxy] Error response:', data);
    }

    return NextResponse.json(data, { status: response.status });
  } catch (error: any) {
    console.error('[Farmer Proxy] POST error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

