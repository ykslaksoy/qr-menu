import Image from "next/image";
import Link from "next/link";
import rapor from "@/data/rakip-analizi/monu.json";

type Kategori = "Müşteri & menü" | "Operasyon" | "Kurumsal";

const kategoriRenk: Record<Kategori, string> = {
  "Müşteri & menü": "bg-sky-100 text-sky-900 border-sky-200",
  Operasyon: "bg-amber-100 text-amber-900 border-amber-200",
  Kurumsal: "bg-violet-100 text-violet-900 border-violet-200",
};

function KategoriRozet({ kategori }: { kategori: string }) {
  const stil = kategoriRenk[kategori as Kategori] ?? "bg-line/40 text-foreground border-line";
  return (
    <span className={`inline-flex rounded-full border px-2 py-0.5 text-xs font-medium ${stil}`}>
      {kategori}
    </span>
  );
}

function DogrulamaEtiket({ metin }: { metin: string }) {
  const d = metin.toLowerCase();
  const sinif =
    d.includes("doğrulanamadı")
      ? "bg-zinc-100 text-zinc-700"
      : d.includes("kısmen")
        ? "bg-amber-50 text-amber-800"
        : "bg-emerald-50 text-emerald-800";
  return <span className={`rounded px-1.5 py-0.5 text-xs font-medium ${sinif}`}>{metin}</span>;
}

