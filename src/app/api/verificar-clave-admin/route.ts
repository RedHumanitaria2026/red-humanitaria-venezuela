import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const { clave } = body as { clave?: string };

  const claveValida = process.env.ADMIN_CENTRO_REGISTRATION_KEY;

  if (!claveValida || !clave || clave !== claveValida) {
    return NextResponse.json({ valida: false }, { status: 401 });
  }

  return NextResponse.json({ valida: true });
}
