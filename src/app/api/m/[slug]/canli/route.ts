import { NextResponse } from "next/server";
import { isletmePersonelKontrol } from "@/lib/auth-server";
import { canliAbone, type CanliOlay } from "@/lib/canli-bus";

type Params = { params: Promise<{ slug: string }> };

/** Personel canlı akış — yeni sipariş / çağrı / hazır (SSE). */
export async function GET(req: Request, { params }: Params) {
  const { slug } = await params;
  const yetki = await isletmePersonelKontrol(slug, ["yonetici", "garson", "mutfak"]);
  if (!yetki) {
    return NextResponse.json({ hata: "Personel oturumu gerekli" }, { status: 401 });
  }

  const encoder = new TextEncoder();
  let kapat: (() => void) | null = null;
  let heartbeat: ReturnType<typeof setInterval> | null = null;

  const stream = new ReadableStream({
    start(controller) {
      const gonder = (olay: CanliOlay) => {
        try {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(olay)}\n\n`));
        } catch {
          /* kapalı */
        }
      };
      gonder({ tur: "ping", ts: Date.now() });
      kapat = canliAbone(slug, gonder);
      heartbeat = setInterval(() => gonder({ tur: "ping", ts: Date.now() }), 20_000);

      req.signal.addEventListener("abort", () => {
        if (heartbeat) clearInterval(heartbeat);
        kapat?.();
        try {
          controller.close();
        } catch {
          /* */
        }
      });
    },
    cancel() {
      if (heartbeat) clearInterval(heartbeat);
      kapat?.();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
