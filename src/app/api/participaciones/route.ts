import { NextRequest, NextResponse } from "next/server";
import { kv } from "@vercel/kv";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const rut = searchParams.get("rut");
  if (!rut) return NextResponse.json({ data: {} });
  try {
    const data = await kv.get<Record<string, unknown>>(`parts:${rut}`);
    return NextResponse.json({ data: data || {} });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ data: {}, error: msg });
  }
}

export async function POST(request: NextRequest) {
  const { rut, data } = await request.json();
  if (!rut) return NextResponse.json({ error: "Falta rut" }, { status: 400 });
  try {
    await kv.set(`parts:${rut}`, data);
    return NextResponse.json({ ok: true });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
