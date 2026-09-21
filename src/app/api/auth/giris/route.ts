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

/** Klasik form POST — cookie Set-Cookie + 303 redirect. */
export async function POST(req: Request) {
  const https = istekHttpsMi(req);
  const form = await req.formData();
  const email = String(form.get("email") ?? "")
    .trim()
    .toLowerCase();
  const sifre = String(form.get("sifre") ?? "");
  const sonraHam = String(form.get("sonra") ?? "");
  const sonra =
    sonraHam.startsWith("/") && !sonraHam.startsWith("//") ? sonraHam : "";

  if (!email || !sifre) {
    return NextResponse.redirect(mutlakUrl(req, "/giris?hata=eksik"), 303);
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
    return NextResponse.redirect(mutlakUrl(req, "/giris?hata=gecersiz"), 303);
  }

  const mod = varsayilanMod(user);
  if (!mod) {
    return NextResponse.redirect(mutlakUrl(req, "/giris?hata=rol"), 303);
  }

  const { token, expiresAt } = await oturumTokenOlustur(user.id);
  const hedef = sonra || modYonlendirmeYolu(mod);

  const res = NextResponse.redirect(mutlakUrl(req, hedef), 303);
  oturumCookieleriniYaz(res, token, expiresAt, mod, https);
  return res;
}
