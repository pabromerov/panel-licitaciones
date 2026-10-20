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

// ── Correo del reporte (Resend). Se envía solo si existen RESEND_API_KEY y REPORTE_EMAIL en Vercel.
const fmtM = (n: unknown) => (n ? "$ " + Number(n).toLocaleString("es-CL") : "Ver bases");
const fmtF = (s: unknown) => (s ? String(s).slice(0, 10).split("-").reverse().join("/") : "—");
const fmtFH = (s: unknown) => { if (!s) return "No informada"; const t = String(s); const h = t.slice(11, 16); return fmtF(t) + (h && h !== "00:00" ? " " + h : ""); };
const ventanaTxt = (v: any) => !v ? "" : v.desde === v.hasta ? `Publicadas el ${fmtF(v.desde)}` : `Publicadas entre ${fmtF(v.desde)} y ${fmtF(v.hasta)}`;
const esc = (s: unknown) => String(s ?? "").replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c] as string));

async function enviarCorreo(rep: any) {
  const key = process.env.RESEND_API_KEY, to = process.env.REPORTE_EMAIL;
  if (!key || !to) return "sin configurar";
  const orden: Record<string, number> = { SI: 0, CONDICIONADO: 1, NO: 2 };
  const lics = [...(rep.licitaciones || [])].sort((a: any, b: any) =>
    ((orden[a.recomendacion] ?? 3) - (orden[b.recomendacion] ?? 3)) || String(a.cierre).localeCompare(String(b.cierre)));
  const color: Record<string, string> = { SI: "#3B6D11", CONDICIONADO: "#854F0B", NO: "#A32D2D" };
  const filas = lics.map((l: any) => `<tr><td style="padding:8px;border-bottom:1px solid #eee;vertical-align:top"><b style="color:${color[l.recomendacion] || "#333"}">${esc(l.recomendacion)}</b></td>
    <td style="padding:8px;border-bottom:1px solid #eee"><a href="https://www.mercadopublico.cl/Procurement/Modules/RFB/DetailsAcquisition.aspx?idlicitacion=${esc(l.codigo)}">${esc(l.codigo)}</a><br><b>${esc(l.nombre)}</b><br><span style="color:#666">${esc(l.organismo)}</span><br>${esc(l.justificacion)}</td>
    <td style="padding:8px;border-bottom:1px solid #eee;white-space:nowrap;vertical-align:top"><b>${fmtM(l.monto)}</b><br>Publicada: ${fmtF(l.publicacion)}<br>Preguntas hasta: ${fmtFH(l.preguntas_hasta)}<br>Cierre: ${fmtFH(l.cierre)}</td></tr>`).join("");
  const r = rep.resumen || {};
  const html = `<div style="font-family:Arial,sans-serif;font-size:14px;color:#222">
    <h2 style="margin:0 0 4px">Licitaciones CMPV — ${fmtF(rep.fecha)}</h2>
    <p style="margin:0 0 12px;color:#666">${ventanaTxt(rep.ventana)} · Revisadas ${r.revisadas ?? "—"} · Relevantes ${lics.length} · SÍ ${r.si ?? 0} · Condicionado ${r.condicionado ?? 0}</p>
    ${rep.nota ? `<p style="background:#E6F1FB;padding:8px;border-radius:6px">${esc(rep.nota)}</p>` : ""}
    ${lics.length ? `<table style="border-collapse:collapse;width:100%">${filas}</table>` : "<p>Sin licitaciones relevantes en esta ventana.</p>"}
    <p style="margin-top:16px"><a href="https://panel-licitaciones.vercel.app">Abrir el panel → pestaña "Reporte del día"</a></p></div>`;
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST", headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from: process.env.REPORTE_FROM || "Licitaciones CMPV <onboarding@resend.dev>",
      to: to.split(",").map(s => s.trim()), subject: `Licitaciones CMPV ${fmtF(rep.fecha)}: ${lics.length} relevante(s)`, html }),
  });
  return res.ok ? "enviado" : `error ${res.status}: ${(await res.text()).slice(0, 200)}`;
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
    let correo = "no solicitado";
    if (new URL(req.url).searchParams.get("correo") !== "0") {
      try { correo = await enviarCorreo(rep); } catch (e: unknown) { correo = "error: " + (e instanceof Error ? e.message : String(e)); }
    }
    return NextResponse.json({ ok: true, correo });
  } catch (e: unknown) {
    return NextResponse.json({ error: e instanceof Error ? e.message : String(e) }, { status: 500 });
  }
}
