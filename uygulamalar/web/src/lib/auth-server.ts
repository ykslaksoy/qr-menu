import { cookies } from "next/headers";
import type { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import type { Isletme } from "@/lib/store";
import {
  MOD_COOKIE,
  MOD_ANA_YOL,
  type SofraMod,
  modGecerliMi,
} from "@/lib/mod";

const COOKIE = "sofra_session";
const IMPERSONATE_COOKIE = "sofra_impersonate";
const SUBE_COOKIE = "sofra_sube";
const GUN = 30;

function cookieSecure(zorla?: boolean) {
  if (zorla === true) return true;
  if (zorla === false) return false;
  if (process.env.NODE_ENV === "production") return true;
  if (process.env.SOFRA_COOKIE_SECURE === "1") return true;
  return false;
}

function cookieOpts(expiresAt: Date, secure?: boolean) {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: cookieSecure(secure),
    path: "/",
    expires: expiresAt,
  };
}

export function istekHttpsMi(req: Request) {
  const host = req.headers.get("x-forwarded-host") ?? req.headers.get("host") ?? "";
  if (/\.(lhr\.life|loca\.lt|trycloudflare\.com|localhost\.run)$/i.test(host)) {
    return true;
  }
  const proto = req.headers.get("x-forwarded-proto");
  if (proto) return proto.split(",")[0]?.trim() === "https";
  try {
    return new URL(req.url).protocol === "https:";
  } catch {
    return false;
  }
}

function tokenUret() {
  return crypto.randomUUID() + crypto.randomUUID();
}

export async function sifreHash(sifre: string) {
  return bcrypt.hash(sifre, 10);
}

export async function sifreDogrula(sifre: string, hash: string) {
  return bcrypt.compare(sifre, hash);
}

export function platformAdminMi(user: { platformAdmin?: boolean } | null) {
  return Boolean(user?.platformAdmin);
}

export async function oturumTokenOlustur(userId: string) {
  const token = tokenUret();
  const expiresAt = new Date(Date.now() + GUN * 86400000);
  await prisma.session.create({ data: { token, userId, expiresAt } });
  return { token, expiresAt };
}

/** Cookie'leri Response üzerine yaz — form redirect için güvenilir yol. */
export function oturumCookieleriniYaz(
  res: NextResponse,
  token: string,
  expiresAt: Date,
  mod: SofraMod,
  secure?: boolean,
) {
  const opts = cookieOpts(expiresAt, secure);
  res.cookies.set(COOKIE, token, opts);
  res.cookies.set(MOD_COOKIE, mod, opts);
  // Eski şube / impersonate kalıntısını temizle
  res.cookies.set(IMPERSONATE_COOKIE, "", { ...opts, expires: new Date(0) });
  res.cookies.set(SUBE_COOKIE, "", { ...opts, expires: new Date(0) });
}

export async function oturumAc(userId: string, mod?: SofraMod, secure?: boolean) {
  const { token, expiresAt } = await oturumTokenOlustur(userId);
  const jar = await cookies();
  jar.set(COOKIE, token, cookieOpts(expiresAt, secure));
  if (mod) await modKaydet(mod, secure);
  return token;
}

export async function oturumKapat() {
  const jar = await cookies();
  const token = jar.get(COOKIE)?.value;
  if (token) {
    await prisma.session.deleteMany({ where: { token } });
    jar.delete(COOKIE);
  }
  jar.delete(IMPERSONATE_COOKIE);
  jar.delete(SUBE_COOKIE);
  jar.delete(MOD_COOKIE);
}

const kullaniciInclude = {
  isletmeler: true,
  zincir: { include: { subeler: true } },
  uyelikler: { include: { isletme: true } },
} as const;

export async function mevcutKullanici() {
  const jar = await cookies();
  const token = jar.get(COOKIE)?.value;
  if (!token) return null;

  const oturum = await prisma.session.findUnique({
    where: { token },
    include: {
      user: { include: kullaniciInclude },
    },
  });

  if (!oturum || oturum.expiresAt < new Date()) {
    if (oturum) await prisma.session.delete({ where: { id: oturum.id } });
    return null;
  }

  return oturum.user;
}

export async function impersonateSlugOku() {
  const jar = await cookies();
  return jar.get(IMPERSONATE_COOKIE)?.value ?? null;
}

export async function impersonateBaslat(slug: string, secure?: boolean) {
  const jar = await cookies();
  const expiresAt = new Date(Date.now() + GUN * 86400000);
  jar.set(IMPERSONATE_COOKIE, slug, cookieOpts(expiresAt, secure));
}

export async function impersonateBitir() {
  const jar = await cookies();
  jar.delete(IMPERSONATE_COOKIE);
}

export async function aktifSubeSlugOku() {
  const jar = await cookies();
  return jar.get(SUBE_COOKIE)?.value ?? null;
}

export async function aktifSubeBaslat(slug: string, secure?: boolean) {
  const jar = await cookies();
  const expiresAt = new Date(Date.now() + GUN * 86400000);
  jar.set(SUBE_COOKIE, slug, cookieOpts(expiresAt, secure));
}

