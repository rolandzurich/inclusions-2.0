import { NextRequest, NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const apiKey = process.env.GEMINI_API_KEY;
  
  return NextResponse.json({
    keyExists: !!apiKey,
    keyLength: apiKey?.length || 0,
    keyPrefix: apiKey ? `${apiKey.substring(0, 10)}...` : 'N/A',
    envKeys: Object.keys(process.env).filter(k => k.includes('GEMINI')).length > 0
  });
}
