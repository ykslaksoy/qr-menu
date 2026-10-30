import type { PdfUrun } from "@/lib/pdf-menu-parser";

type AiUrun = { ad: string; fiyat: number; kategoriAd?: string };

/** OPENAI_API_KEY varsa ham menü metnini yapılandırılmış ürünlere çevirir. */
export async function menuMetniAiParse(metin: string): Promise<PdfUrun[] | null> {
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey || metin.length < 20) return null;

  const model = process.env.OPENAI_MENU_MODEL?.trim() || "gpt-4o-mini";
  const body = {
    model,
    temperature: 0.2,
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "menu_urunleri",
        strict: true,
        schema: {
          type: "object",
          properties: {
            urunler: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  ad: { type: "string" },
                  fiyat: { type: "number" },
                  kategoriAd: { type: "string" },
                },
                required: ["ad", "fiyat"],
                additionalProperties: false,
              },
            },
          },
          required: ["urunler"],
          additionalProperties: false,
        },
      },
    },
    messages: [
      {
        role: "system",
        content:
          "Türkçe restoran menüsünden ürün adı ve fiyat (TL sayı) çıkar. Kategori başlıklarını kategoriAd olarak yaz. Uydurma ürün ekleme.",
      },
      { role: "user", content: metin.slice(0, 12_000) },
    ],
  };

  const yanit = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!yanit.ok) return null;
  const json = (await yanit.json()) as {
    choices?: { message?: { content?: string } }[];
  };
  const content = json.choices?.[0]?.message?.content;
  if (!content) return null;

  try {
    const parsed = JSON.parse(content) as { urunler: AiUrun[] };
    return parsed.urunler
      .filter((u) => u.ad && u.fiyat > 0 && u.fiyat < 10000)
      .map((u) => ({
        ad: u.ad.trim(),
        fiyat: u.fiyat,
        kategoriAd: u.kategoriAd?.trim(),
        aciklama: "",
      }));
  } catch {
    return null;
  }
}
