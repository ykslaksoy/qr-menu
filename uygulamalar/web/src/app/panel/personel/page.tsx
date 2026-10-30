"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  MOD_ACIKLAMA,
  MOD_ETIKET,
  MOD_OZELLIK_ETIKET,
  modOzellikleri,
  type SofraMod,
} from "@/lib/mod";

const ROLLER = ["yonetici", "garson", "mutfak"] as const satisfies readonly SofraMod[];

const DEMO_LINK: Record<(typeof ROLLER)[number], string> = {
  yonetici: "/api/auth/demo/yonetici",
  garson: "/api/auth/demo/garson",
  mutfak: "/api/auth/demo/mutfak",
};

const DEMO_EMAIL: Record<(typeof ROLLER)[number], string> = {
  yonetici: "demo@sofra.app",
  garson: "garson@demo.sofra.app",
  mutfak: "mutfak@demo.sofra.app",
};

type Uye = { id: string; email: string; rol: string };

export default function PanelPersonelPage() {
  const [uyeler, setUyeler] = useState<Uye[]>([]);
  const [email, setEmail] = useState("");
  const [rol, setRol] = useState<"GARSON" | "MUTFAK" | "YONETICI">("GARSON");
  const [mesaj, setMesaj] = useState("");
  const [geciciSifre, setGeciciSifre] = useState<string | null>(null);
  const [yukleniyor, setYukleniyor] = useState(false);

  const listeyiYukle = useCallback(async () => {
    const yanit = await fetch("/api/panel/personel", { credentials: "include" });
    if (yanit.ok) {
      const veri = (await yanit.json()) as { uyeler: Uye[] };
      setUyeler(veri.uyeler);
    }
  }, []);

  useEffect(() => {
    listeyiYukle();
  }, [listeyiYukle]);

  async function personelEkle(e: React.FormEvent) {
    e.preventDefault();
    setYukleniyor(true);
    setMesaj("");
    setGeciciSifre(null);
    const yanit = await fetch("/api/panel/personel", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, rol }),
    });
    const veri = await yanit.json();
    setYukleniyor(false);
    if (!yanit.ok) {
      setMesaj(veri.hata ?? "Eklenemedi");
      return;
    }
    setMesaj(veri.mesaj ?? "Tamam");
    if (veri.geciciSifre) setGeciciSifre(veri.geciciSifre);
    setEmail("");
    listeyiYukle();
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-[family-name:var(--font-baslik)] text-3xl font-semibold">Personel</h1>
        <p className="mt-1 text-muted">
          Rol ekranları ve yetki matrisi — SuperQR #20. Her mod yalnızca kendi sayfalarını görür.
        </p>
        <p className="mt-3 text-sm">
          <Link href="/mod" className="text-brand underline">
            Mod seçim sayfası →
          </Link>
        </p>
      </div>

      <section className="rounded-2xl border border-line bg-card p-5">
        <h2 className="font-semibold">Personel ekle</h2>
        <p className="mt-1 text-sm text-muted">
          E-posta ile garson, mutfak veya şube yöneticisi atayın. Yeni hesapta geçici şifre üretilir.
        </p>
        <form onSubmit={personelEkle} className="mt-4 flex flex-wrap items-end gap-3">
          <label className="block text-sm">
            E-posta
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full min-w-[200px] rounded-xl border border-line px-3 py-2"
              placeholder="personel@isletme.com"
            />
          </label>
          <label className="block text-sm">
            Rol
            <select
              value={rol}
              onChange={(e) => setRol(e.target.value as typeof rol)}
              className="mt-1 rounded-xl border border-line px-3 py-2"
            >
              <option value="GARSON">Garson</option>
              <option value="MUTFAK">Mutfak</option>
              <option value="YONETICI">Şube yönetici</option>
            </select>
          </label>
          <button
            type="submit"
            disabled={yukleniyor}
            className="rounded-full bg-brand px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
          >
            {yukleniyor ? "…" : "Ekle"}
          </button>
        </form>
        {mesaj ? <p className="mt-3 text-sm text-brand">{mesaj}</p> : null}
        {geciciSifre ? (
          <p className="mt-2 text-sm">
            Geçici şifre: <code className="rounded bg-line/50 px-1">{geciciSifre}</code>
          </p>
        ) : null}
        {uyeler.length > 0 ? (
          <ul className="mt-4 space-y-2 text-sm">
            {uyeler.map((u) => (
              <li key={u.id} className="flex justify-between gap-2 border-t border-line/60 pt-2">
                <span>{u.email}</span>
                <span className="text-muted">{u.rol}</span>
              </li>
            ))}
          </ul>
        ) : null}
      </section>

      <section className="rounded-2xl border border-line bg-card p-5">
        <h2 className="font-semibold">Demo giriş</h2>
        <p className="mt-1 text-sm text-muted">
          Tek tık veya e-posta / şifre: <code className="rounded bg-line/50 px-1">demo1234</code>
        </p>
        <ul className="mt-4 grid gap-3 sm:grid-cols-3">
          {ROLLER.map((rol) => (
            <li key={rol} className="rounded-xl border border-line/80 p-4">
              <p className="font-medium">{MOD_ETIKET[rol]}</p>
              <p className="mt-1 text-xs text-muted">{DEMO_EMAIL[rol]}</p>
              <Link
                href={DEMO_LINK[rol]}
                className="mt-3 inline-block rounded-full bg-brand px-3 py-1.5 text-sm font-medium text-white"
              >
                Demo giriş
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="font-[family-name:var(--font-baslik)] text-xl font-semibold">Rol matrisi</h2>
        <p className="mt-1 text-sm text-muted">Yönetici, garson ve mutfak özellik karşılaştırması.</p>
        <div className="mt-6 grid gap-6 lg:grid-cols-3">
          {ROLLER.map((rol) => (
            <article key={rol} className="rounded-2xl border border-line bg-card p-5">
              <h3 className="font-semibold">{MOD_ETIKET[rol]}</h3>
              <p className="mt-1 text-sm text-muted">{MOD_ACIKLAMA[rol]}</p>
              <ul className="mt-4 space-y-1.5 text-sm">
                {modOzellikleri(rol).map((o) => (
                  <li key={o} className="flex gap-2">
                    <span className="text-brand">·</span>
                    {MOD_OZELLIK_ETIKET[o]}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
