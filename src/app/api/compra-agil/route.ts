import { NextRequest, NextResponse } from "next/server";

// API de Compra Ágil v2 (Beta) de ChileCompra, lanzada en mayo 2026. A
// diferencia de la API de licitaciones, esta requiere el ticket como HEADER
// HTTP ("ticket: TU_TICKET"), no como query param. Confirmado en esta sesión
// que el mismo MP_TICKET que ya usamos para licitaciones funciona aquí.
const BASE = "https://api2.mercadopublico.cl";

// Regiones donde operan SANASALUD y filiales: RM=13, Valparaíso=5, O'Higgins=6
// (códigos numéricos de la API, no nombres — ver documentación §Grupo 4).
const REGIONES = "13,5,6";

// Compra Ágil es de bajo monto y muy alto volumen (~10.000 resultados solo en
// RM, sin ningún filtro de palabra clave) — a diferencia de licitaciones, NO
// se puede traer todo y filtrar después. Por eso se le pide a la propia API
// que filtre por palabra clave (parámetro q), una llamada por término.
//
// Lista curada a mano (no viene de ESPS.terms) porque Compra Ágil tiende a ser
// compras específicas de examenes/equipos puntuales, no servicios amplios
// ("medicina general", "atención médica", etc. traerían demasiado ruido no
// clínico: sillas de ruedas, banderas de escritorio, cursos de capacitación).
const TERMINOS: { termino: string; categoria: string }[] = [
    { termino: "holter", categoria: "Cardiología" },
    { termino: "test de esfuerzo", categoria: "Cardiología" },
    { termino: "ecocardio", categoria: "Cardiología" },
    { termino: "transvaginal", categoria: "Ecografía Ginecológica" },
    { termino: "doppler", categoria: "Ecografía Ginecológica" },
    { termino: "ecografia", categoria: "Imagenología" },
    { termino: "mamografia", categoria: "Imagenología" },
    { termino: "scanner", categoria: "Imagenología" },
    { termino: "resonancia", categoria: "Imagenología" },
    { termino: "rayos x", categoria: "Imagenología" },
    { termino: "endoscopia", categoria: "Endoscopía/Colonoscopía" },
    { termino: "colonoscopia", categoria: "Endoscopía/Colonoscopía" },
    { termino: "otorrino", categoria: "Otorrinolaringología" },
];

// Solo "publicada" (vigente, abierta a cotización). Se excluyen a propósito
// cerrada/desierta/cancelada/proveedor_seleccionado: son historial, no
// oportunidades vigentes, y su inclusión fue lo que causaba que aparecieran
// compras ágiles de 2025 ya resueltas hace tiempo en el panel.
const ESTADOS = "publicada";

// Tope de seguridad por término (50 x 5 = 250 resultados máx). Compra Ágil
// filtrada por una palabra clave específica de examen/equipo debería dar
// muchos menos resultados que esto; el tope es solo para evitar loops largos
// si algún término resulta ser más genérico de lo esperado.
const MAX_PAGINAS_POR_TERMINO = 5;

// "proveedor_seleccionado" se mapea a "adjudicada" para que el panel no
// necesite dos etiquetas distintas para lo mismo.
function mapEstado(codigo: string | undefined): string {
    if (!codigo) return "publicada";
    return codigo === "proveedor_seleccionado" ? "adjudicada" : codigo;
}

async function buscarTermino(ticket: string, termino: string): Promise<any[]> {
    const items: any[] = [];
    let pagina = 1;
    while (pagina <= MAX_PAGINAS_POR_TERMINO) {
        const url = `${BASE}/v2/compra-agil?region=${REGIONES}&estado=${ESTADOS}&q=${encodeURIComponent(termino)}&tamano_pagina=50&numero_pagina=${pagina}`;
        const r = await fetch(url, { headers: { ticket }, next: { revalidate: 0 } });
        if (!r.ok) break;
        const d = await r.json();
        if (d?.success !== "OK" || !d?.payload) break;
        items.push(...(d.payload.items || []));
        const paginacion = d.payload.paginacion || {};
        if (!paginacion.total_paginas || paginacion.numero_pagina >= paginacion.total_paginas) break;
        pagina++;
    }
    return items;
}

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const ticket = searchParams.get("ticket") || process.env.MP_TICKET || "";

    if (!ticket) {
        return NextResponse.json({ error: "Ticket no configurado" }, { status: 400 });
    }

    try {
        const vistos = new Map<string, any>();
        const erroresPorTermino: string[] = [];

        for (const { termino, categoria } of TERMINOS) {
            let raw: any[] = [];
            try {
                raw = await buscarTermino(ticket, termino);
            } catch (e: any) {
                erroresPorTermino.push(`${termino}: ${e.message}`);
                continue;
            }
            for (const item of raw) {
                if (vistos.has(item.codigo)) continue; // ya capturado por otro término
                // Filtro de seguridad: aunque se pidió estado=publicada, se descarta
                // igual cualquier registro cuyo cierre ya haya pasado (por si la
                // plataforma tarda en actualizar el estado a "cerrada").
                const cierreRaw = item.fechas?.fecha_cierre;
                if (cierreRaw) {
                    const cierreDate = new Date(cierreRaw.replace(" ", "T"));
                    if (!isNaN(cierreDate.getTime()) && cierreDate < new Date()) continue;
                }
                vistos.set(item.codigo, {
                    id: item.codigo,
                    nombre: (item.nombre || "").trim(),
                    organismo: item.institucion?.organismo_comprador || "",
                    monto: item.montos?.monto_disponible_clp ?? null,
                    publicacion: (item.fechas?.fecha_publicacion || "").split(" ")[0] || null,
                    // La API devuelve "2026-08-20 12:00" (espacio, no "T"). Se normaliza
                    // a formato con "T" para que dias()/fmtD() en el panel lo procesen
                    // igual que las fechas de licitaciones.
                    cierre: (item.fechas?.fecha_cierre || "").replace(" ", "T"),
                    estado: mapEstado(item.estado?.codigo),
                    categoria,
                    region: item.institucion?.nombre_region || null,
                    // La API de listado no trae descripción larga ni items — eso vive en
                    // el endpoint de detalle (GET /v2/compra-agil/{codigo}). No se pide
                    // aquí para no multiplicar las llamadas; se puede agregar más
                    // adelante como enriquecimiento on-demand al abrir el detalle.
                    descripcion: "",
                    items: [],
                });
            }
        }

        const resultado = [...vistos.values()];
        return NextResponse.json(
            { Listado: resultado, Cantidad: resultado.length, Errores: erroresPorTermino },
            { headers: { "Cache-Control": "no-store" } }
        );
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
