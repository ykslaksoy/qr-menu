/** Kafe adından URL slug üretir: boşluk ve özel karakterleri temizler. */
export function slugOlustur(ad: string): string {
  const harita: Record<string, string> = {
    ç: "c",
    Ç: "c",
    ğ: "g",
    Ğ: "g",
    ı: "i",
    I: "i",
    İ: "i",
    ö: "o",
    Ö: "o",
    ş: "s",
    Ş: "s",
    ü: "u",
    Ü: "u",
  };

  return ad
    .split("")
    .map((ch) => harita[ch] ?? ch)
    .join("")
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-")
    .slice(0, 48);
}

export function menuYolu(slug: string, taban = "sofra.app") {
  if (!slug) return `${taban}/m/…`;
  return `${taban}/m/${slug}`;
}
