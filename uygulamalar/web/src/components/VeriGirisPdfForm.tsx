"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useIsletme } from "@/lib/useIsletme";

export function VeriGirisPdfForm() {
  const { yenile } = useIsletme();
  const router = useRouter();
  const [metin, setMetin] = useState("");
  const [dosya, setDosya] = useState<File | null>(null);
  const [yukleniyor, setYukleniyor] = useState(false);
  const [mesaj, setMesaj] = useState("");
  const [hata, setHata] = useState("");

  async function gonder(e: React.FormEvent) {
    e.preventDefault();
    if (!dosya && !metin.trim()) {
      setHata("PDF dosyası veya metin yapıştırın.");
      return;
    }

    setYukleniyor(true);
    setHata("");
    setMesaj("");

    const form = new FormData();
    if (dosya) form.append("dosya", dosya);
    if (metin.trim()) form.append("metin", metin.trim());

    const yanit = await fetch("/api/panel/ice-aktar", {
      method: "POST",
      credentials: "include",
      body: form,
    });
    const veri = await yanit.json();
    setYukleniyor(false);

    if (!yanit.ok) {
      setHata(veri.hata ?? "İçe aktarma başarısız");
      return;
    }

    await yenile();
    setMesaj(`${veri.eklenen} ürün menüye eklendi.`);
    setMetin("");
    setDosya(null);
  }

  return (
    <form onSubmit={gonder} className="space-y-5 rounded-2xl border border-line bg-card p-6">
      <label className="block text-sm">
        PDF dosyası
        <input
          type="file"
          accept=".pdf,application/pdf,text/plain,.txt"
          onChange={(e) => setDosya(e.target.files?.[0] ?? null)}
          className="mt-2 block w-full text-sm"
        />
      </label>

      <label className="block text-sm">
        veya metin yapıştır
        <textarea
          value={metin}
          onChange={(e) => setMetin(e.target.value)}
          rows={10}
          placeholder={"İçecekler\nFiltre Kahve 90 TL\nLatte 110 TL\n\nYemekler\nMenemen 180 TL"}
          className="mt-2 w-full rounded-xl border border-line bg-background px-3 py-2 font-mono text-xs"
        />
      </label>

      {hata ? <p className="text-sm text-red-700">{hata}</p> : null}
      {mesaj ? <p className="text-sm text-brand-dark">{mesaj}</p> : null}

      <div className="flex flex-wrap gap-3">
        <button
          type="submit"
          disabled={yukleniyor}
          className="rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
        >
          {yukleniyor ? "İşleniyor…" : "Menüye aktar"}
        </button>
        <button
          type="button"
          onClick={() => router.push("/panel/menu")}
          className="rounded-full border border-line px-5 py-2.5 text-sm"
        >
          Menüye git
        </button>
        <Link href="/panel/veri-girisi" className="rounded-full border border-line px-5 py-2.5 text-sm">
          Veri girişine dön
        </Link>
      </div>
    </form>
  );
}
