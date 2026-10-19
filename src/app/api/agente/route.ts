import { NextRequest, NextResponse } from "next/server";

// Endpoint de uso exclusivo del agente diario (tarea programada de Claude).
// Reenvía consultas a Mercado Público con el MP_TICKET del servidor, para que
// el ticket nunca salga de Vercel. Protegido con la clave AGENTE_KEY
// (variable de entorno en Vercel) enviada en el header "x-agente-key".
//   GET /api/agente?fecha=ddmmaaaa   → licitaciones de esa fecha (todas)
//   GET /api/agente?codigo=XXXX      → detalle completo de una licitación
const MP = "https://api.mercadopublico.cl/servicios/v1/publico/licitaciones.json";

export async function GET(req: NextRequest) {
  const key = process.env.AGENTE_KEY;
  if (!key || req.headers.get("x-agente-key") !== key)
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const ticket = process.env.MP_TICKET;
  if (!ticket) return NextResponse.json({ error: "MP_TICKET no configurado" }, { status: 500 });

  const sp = new URL(req.url).searchParams;
  const fecha = sp.get("fecha");
  const codigo = sp.get("codigo");
  let q = "";
  if (codigo && /^[\w-]+$/.test(codigo)) q = `codigo=${codigo}`;
  else if (fecha && /^\d{8}$/.test(fecha)) q = `fecha=${fecha}`;
  else return NextResponse.json({ error: "Use ?fecha=ddmmaaaa o ?codigo=..." }, { status: 400 });

  try {
    const r = await fetch(`${MP}?${q}&ticket=${ticket}`, {
      headers: { "User-Agent": "Mozilla/5.0" }, cache: "no-store",
    });
    const data = await r.json();
    return NextResponse.json(data, { status: r.status, headers: { "Cache-Control": "no-store" } });
  } catch (e: unknown) {
    return NextResponse.json({ error: e instanceof Error ? e.message : String(e) }, { status: 502 });
  }
}
