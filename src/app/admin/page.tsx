"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { AdminIsletmeForm } from "@/components/AdminIsletmeForm";
import type { AdminOzet, IsletmeOzet } from "@/lib/admin-server";

export default function AdminPage() {
  const router = useRouter();
  const [yukleniyor, setYukleniyor] = useState(true);
  const [isletmeler, setIsletmeler] = useState<IsletmeOzet[]>([]);
  const [ozet, setOzet] = useState<AdminOzet | null>(null);
  const [hata, setHata] = useState<string | null>(null);
  const [arama, setArama] = useState("");

  const yukle = useCallback(async () => {
    setYukleniyor(true);
    setHata(null);
    try {
      const yanit = await fetch("/api/admin/isletmeler", { credentials: "include" });
      if (yanit.status === 403) {
        router.replace("/giris?sonra=/admin");
        return;
      }
      if (!yanit.ok) {
        setHata("Liste yüklenemedi");
        return;
      }
      const veri = (await yanit.json()) as { isletmeler: IsletmeOzet[]; ozet: AdminOzet };
      setIsletmeler(veri.isletmeler);
      setOzet(veri.ozet);
    } catch {
      setHata("Bağlantı hatası");
    } finally {
      setYukleniyor(false);
    }
  }, [router]);

  useEffect(() => {
    yukle();
  }, [yukle]);

  async function paneleGir(slug: string) {
    const yanit = await fetch("/api/admin/impersonate", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug }),
    });
    if (yanit.ok) {
      router.push("/panel");
    }
  }

  async function ornekSiparisEkle(slug: string) {
    const yanit = await fetch(`/api/admin/isletmeler/${slug}/ornek-siparis`, {
      method: "POST",
      credentials: "include",
    });
    if (yanit.ok) {
      await yukle();
    }
  }

  async function cikis() {
    await fetch("/api/auth", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "cikis" }),
    });
    router.push("/giris");
  }

  const filtreli = isletmeler.filter((i) => {
    const q = arama.toLowerCase();
    return (
      i.kafeAdi.toLowerCase().includes(q) ||
      i.slug.toLowerCase().includes(q) ||
      i.email.toLowerCase().includes(q)
    );
  });

  return (
    <>
      <header className="border-b border-line bg-card">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-4">
          <div>
            <Link href="/" className="font-[family-name:var(--font-baslik)] text-xl font-semibold text-brand-dark">
              Sofra
            </Link>
            <p className="text-sm text-muted">Platform yönetimi</p>
          </div>
          <div className="flex gap-2 text-sm">
            <Link
              href="/admin/sofra-farki"
              className="rounded-full border border-line px-3 py-1.5 hover:border-brand/40"
            >
              Sofra farkı
            </Link>
            <Link href="/mod" className="rounded-full border border-line px-3 py-1.5 hover:border-brand/40">
              Mod
            </Link>
            <button
              type="button"
              onClick={cikis}
              className="rounded-full border border-line px-3 py-1.5 hover:border-brand/40"
            >
              Çıkış
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8">
        <h1 className="font-[family-name:var(--font-baslik)] text-3xl font-semibold">Tüm işletmeler</h1>
        <p className="mt-1 text-muted">
          Sofra girişi ile yönetim — yeni işletme ekleyin veya şube yöneticisine girin
        </p>

        <AdminIsletmeForm onEklendi={yukle} />

        {ozet ? (
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {[
              { label: "İşletme", deger: ozet.toplamIsletme },
              { label: "Sipariş (bu ay)", deger: ozet.toplamSiparisBuAy },
              { label: "Kota aşan", deger: ozet.kotaAsan },
              { label: "Ücretsiz", deger: ozet.ucretsiz },
              { label: "Ücretli", deger: ozet.odemeli },
            ].map((k) => (
              <div key={k.label} className="rounded-2xl border border-line bg-card p-4">
                <p className="text-xs uppercase tracking-wide text-muted">{k.label}</p>
                <p className="mt-1 text-2xl font-semibold">{k.deger}</p>
              </div>
            ))}
          </div>
        ) : null}

        <div className="mt-8 flex flex-wrap items-center gap-3">
          <input
            type="search"
            placeholder="Kafe, slug veya e-posta ara…"
            value={arama}
            onChange={(e) => setArama(e.target.value)}
            className="min-w-[240px] flex-1 rounded-full border border-line bg-card px-4 py-2 text-sm"
          />
          <button
            type="button"
            onClick={yukle}
            className="rounded-full border border-line px-4 py-2 text-sm hover:border-brand/40"
          >
            Yenile
          </button>
        </div>

        {yukleniyor ? (
          <p className="mt-8 text-muted">Yükleniyor…</p>
        ) : hata ? (
          <p className="mt-8 text-red-600">{hata}</p>
        ) : (
          <div className="mt-6 overflow-x-auto rounded-2xl border border-line bg-card">
            <table className="w-full min-w-[800px] text-left text-sm">
              <thead className="border-b border-line bg-line/30 text-xs uppercase tracking-wide text-muted">
                <tr>
                  <th className="px-4 py-3">Kafe</th>
                  <th className="px-4 py-3">E-posta</th>
                  <th className="px-4 py-3">Plan</th>
                  <th className="px-4 py-3">Sipariş/ay</th>
                  <th className="px-4 py-3">Kota</th>
                  <th className="px-4 py-3">Ürün</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {filtreli.map((i) => (
                  <tr key={i.id} className="border-b border-line/60 last:border-0">
                    <td className="px-4 py-3">
                      <p className="font-medium">{i.kafeAdi}</p>
                      <p className="text-xs text-muted">/{i.slug}</p>
                    </td>
                    <td className="px-4 py-3 text-muted">{i.email}</td>
                    <td className="px-4 py-3">
                      <span className="rounded-full bg-line/50 px-2 py-0.5 text-xs">
                        {i.planId}
                        {i.efektifPlan !== i.planId ? ` → ${i.efektifPlan}` : ""}
                      </span>
                    </td>
                    <td className="px-4 py-3">{i.aylikSiparis}</td>
                    <td className="px-4 py-3">
                      {i.planId === "ucretsiz" ? (
                        <span className={i.kotaAsildi ? "font-medium text-amber-700" : ""}>
                          {i.aylikSiparis}/{i.kotaLimit}
                          {i.kotaAsildi ? " ⚠" : ""}
                        </span>
                      ) : (
                        <span className="text-muted">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-muted">
                      {i.urunSayisi} ürün · {i.masaSayisi} masa
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => paneleGir(i.slug)}
                          className="rounded-full bg-brand px-3 py-1.5 text-xs font-semibold text-white"
                        >
                          Şube yöneticisine gir
                        </button>
                        {i.aylikSiparis === 0 ? (
                          <button
                            type="button"
                            onClick={() => ornekSiparisEkle(i.slug)}
                            className="rounded-full border border-amber-300 bg-amber-50 px-3 py-1.5 text-xs text-amber-900"
                          >
                            Örnek sipariş
                          </button>
                        ) : null}
                        <Link
                          href={`/m/${i.slug}`}
                          className="rounded-full border border-line px-3 py-1.5 text-xs"
                        >
                          Menü
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtreli.length === 0 ? (
              <p className="p-6 text-center text-muted">Kayıt bulunamadı.</p>
            ) : null}
          </div>
        )}

        <p className="mt-8 text-xs text-muted">
          DB canlı tutma: <code className="rounded bg-line/50 px-1">GET /api/cron/heartbeat?secret=…</code>{" "}
          (günde 1 kez yeterli)
        </p>
      </main>
    </>
  );
}