export async function aktifSubeBitir() {
  const jar = await cookies();
  jar.delete(SUBE_COOKIE);
}

export type EfektifIsletmeSonuc = {
  kayit: {
    id: string;
    slug: string;
    kafeAdi: string;
    veri: string;
    userId: string;
    zincirId: string | null;
  };
  isletme: Isletme;
  impersonating: boolean;
  impersonateSlug: string | null;
  /** Zincir yöneticisi şubeye girdi */
  subeden: boolean;
};

export async function modOku(): Promise<SofraMod | null> {
  const jar = await cookies();
  const deger = jar.get(MOD_COOKIE)?.value;
  return modGecerliMi(deger) ? deger : null;
}

export async function modKaydet(mod: SofraMod, secure?: boolean) {
  const jar = await cookies();
  const expiresAt = new Date(Date.now() + GUN * 86400000);
  jar.set(MOD_COOKIE, mod, cookieOpts(expiresAt, secure));
}

type ModKullanici = NonNullable<Awaited<ReturnType<typeof mevcutKullanici>>>;

export function kullaniciZincirMi(user: ModKullanici) {
  return Boolean(user.zincir);
}

/** Kullanıcının varsayılan modu (cookie yoksa). */
export function varsayilanMod(user: ModKullanici): SofraMod | null {
  if (platformAdminMi(user)) return "platform";
  if (user.zincir) return "zincir";
  if (user.isletmeler.length > 0) return "yonetici";
  const uyelik = user.uyelikler[0];
  if (!uyelik) return null;
  if (uyelik.rol === "GARSON") return "garson";
  if (uyelik.rol === "MUTFAK") return "mutfak";
  if (uyelik.rol === "YONETICI") return "yonetici";
  return null;
}

/** Geçerli oturum modu — impersonation / şube girişi yönetici sayılır. */
export async function efektifMod(user: ModKullanici | null): Promise<SofraMod | null> {
  if (!user) return null;
  const impersonateSlug = await impersonateSlugOku();
  if (impersonateSlug && platformAdminMi(user)) return "yonetici";

  const subeSlug = await aktifSubeSlugOku();
  if (subeSlug && user.zincir) {
    const cookieMod = await modOku();
    if (cookieMod === "garson" || cookieMod === "mutfak" || cookieMod === "yonetici") {
      return cookieMod;
    }
    return "yonetici";
  }

  const cookieMod = await modOku();
  const varsayilan = varsayilanMod(user);
  if (!varsayilan) return null;

  if (cookieMod) {
    if (varsayilan === "platform" && cookieMod === "platform") return "platform";
    if (varsayilan === "platform" && cookieMod === "yonetici") return "yonetici";
    if (varsayilan === "zincir") {
      if (cookieMod === "zincir") return "zincir";
      if (cookieMod === "yonetici" || cookieMod === "garson" || cookieMod === "mutfak") {
        return subeSlug ? cookieMod : "zincir";
      }
      return "zincir";
    }
    if (varsayilan === "yonetici") {
      return cookieMod === "garson" || cookieMod === "mutfak" || cookieMod === "yonetici"
        ? cookieMod
        : "yonetici";
    }
    return varsayilan;
  }

  return varsayilan;
}

export function modYonlendirmeYolu(mod: SofraMod): string {
  return MOD_ANA_YOL[mod];
}

/** Mod değiştirmeye izin var mı? */
export async function modDegistirebilirMi(user: ModKullanici, hedef: SofraMod): Promise<boolean> {
  const impersonateSlug = await impersonateSlugOku();
  const impersonating = Boolean(impersonateSlug && platformAdminMi(user));
  const subeSlug = await aktifSubeSlugOku();
  const subede = Boolean(subeSlug && user.zincir);

  if (platformAdminMi(user)) {
    if (hedef === "platform") return true;
    if (impersonating) {
      return hedef === "yonetici" || hedef === "garson" || hedef === "mutfak";
    }
    return hedef === "yonetici";
  }
  if (user.zincir) {
    if (hedef === "zincir") return true;
    if (subede) {
      return hedef === "yonetici" || hedef === "garson" || hedef === "mutfak";
    }
    return false;
  }
  if (user.isletmeler.length > 0) {
    return hedef === "yonetici" || hedef === "garson" || hedef === "mutfak";
  }
  return false;
}

export async function yoneticiModKontrol() {
  const user = await mevcutKullanici();
  if (!user) return null;
  const mod = await efektifMod(user);
  if (mod !== "yonetici") return null;
  const efektif = await efektifIsletmeGetir(user);
  if (!efektif) return null;
  return { user, mod, efektif };
}

export async function zincirModKontrol() {
  const user = await mevcutKullanici();
  if (!user?.zincir) return null;
  const mod = await efektifMod(user);
  if (mod !== "zincir") return null;
  return { user, mod, zincir: user.zincir };
}

