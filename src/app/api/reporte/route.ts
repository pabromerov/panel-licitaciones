import { NextRequest, NextResponse } from "next/server";
import { kv } from "@vercel/kv";

// Reporte diario de licitaciones generado por el agente.
//   GET  /api/reporte              → último reporte
//   GET  /api/reporte?fecha=AAAA-MM-DD → reporte de esa fecha
//   GET  /api/reporte?lista=1      → fechas disponibles (últimas 30)
//   POST /api/reporte (header x-agente-key) → guarda reporte { fecha, ... }
export async function GET(req: NextRequest) {
  const sp = new URL(req.url).searchParams;
  try {
    if (sp.get("lista")) {
      const fechas = (await kv.get<string[]>("reporte:fechas")) || [];
      return NextResponse.json({ fechas });
    }
    const fecha = sp.get("fecha");
    const rep = await kv.get(fecha ? `reporte:${fecha}` : "reporte:ultimo");
    return NextResponse.json({ reporte: rep || null }, { headers: { "Cache-Control": "no-store" } });
  } catch (e: unknown) {
    return NextResponse.json({ reporte: null, error: e instanceof Error ? e.message : String(e) });
  }
}

export async function POST(req: NextRequest) {
  const key = process.env.AGENTE_KEY;
  if (!key || req.headers.get("x-agente-key") !== key)
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const rep = await req.json();
  if (!rep?.fecha || !/^\d{4}-\d{2}-\d{2}$/.test(rep.fecha) || !Array.isArray(rep.licitaciones))
    return NextResponse.json({ error: "Formato inválido: requiere fecha AAAA-MM-DD y licitaciones[]" }, { status: 400 });
  try {
    await kv.set(`reporte:${rep.fecha}`, rep);
    await kv.set("reporte:ultimo", rep);
    const fechas = ((await kv.get<string[]>("reporte:fechas")) || []).filter(f => f !== rep.fecha);
    await kv.set("reporte:fechas", [rep.fecha, ...fechas].slice(0, 30));
    return NextResponse.json({ ok: true });
  } catch (e: unknown) {
    return NextResponse.json({ error: e instanceof Error ? e.message : String(e) }, { status: 500 });
  }
}
