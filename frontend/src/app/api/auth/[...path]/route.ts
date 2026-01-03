// Next.js API Route Proxy to bypass CORS issues
// This forwards all /api/auth/* requests to the backend

import { NextRequest, NextResponse } from 'next/server';

// Prefer explicit backend URL for local/dev usage; default to hosted backend if not provided
const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const { path: pathArray } = await params;
    const path = pathArray.join('/');
    
    // Get the raw body as text first, then parse
    const bodyText = await request.text();
    let body = {};
    if (bodyText) {
      try {
        body = JSON.parse(bodyText);
      } catch (e) {
        // If JSON parsing fails, body stays as empty object
        console.error('Failed to parse request body:', e);
      }
    }
    
    // Get auth token from request headers if present
    const authHeader = request.headers.get('authorization');
    
    // Forward request to backend
    const response = await fetch(`${BACKEND_URL}/api/auth/${path}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(authHeader && { Authorization: authHeader }),
      },
      body: bodyText || JSON.stringify(body),
    });

    // Get response data
    let data;
    try {
      const responseText = await response.text();
      data = responseText ? JSON.parse(responseText) : {};
    } catch (e) {
      data = { error: 'Failed to parse response', rawResponse: await response.text() };
    }

    return NextResponse.json(data, { status: response.status });
  } catch (error: any) {
    console.error('API proxy error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const { path: pathArray } = await params;
    const path = pathArray.join('/');
    
    // Get auth token from request headers if present
    const authHeader = request.headers.get('authorization');
    
    const response = await fetch(`${BACKEND_URL}/api/auth/${path}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(authHeader && { Authorization: authHeader }),
      },
    });

    const data = await response.json();

    return NextResponse.json(data, { status: response.status });
  } catch (error: any) {
    console.error('API proxy error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
