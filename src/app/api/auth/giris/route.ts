import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  istekHttpsMi,
  modYonlendirmeYolu,
  oturumCookieleriniYaz,
  oturumTokenOlustur,
  sifreDogrula,
  varsayilanMod,
} from "@/lib/auth-server";
import { mutlakUrl } from "@/lib/demo-giris";

async function govdeOku(req: Request): Promise<Record<string, unknown> | null> {
  const tur = req.headers.get("content-type") ?? "";
  try {
    if (tur.includes("application/json")) {
      const j = await req.json();
      return j && typeof j === "object" ? (j as Record<string, unknown>) : {};
    }
    const form = await req.formData();
    return Object.fromEntries(form.entries());
  } catch {
    return null;
  }
}

/** Form POST: cookie + 303 yönlendirme. JSON POST: cookie + JSON yanıt. */
export async function POST(req: Request) {
  const https = istekHttpsMi(req);
  const json = (req.headers.get("content-type") ?? "").includes("application/json");
  const govde = await govdeOku(req);
  const hataYanit = (kod: string, durum: number) =>
    json
      ? NextResponse.json({ ok: false, hata: kod }, { status: durum })
      : NextResponse.redirect(mutlakUrl(req, `/giris?hata=${kod}`), 303);
  if (!govde) return hataYanit("eksik", 400);
  const email = String(govde.email ?? "")
    .trim()
    .toLowerCase();
  const sifre = String(govde.sifre ?? "");
  const sonraHam = String(govde.sonra ?? "");
  const sonra =
    sonraHam.startsWith("/") && !sonraHam.startsWith("//") ? sonraHam : "";

  if (!email || !sifre) {
    return hataYanit("eksik", 400);
  }

  const user = await prisma.user.findUnique({
    where: { email },
    include: {
      isletmeler: true,
      zincir: { include: { subeler: true } },
      uyelikler: { include: { isletme: true } },
    },
  });

  if (!user || !(await sifreDogrula(sifre, user.passwordHash))) {
    return hataYanit("gecersiz", 401);
  }

  const mod = varsayilanMod(user);
  if (!mod) {
    return hataYanit("rol", 403);
  }

  const { token, expiresAt } = await oturumTokenOlustur(user.id);
  const hedef = sonra || modYonlendirmeYolu(mod);

  const res = json
    ? NextResponse.json({ ok: true, yonlendir: hedef })
    : NextResponse.redirect(mutlakUrl(req, hedef), 303);
  oturumCookieleriniYaz(res, token, expiresAt, mod, https);
  return res;
}
