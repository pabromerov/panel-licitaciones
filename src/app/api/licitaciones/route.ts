import { NextRequest, NextResponse } from "next/server";
import { readFileSync, writeFileSync } from "fs";
import { join } from "path";

const TABLE_PATH = join(process.cwd(), "src/app/api/organismos_region.json");

function loadTable(): Record<string, string> {
  try { return JSON.parse(readFileSync(TABLE_PATH, "utf8")); } catch { return {}; }
}

function saveTable(table: Record<string, string>) {
  try { writeFileSync(TABLE_PATH, JSON.stringify(table, null, 2)); } catch {}
}

async function resolveRegion(prefijo: string, ticket: string, table: Record<string, string>): Promise<string | null> {
  // Buscar una licitación con ese prefijo para obtener su región
  try {
    const url = `https://api.mercadopublico.cl/servicios/v1/publico/licitaciones.json?estado=activas&ticket=${ticket}`;
    const r = await fetch(url, { next: { revalidate: 0 } });
    const d = await r.json();
    const lic = d?.Listado?.find((l: any) => l.CodigoExterno?.startsWith(prefijo + "-"));
    if (!lic) return null;
    // Fetch detalle para obtener región
    const r2 = await fetch(`https://api.mercadopublico.cl/servicios/v1/publico/licitaciones.json?codigo=${lic.CodigoExterno}&ticket=${ticket}`, { next: { revalidate: 0 } });
    const d2 = await r2.json();
    const region = d2?.Listado?.[0]?.Comprador?.RegionUnidad || null;
    if (region) { table[prefijo] = region; saveTable(table); }
    return region;
  } catch { return null; }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const ticket = searchParams.get("ticket") || process.env.MP_TICKET || "";
  const codigo = searchParams.get("codigo");
  const resolveUnknown = searchParams.get("resolveUnknown") === "1";

  if (!ticket) {
    return NextResponse.json({ error: "Ticket no configurado" }, { status: 400 });
  }

  // Fetch de detalle por código específico
  if (codigo) {
    try {
      const r = await fetch(
        `https://api.mercadopublico.cl/servicios/v1/publico/licitaciones.json?codigo=${codigo}&ticket=${ticket}`,
        { headers: { "User-Agent": "Mozilla/5.0" }, next: { revalidate: 0 } }
      );
      const data = await r.json();
      return NextResponse.json(data, { headers: { "Cache-Control": "no-store" } });
    } catch (e: any) {
      return NextResponse.json({ error: e.message }, { status: 500 });
    }
  }

  // Fetch listado activas + enriquecer con región
  try {
    const r = await fetch(
      `https://api.mercadopublico.cl/servicios/v1/publico/licitaciones.json?estado=activas&ticket=${ticket}`,
      { headers: { "User-Agent": "Mozilla/5.0" }, next: { revalidate: 0 } }
    );
    if (!r.ok) return NextResponse.json({ error: `API status ${r.status}` }, { status: r.status });

    const data = await r.json();
    const table = loadTable();
    const desconocidos = new Set<string>();

    // Enriquecer cada licitación con región desde la tabla
    const enriched = (data.Listado || []).map((l: any) => {
      const prefijo = (l.CodigoExterno || "").split("-")[0];
      const region = table[prefijo] || null;
      if (!region) desconocidos.add(prefijo);
      return { ...l, RegionResolved: region };
    });

    // Si hay prefijos desconocidos y se pidió resolver, intentar con detalle (máx 5 por request)
    if (resolveUnknown && desconocidos.size > 0) {
      const toResolve = [...desconocidos].slice(0, 5);
      for (const prefijo of toResolve) {
        const lic = enriched.find((l: any) => l.CodigoExterno?.startsWith(prefijo + "-"));
        if (!lic) continue;
        try {
          const r2 = await fetch(
            `https://api.mercadopublico.cl/servicios/v1/publico/licitaciones.json?codigo=${lic.CodigoExterno}&ticket=${ticket}`,
            { next: { revalidate: 0 } }
          );
          const d2 = await r2.json();
          const region = d2?.Listado?.[0]?.Comprador?.RegionUnidad;
          const fechaPub = d2?.Listado?.[0]?.Fechas?.FechaPublicacion;
          if (region) {
            table[prefijo] = region;
            // Actualizar región Y fecha publicación en todos los items con ese prefijo
            enriched.forEach((l: any) => {
              if (l.CodigoExterno?.startsWith(prefijo + "-")) {
                l.RegionResolved = region;
                if (fechaPub && !l.FechaPublicacion) l.FechaPublicacion = fechaPub;
              }
            });
          }
        } catch {}
      }
      saveTable(table);
    }

    return NextResponse.json(
      { ...data, Listado: enriched, DesconocidosCount: desconocidos.size },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
