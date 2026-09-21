import Link from "next/link";
import { fiyatlar, referans, adetAltiUcretsiz } from "@sofra/tema";
import { SiteNav } from "@/components/SiteNav";

export default function FiyatlandirmaPage() {
  return (
    <div className="sofra-mesh min-h-full">
      <SiteNav />
      <main className="mx-auto max-w-5xl px-4 py-12">
        <h1 className="font-[family-name:var(--font-baslik)] text-3xl font-semibold md:text-4xl">
          Fiyatlar
        </h1>
        <p className="mt-2 text-muted">
          Yıllık ödemede yaklaşık %{Math.round((fiyatlar.yillikIndirimOrani ?? 0.17) * 100)} indirim.
          {fiyatlar.kdvNotu ? ` ${fiyatlar.kdvNotu}` : null}
        </p>
        <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {fiyatlar.planlar.map((plan) => (
            <article
              key={plan.id}
              className={`flex flex-col rounded-2xl border bg-card p-5 ${
                "oneCikan" in plan && plan.oneCikan
                  ? "border-brand shadow-sm ring-1 ring-brand/20"
                  : "border-line"
              }`}
            >
              <h2 className="text-lg font-semibold">{plan.ad}</h2>
              <p className="mt-3 font-[family-name:var(--font-baslik)] text-3xl">
                {plan.aylik === 0 ? "Ücretsiz" : `₺${plan.aylik}`}
                {plan.aylik > 0 ? (
                  <span className="text-sm font-sans text-muted"> / ay</span>
                ) : null}
              </p>
              <ul className="mt-4 flex-1 space-y-2 text-sm text-muted">
                {plan.ozellikler.map((o) => (
                  <li key={o}>· {o}</li>
                ))}
              </ul>
              <Link
                href="/tasarim"
                className="mt-6 block rounded-full bg-brand py-2.5 text-center text-sm font-semibold text-white hover:bg-brand-dark"
              >
                İncele
              </Link>
            </article>
          ))}
        </div>

        <section className="mt-14 rounded-2xl border border-emerald-300/50 bg-emerald-50/50 p-6 md:p-8">
          <h2 className="font-[family-name:var(--font-baslik)] text-2xl font-semibold">
            Adet altı ücretsiz
          </h2>
          <p className="mt-2 max-w-2xl text-muted">
            Ayda <strong>{adetAltiUcretsiz.aylikSiparisLimiti}</strong> siparişe kadar{" "}
            <strong>Menü + Adisyon</strong> özellikleri ücretsiz planda açık (garson, mutfak, QR).
            Kotayı aşınca sipariş <em>durmaz</em> — yalnızca yöneticiye uyarı düşer.
          </p>
          <p className="mt-3 text-sm text-muted">{adetAltiUcretsiz.ozet}</p>
        </section>

        {referans.aktif ? (
          <section className="mt-14 rounded-2xl border border-brand/25 bg-card p-6 md:p-8">
            <h2 className="font-[family-name:var(--font-baslik)] text-2xl font-semibold">
              {referans.baslik}
            </h2>
            <p className="mt-2 max-w-2xl text-muted">{referans.ozet}</p>
            {referans.yeniUyelikIndirimi?.aktif ? (
              <p className="mt-2 max-w-2xl text-sm text-brand-dark">
                {referans.yeniUyelikIndirimi.aciklama}
              </p>
            ) : null}
            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              <div className="rounded-xl border border-line bg-background/60 px-4 py-4 text-center">
                <p className="text-3xl font-semibold text-brand">
                  %{Math.round(referans.indirimOrani * 100)}
                </p>
                <p className="mt-1 text-sm text-muted">indirim oranı</p>
              </div>
              <div className="rounded-xl border border-line bg-background/60 px-4 py-4 text-center">
                <p className="text-3xl font-semibold text-brand">{referans.referansBasinaAy}</p>
                <p className="mt-1 text-sm text-muted">ay / QR referans</p>
              </div>
              <div className="rounded-xl border border-line bg-background/60 px-4 py-4 text-center">
                <p className="text-3xl font-semibold text-brand">Davet QR</p>
                <p className="mt-1 text-sm text-muted">menü QR ile</p>
              </div>
            </div>
            <p className="mt-4 text-xs font-mono text-muted">{referans.referansQr.ornekUrl}</p>
            {"ornekSenaryolar" in referans && referans.ornekSenaryolar?.length ? (
              <ul className="mt-4 space-y-1 text-xs text-muted">
                {referans.ornekSenaryolar.map((s) => (
                  <li key={s.aciklama}>
                    · {s.aciklama}
                    {s.sonucAy > 0
                      ? ` → ${s.sonucAy} ay %${Math.round((s.sonucOrani ?? 0) * 100)}`
                      : ""}
                    {"not" in s && s.not ? ` (${s.not})` : ""}
                  </li>
                ))}
              </ul>
            ) : null}
            <p className="mt-4 text-xs text-muted">{referans.aktifReferansTanimi}</p>
            <p className="mt-1 text-xs text-muted">{referans.indirimUygulama}</p>
            <Link
              href="/kayit"
              className="mt-6 inline-block rounded-full border border-line px-5 py-2.5 text-sm font-semibold hover:border-brand/40"
            >
              Kayıt ol — menü QR gerekli
            </Link>
          </section>
        ) : null}
      </main>
    </div>
  );
}
