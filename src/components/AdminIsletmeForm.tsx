"use client";

import { useMemo, useState } from "react";
import { slugOlustur } from "@/lib/slug";
import type { PlanId } from "@/lib/store";

type Props = {
  onEklendi: () => void;
};

const planlar: { id: PlanId; label: string }[] = [
  { id: "ucretsiz", label: "Ücretsiz" },
  { id: "menu", label: "Menü" },
  { id: "menu-adisyon", label: "Menü + Adisyon" },
  { id: "tam", label: "Tam" },
];

export function AdminIsletmeForm({ onEklendi }: Props) {
  const [acik, setAcik] = useState(false);
  const [kafeAdi, setKafeAdi] = useState("");
  const [slugElle, setSlugElle] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [sifre, setSifre] = useState("");
  const [planId, setPlanId] = useState<PlanId>("ucretsiz");
  const [ornekSiparis, setOrnekSiparis] = useState(true);
  const [hata, setHata] = useState("");
  const [basari, setBasari] = useState("");
  const [yukleniyor, setYukleniyor] = useState(false);

  const otomatikSlug = useMemo(() => slugOlustur(kafeAdi), [kafeAdi]);
  const slug = slugElle !== null ? slugElle : otomatikSlug;

  async function gonder(e: React.FormEvent) {
    e.preventDefault();
    if (!slug) {
      setHata("Geçerli bir slug girin");
      return;
    }
    setYukleniyor(true);
    setHata("");
    setBasari("");

    const yanit = await fetch("/api/admin/isletmeler", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ kafeAdi, slug, email, sifre, planId, ornekSiparis }),
    });
    const veri = await yanit.json();
    setYukleniyor(false);

    if (!yanit.ok) {
      setHata(veri.hata ?? "Kayıt başarısız");
      return;
    }

    setBasari(`${veri.kafeAdi} eklendi (/m/${veri.slug})`);
    setKafeAdi("");
    setSlugElle(null);
    setEmail("");
    setSifre("");
    setPlanId("ucretsiz");
    setOrnekSiparis(true);
    onEklendi();
  }

  return (
    <section className="mt-8 rounded-2xl border border-line bg-card">
      <button
        type="button"
        onClick={() => setAcik((a) => !a)}
        className="flex w-full items-center justify-between px-5 py-4 text-left"
      >
        <div>
          <h2 className="font-[family-name:var(--font-baslik)] text-lg font-semibold">Yeni işletme ekle</h2>
          <p className="text-sm text-muted">Örnek menü + isteğe bağlı demo siparişler</p>
        </div>
        <span className="text-muted">{acik ? "▲" : "▼"}</span>
      </button>

      {acik ? (
        <form onSubmit={gonder} className="space-y-4 border-t border-line px-5 py-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-sm">
              Kafe adı
              <input
                value={kafeAdi}
                onChange={(e) => setKafeAdi(e.target.value)}
                className="mt-1 w-full rounded-xl border border-line px-3 py-2.5"
                placeholder="Cafe Ada"
                required
              />
            </label>
            <label className="block text-sm">
              Slug
              <input
                value={slug}
                onChange={(e) => setSlugElle(e.target.value)}
                className="mt-1 w-full rounded-xl border border-line px-3 py-2.5"
                placeholder={otomatikSlug || "cafe-ada"}
                required
              />
            </label>
            <label className="block text-sm">
              E-posta (giriş)
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 w-full rounded-xl border border-line px-3 py-2.5"
                placeholder="kafe@ornek.com"
                required
              />
            </label>
            <label className="block text-sm">
              Şifre
              <input
                type="text"
                value={sifre}
                onChange={(e) => setSifre(e.target.value)}
                className="mt-1 w-full rounded-xl border border-line px-3 py-2.5"
                placeholder="en az 6 karakter"
                minLength={6}
                required
              />
            </label>
            <label className="block text-sm">
              Plan
              <select
                value={planId}
                onChange={(e) => setPlanId(e.target.value as PlanId)}
                className="mt-1 w-full rounded-xl border border-line px-3 py-2.5"
              >
                {planlar.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex items-end gap-2 pb-2 text-sm">
              <input
                type="checkbox"
                checked={ornekSiparis}
                onChange={(e) => setOrnekSiparis(e.target.checked)}
                className="rounded"
              />
              3 örnek sipariş ekle (metrikler dolu görünsün)
            </label>
          </div>

          {hata ? <p className="text-sm text-red-700">{hata}</p> : null}
          {basari ? <p className="text-sm text-emerald-700">{basari}</p> : null}

          <button
            type="submit"
            disabled={yukleniyor}
            className="rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
          >
            {yukleniyor ? "Ekleniyor…" : "İşletmeyi kaydet"}
          </button>
        </form>
      ) : null}
    </section>
  );
}
