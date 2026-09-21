import Link from "next/link";
import { karsilastirma } from "@sofra/tema";
import {
  KarsilastirmaOzetBand,
  SadeceSofradaGrid,
  SuperQrKarsilastirma,
} from "@/components/Karsilastirma";

type Props = {
  /** Panel veya admin üst bağlantıları */
  ustLink?: { href: string; label: string }[];
};

export function SofraFarkiIcerik({ ustLink }: Props) {
  const { superQrModel } = karsilastirma;

  return (
    <>
      {ustLink?.length ? (
        <div className="mb-6 flex flex-wrap gap-2 text-sm">
          {ustLink.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="rounded-full border border-line px-3 py-1.5 hover:border-brand/40"
            >
              ← {l.label}
            </Link>
          ))}
        </div>
      ) : null}

      <p className="text-sm font-medium uppercase tracking-[0.2em] text-brand">Yönetim · gizli</p>
      <h1 className="mt-2 font-[family-name:var(--font-baslik)] text-3xl font-semibold md:text-4xl">
        Sofra farkı
      </h1>
      <p className="mt-3 max-w-2xl text-lg text-muted">{superQrModel.ozet}</p>
      <p className="mt-2 text-sm text-muted">
        Bu sayfa yalnızca yönetici ekranlarında görünür — müşteri menüsünde veya halka açık sitede
        yer almaz.
      </p>

      <div className="mt-8">
        <KarsilastirmaOzetBand />
      </div>

      <section className="mt-14">
        <h2 className="font-[family-name:var(--font-baslik)] text-2xl font-semibold">
          SüperQr karşılaştırma
        </h2>
        <p className="mt-2 text-muted">
          Sofra&apos;nın kod adı <strong>Vox</strong> — sesli garson odaklı platform. Varsayılan rakip: Top
          10 birleşimi (<strong>SüperQr</strong>).
        </p>
        <div className="mt-8">
          <SuperQrKarsilastirma />
        </div>
      </section>

      <section className="mt-16 border-t border-line pt-14">
        <h2 className="font-[family-name:var(--font-baslik)] text-2xl font-semibold">Sadece Sofra&apos;da</h2>
        <p className="mt-2 max-w-2xl text-muted">
          Rakiplerde olmayan veya farklı paketlenmiş özellikler.
        </p>
        <div className="mt-8">
          <SadeceSofradaGrid />
        </div>
      </section>
    </>
  );
}