export function RakipAnaliziMonuIcerik() {
  const { meta, sayfalar, musteriMenu, yonetimPaneli, karsilastirma } = rapor;

  const onerilerSirali = [...karsilastirma.oneriler].sort((a, b) => a.oncelik - b.oncelik);

  return (
    <>
      <p className="text-sm font-medium uppercase tracking-[0.2em] text-brand">Yönetim · gizli</p>
      <h1 className="mt-2 font-[family-name:var(--font-baslik)] text-3xl font-semibold md:text-4xl">
        Rakip analizi: MONU
      </h1>
      <p className="mt-3 max-w-3xl text-muted">{meta.incelemeYontemi}</p>
      <p className="mt-2 text-sm text-muted">
        İnceleme tarihi: <strong>{meta.incelemeTarihi}</strong> · Veri dosyası:{" "}
        <code className="rounded bg-line/50 px-1 text-xs">src/data/rakip-analizi/monu.json</code>
      </p>
      <p className="mt-2 text-sm text-muted">
        Bu sayfa yalnızca yönetici panelinde görünür; müşteri menüsüne eklenmez.
      </p>

      <section className="mt-8 rounded-2xl border border-line bg-card p-5">
        <h2 className="text-lg font-semibold">Kaynaklar</h2>
        <ul className="mt-3 flex flex-wrap gap-2 text-sm">
          {meta.kaynaklar.map((k) => (
            <li key={k.url}>
              <a
                href={k.url}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full border border-line px-3 py-1 hover:border-brand/40"
              >
                {k.baslik}
              </a>
            </li>
          ))}
        </ul>
        <div className="mt-4 text-sm text-muted">
          <p className="font-medium text-foreground">Canlı demo menüler</p>
          <ul className="mt-1 list-inside list-disc">
            {meta.demoMenuler.map((d) => (
              <li key={d.url}>
                <a href={d.url} target="_blank" rel="noopener noreferrer" className="text-brand underline">
                  {d.ad}
                </a>
                {" — "}
                {d.not}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="mt-12">
        <h2 className="font-[family-name:var(--font-baslik)] text-2xl font-semibold">Tanıtım sayfaları</h2>
        <div className="mt-6 space-y-10">
          {sayfalar.map((s) => (
            <article key={s.id} className="rounded-2xl border border-line bg-card overflow-hidden">
              <div className="grid gap-0 lg:grid-cols-2">
                <div className="relative aspect-[16/10] bg-line/30 lg:min-h-[280px]">
                  <Image
                    src={s.ekranGoruntusu}
                    alt={`${s.baslik} ekran görüntüsü`}
                    fill
                    className="object-cover object-top"
                    sizes="(max-width: 1024px) 100vw, 50vw"
                  />
                </div>
                <div className="p-5 md:p-6">
                  <h3 className="text-xl font-semibold">{s.baslik}</h3>
                  <a
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-1 block text-sm text-brand underline"
                  >
                    {s.url}
                  </a>
                  <p className="mt-3 text-sm text-muted">{s.ozet}</p>
                  <ul className="mt-4 space-y-2 text-sm">
                    {s.icerik.map((m) => (
                      <li key={m} className="flex gap-2">
                        <span className="text-brand">·</span>
                        <span>{m}</span>
                      </li>
                    ))}
                  </ul>
                  {s.ux?.length ? (
                    <div className="mt-4 rounded-xl bg-background/80 p-3 text-sm">
                      <p className="font-medium">UX notları</p>
                      <ul className="mt-2 space-y-1 text-muted">
                        {s.ux.map((u) => (
                          <li key={u}>— {u}</li>
                        ))}
                      </ul>
                    </div>
                  ) : null}
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="mt-14 border-t border-line pt-12">
        <h2 className="font-[family-name:var(--font-baslik)] text-2xl font-semibold">Müşteri menüsü</h2>
        <p className="mt-2 max-w-3xl text-muted">{musteriMenu.ozet}</p>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {musteriMenu.ekranGoruntuleri.map((g) => (
            <figure key={g.dosya} className="rounded-xl border border-line bg-card overflow-hidden">
              <div className="relative aspect-[9/16] max-h-[420px] w-full bg-line/20">
                <Image
                  src={g.dosya}
                  alt={g.aciklama}
                  fill
                  className="object-cover object-top"
                  sizes="(max-width: 640px) 100vw, 320px"
                />
              </div>
              <figcaption className="p-3 text-xs text-muted">{g.aciklama}</figcaption>
            </figure>
          ))}
        </div>
        <div className="mt-8 overflow-x-auto rounded-xl border border-line">
          <table className="w-full min-w-[520px] text-left text-sm">
            <thead className="bg-line/30 text-xs uppercase tracking-wide text-muted">
              <tr>
                <th className="px-4 py-3">Konu</th>
                <th className="px-4 py-3">Gözlem</th>
                <th className="px-4 py-3">Doğrulama</th>
              </tr>
            </thead>
            <tbody>
              {musteriMenu.gozlemler.map((g) => (
                <tr key={g.konu} className="border-t border-line">
                  <td className="px-4 py-3 font-medium">{g.konu}</td>
                  <td className="px-4 py-3 text-muted">{g.detay}</td>
                  <td className="px-4 py-3">
                    <DogrulamaEtiket metin={g.dogrulama} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mt-14 border-t border-line pt-12">
        <h2 className="font-[family-name:var(--font-baslik)] text-2xl font-semibold">İşletme paneli</h2>
        <p className="mt-2 rounded-xl border border-amber-200 bg-amber-50/80 px-4 py-3 text-sm text-amber-950">
          <strong>{yonetimPaneli.dogrulama}</strong> — {yonetimPaneli.not}
        </p>
        <ul className="mt-4 list-inside list-disc space-y-2 text-sm text-muted">
          {yonetimPaneli.ozellikler.map((o) => (
            <li key={o}>{o}</li>
          ))}
        </ul>
      </section>

      <section className="mt-14 border-t border-line pt-12">
        <h2 className="font-[family-name:var(--font-baslik)] text-2xl font-semibold">Sofra karşılaştırması</h2>

        <div className="mt-8 grid gap-8 lg:grid-cols-2">
          <div>
            <h3 className="font-semibold text-amber-900">MONU&apos;da olup Sofra&apos;da geliştirilebilir</h3>
            <ul className="mt-3 space-y-3 text-sm">
              {[...karsilastirma.monudaOlupSofradaEksik]
                .sort((a, b) => a.oncelik - b.oncelik)
                .map((x) => (
                  <li key={x.madde} className="rounded-xl border border-line bg-card p-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-semibold text-muted">P{x.oncelik}</span>
                      <KategoriRozet kategori={x.kategori} />
                    </div>
                    <p className="mt-2">{x.madde}</p>
                  </li>
                ))}
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-emerald-900">Sofra&apos;nın önde olduğu alanlar</h3>
            <ul className="mt-3 space-y-3 text-sm">
              {karsilastirma.sofradaOne.map((x) => (
                <li key={x.madde} className="rounded-xl border border-emerald-200/60 bg-emerald-50/40 p-3">
                  <KategoriRozet kategori={x.kategori} />
                  <p className="mt-2">{x.madde}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <h3 className="mt-12 text-lg font-semibold">Öncelikli öneriler</h3>
        <ol className="mt-4 space-y-4">
          {onerilerSirali.map((o) => (
            <li key={o.baslik} className="rounded-2xl border border-line bg-card p-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-brand text-sm font-bold text-white">
                  {o.oncelik}
                </span>
                <KategoriRozet kategori={o.kategori} />
                <span className="font-semibold">{o.baslik}</span>
              </div>
              <p className="mt-2 text-sm text-muted">{o.detay}</p>
            </li>
          ))}
        </ol>
      </section>

      <p className="mt-12 text-sm text-muted">
        <Link href="/panel/sofra-farki" className="text-brand underline">
          Sofra farkı
        </Link>
        {" · "}
        <Link href="/panel" className="text-brand underline">
          Panele dön
        </Link>
      </p>
    </>
  );
}
