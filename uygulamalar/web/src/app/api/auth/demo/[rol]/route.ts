import { demoOturumAc } from "@/lib/demo-giris";

type Params = { params: Promise<{ rol: string }> };

/** Şifresiz demo giriş — tek tık / bağlantı. */
export async function GET(req: Request, { params }: Params) {
  const { rol } = await params;
  return demoOturumAc(req, rol.toLowerCase());
}

export async function POST(req: Request, { params }: Params) {
  const { rol } = await params;
  return demoOturumAc(req, rol.toLowerCase());
}
