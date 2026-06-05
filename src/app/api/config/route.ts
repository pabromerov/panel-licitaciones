import { NextResponse } from "next/server";

export async function GET() {
  // Devuelve si hay ticket configurado en el servidor
  const hasTicket = !!process.env.MP_TICKET;
  const ticket = process.env.MP_TICKET || "";
  return NextResponse.json({ hasTicket, ticket });
}
