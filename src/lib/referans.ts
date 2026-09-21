import { referans } from "@sofra/tema";

export const REFERANS_STORAGE_FROM = "sofra-referans-from";
export const REFERANS_STORAGE_KAYNAK = "sofra-referans-kaynak";

/** Referans olan yerin menü QR URL yolu. */
export function menuQrYolu(slug: string, masa = "1") {
  const yol = referans.referansQr.menuYolu.replace("{slug}", slug);
  return `${yol}?masa=${masa}`;
}

export function menuQrTamUrl(slug: string, masa = "1", taban = "sofra.app") {
  return `https://${taban}${menuQrYolu(slug, masa)}`;
}

export function referansKayitParametreleri(fromSlug: string) {
  const q = referans.referansQr;
  return {
    [q.isletmeParametresi]: fromSlug,
    [q.kaynakParametresi]: q.kaynakDegeri,
  } as Record<string, string>;
}

export function referansKayitYolu(fromSlug: string) {
  const p = referansKayitParametreleri(fromSlug);
  const qs = new URLSearchParams(p).toString();
  return `/kayit?${qs}`;
}

export function referansSlugDogrula(slug: string) {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug);
}

/** Menü QR ziyareti — kayıt sayfasına taşınır. */
export function referansMenuQrKaydet(slug: string) {
  if (typeof window === "undefined" || !referansSlugDogrula(slug)) return;
  try {
    sessionStorage.setItem(REFERANS_STORAGE_FROM, slug);
    sessionStorage.setItem(REFERANS_STORAGE_KAYNAK, referans.referansQr.kaynakDegeri);
  } catch {
    /* ignore */
  }
}

export function referansMenuQrOku(): { from: string; kaynak: string } | null {
  if (typeof window === "undefined") return null;
  try {
    const from = sessionStorage.getItem(REFERANS_STORAGE_FROM);
    const kaynak = sessionStorage.getItem(REFERANS_STORAGE_KAYNAK);
    if (!from || !kaynak || !referansSlugDogrula(from)) return null;
    return { from, kaynak };
  } catch {
    return null;
  }
}

/** Menü QR ile gelen referans geçerli mi? */
export function referansQrGecerliMi(
  fromSlug: string | null | undefined,
  kaynak: string | null | undefined,
) {
  if (!referans.aktif) return false;
  if (!referans.referansQr.zorunlu) return Boolean(fromSlug?.trim());
  if (!fromSlug?.trim() || !referansSlugDogrula(fromSlug.trim())) return false;
  return kaynak === referans.referansQr.kaynakDegeri;
}
