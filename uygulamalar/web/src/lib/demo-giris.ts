import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  istekHttpsMi,
  modYonlendirmeYolu,
  oturumCookieleriniYaz,
  oturumTokenOlustur,
  varsayilanMod,
} from "@/lib/auth-server";
import type { SofraMod } from "@/lib/mod";

/** Demo hesaplar — şifresiz tek tık giriş (yalnızca bu e-postalar). */
export const DEMO_GIRIS: Record<
  string,
  { email: string; etiket: string; aciklama: string }
> = {
  zincir: {
    email: "zincir@demo.sofra.app",
    etiket: "Tüm şubelerin yöneticisi",
    aciklama: "Cafe Ada — tüm şubeler",
  },
  yonetici: {
    email: "demo@sofra.app",
    etiket: "Şube yönetici",
    aciklama: "Kadıköy şubesi — menü, masalar, stok",
  },
  garson: {
    email: "garson@demo.sofra.app",
    etiket: "Şube garson",
    aciklama: "Sesli sipariş ve dijital adisyon",
  },
  mutfak: {
    email: "mutfak@demo.sofra.app",
    etiket: "Şube mutfak",
    aciklama: "Bekleyen / hazır siparişler",
  },
  platform: {
    email: "admin@sofra.app",
    etiket: "Ana yönetici",
    aciklama: "Sofra platformu — tüm işletmeler",
  },
  musteri: {
    email: "",
    etiket: "Şube müşteri",
    aciklama: "QR menü — giriş yok",
  },
};

export function mutlakUrl(req: Request, yol: string) {
  const xfProto = req.headers.get("x-forwarded-proto")?.split(",")[0]?.trim();
  const host = req.headers.get("x-forwarded-host") ?? req.headers.get("host");
  let proto = xfProto;
  if (host && /\.(lhr\.life|loca\.lt|trycloudflare\.com|localhost\.run)$/i.test(host)) {
    proto = "https";
  }
  if (!proto) {
    try {
      proto = new URL(req.url).protocol.replace(":", "") || "http";
    } catch {
      proto = "http";
    }
  }
  if (proto && host) {
    return new URL(yol, `${proto}://${host}`);
  }
  return new URL(yol, req.url);
}

export async function demoOturumAc(req: Request, rol: string) {
  if (rol === "musteri") {
    return NextResponse.redirect(mutlakUrl(req, "/m/demo?masa=1&siparis=1"), 303);
  }

  const hesap = DEMO_GIRIS[rol];
  if (!hesap?.email) {
    return NextResponse.redirect(mutlakUrl(req, "/giris?hata=rol"), 303);
  }

  const user = await prisma.user.findUnique({
    where: { email: hesap.email },
    include: {
      isletmeler: true,
      zincir: { include: { subeler: true } },
      uyelikler: { include: { isletme: true } },
    },
  });
  if (!user) {
    return NextResponse.redirect(mutlakUrl(req, "/giris?hata=gecersiz"), 303);
  }

  const mod = (varsayilanMod(user) ?? rol) as SofraMod;
  const { token, expiresAt } = await oturumTokenOlustur(user.id);
  const res = NextResponse.redirect(mutlakUrl(req, modYonlendirmeYolu(mod)), 303);
  oturumCookieleriniYaz(res, token, expiresAt, mod, istekHttpsMi(req));
  return res;
}
