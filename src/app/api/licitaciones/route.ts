import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const ticket = searchParams.get("ticket") || process.env.MP_TICKET || "";
  const codigo = searchParams.get("codigo");
  const region = searchParams.get("region"); // código numérico directo: 13, 5, 6

  if (!ticket) {
    return NextResponse.json({ error: "Ticket no configurado" }, { status: 400 });
  }

  let url = `https://api.mercadopublico.cl/servicios/v1/publico/licitaciones.json?ticket=${ticket}`;
  if (codigo) {
    url += `&codigo=${codigo}`;
  } else {
    url += `&estado=activas`;
    if (region) {
      url += `&region=${region}`;
    }
  }

  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; PanelLicitaciones/1.0)",
        "Accept": "application/json",
      },
      next: { revalidate: 0 },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: `API respondió con status ${response.status}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data, {
      headers: { "Access-Control-Allow-Origin": "*", "Cache-Control": "no-store" },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Error conectando con Mercado Público: " + error.message },
      { status: 500 }
    );
  }
}