export async function isletmePersonelKontrol(slug: string, izinVerilen: SofraMod[]) {
  const user = await mevcutKullanici();
  if (!user) return null;
  const mod = await efektifMod(user);
  if (!mod || !izinVerilen.includes(mod)) return null;
  const efektif = await efektifIsletmeGetir(user);
  if (!efektif || efektif.kayit.slug !== slug) return null;
  return { user, mod, efektif };
}

/** Personel kullanıcı için işletme (sahip veya üyelik). */
export async function kullaniciIsletmeKaydi(user: ModKullanici) {
  if (user.isletmeler[0]) return user.isletmeler[0];
  const uyelik = user.uyelikler[0];
  return uyelik?.isletme ?? null;
}

export async function efektifIsletmeGetir(
  user: ModKullanici,
): Promise<EfektifIsletmeSonuc | null> {
  const impersonateSlug = await impersonateSlugOku();
  if (impersonateSlug && platformAdminMi(user)) {
    const hedef = await prisma.isletme.findUnique({ where: { slug: impersonateSlug } });
    if (hedef) {
      return {
        kayit: hedef,
        isletme: isletmeVeriParse(hedef.veri),
        impersonating: true,
        impersonateSlug,
        subeden: false,
      };
    }
  }

  const subeSlug = await aktifSubeSlugOku();
  if (subeSlug && user.zincir) {
    const hedef =
      user.zincir.subeler.find((s) => s.slug === subeSlug) ??
      (await prisma.isletme.findFirst({
        where: { slug: subeSlug, zincirId: user.zincir.id },
      }));
    if (hedef) {
      return {
        kayit: hedef,
        isletme: isletmeVeriParse(hedef.veri),
        impersonating: false,
        impersonateSlug: null,
        subeden: true,
      };
    }
  }

  const kayit = user.isletmeler[0] ?? (await kullaniciIsletmeKaydi(user));
  if (!kayit) return null;
  return {
    kayit,
    isletme: isletmeVeriParse(kayit.veri),
    impersonating: false,
    impersonateSlug: null,
    subeden: false,
  };
}

export async function adminYetkiKontrol() {
  const user = await mevcutKullanici();
  if (!user || !platformAdminMi(user)) return null;
  return user;
}

export function isletmeVeriParse(ham: string): Isletme {
  const isletme = JSON.parse(ham) as Isletme;
  return {
    ...isletme,
    logoUrl: isletme.logoUrl ?? null,
    logoUrlBaski: isletme.logoUrlBaski ?? null,
    isletmeTipi: isletme.isletmeTipi ?? null,
    menuBoyutId: isletme.menuBoyutId ?? null,
    urunler: (isletme.urunler ?? []).map((u) => ({
      ...u,
      gorselUrl: u.gorselUrl ?? null,
      gorselKaynak: u.gorselKaynak ?? null,
      sayfa: u.sayfa ?? null,
      secenekler: u.secenekler ?? null,
    })),
    baskiTalepleri: isletme.baskiTalepleri ?? [],
  };
}

export async function isletmeSlugIleGetir(slug: string) {
  const kayit = await prisma.isletme.findUnique({ where: { slug } });
  if (!kayit) return null;
  return { kayit, isletme: isletmeVeriParse(kayit.veri) };
}

/** İşletmeyi id ile kaydet (çoklu şube güvenli). */
export async function isletmeKaydet(isletmeId: string, isletme: Isletme) {
  return prisma.isletme.update({
    where: { id: isletmeId },
    data: {
      slug: isletme.slug,
      kafeAdi: isletme.kafeAdi,
      veri: JSON.stringify(isletme),
    },
  });
}

/**
 * Sipariş gibi eşzamanlı güncellemelerde kayıp olmaması için
 * updatedAt ile iyimser kilitleme; çakışmada yeniden dener.
 */
export async function isletmeAtomikGuncelle(
  slug: string,
  fn: (onceki: Isletme) => Isletme,
  deneme = 5,
): Promise<{ kayit: { id: string; slug: string; kafeAdi: string; veri: string }; isletme: Isletme } | null> {
  for (let i = 0; i < deneme; i++) {
    const kayit = await prisma.isletme.findUnique({ where: { slug } });
    if (!kayit) return null;
    const onceki = isletmeVeriParse(kayit.veri);
    const sonraki = fn(onceki);
    const sonuc = await prisma.isletme.updateMany({
      where: { id: kayit.id, updatedAt: kayit.updatedAt },
      data: {
        slug: sonraki.slug,
        kafeAdi: sonraki.kafeAdi,
        veri: JSON.stringify(sonraki),
      },
    });
    if (sonuc.count === 1) {
      return {
        kayit: { id: kayit.id, slug: sonraki.slug, kafeAdi: sonraki.kafeAdi, veri: JSON.stringify(sonraki) },
        isletme: sonraki,
      };
    }
  }
  throw new Error("İşletme kaydı çakışması — sipariş kaydedilemedi");
}

export { kullaniciInclude };
