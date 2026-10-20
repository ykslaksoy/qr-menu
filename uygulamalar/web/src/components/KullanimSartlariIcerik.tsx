import Link from "next/link";
import { kullanimSartlariMetni, type KullanimSartlariDil } from "@/lib/kullanim-sartlari-icerik";
import { PLATFORM_CONTACT_EMAIL } from "@/lib/legal-contact";

type Props = {
  dil: KullanimSartlariDil;
};

export function KullanimSartlariIcerik({ dil }: Props) {
  const metin = kullanimSartlariMetni(dil);

  return (
    <article className="prose prose-neutral max-w-none text-foreground prose-headings:font-[family-name:var(--font-baslik)] prose-headings:font-semibold prose-p:text-muted prose-li:text-muted">
      <p className="text-sm font-medium text-brand">{metin.yururlukEtiket}</p>
      <p className="text-base">{metin.giris}</p>
      {metin.bolumler.map((bolum) => (
        <section key={bolum.baslik} className="mt-8">
          <h2 className="text-xl">{bolum.baslik}</h2>
          <ol className="mt-3 list-decimal space-y-2 pl-5">
            {bolum.maddeler.map((madde) => (
              <li key={madde}>{madde}</li>
            ))}
          </ol>
        </section>
      ))}
      <section className="mt-8">
        <h2 className="text-xl">{metin.iletisimBaslik}</h2>
        <p className="mt-2">
          <a
            href={`mailto:${PLATFORM_CONTACT_EMAIL}`}
            className="font-medium text-brand hover:text-brand-dark"
          >
            {PLATFORM_CONTACT_EMAIL}
          </a>
        </p>
      </section>
      <p className="mt-10 text-sm text-muted">
        <Link href={metin.digerDilLink.href} className="text-brand underline hover:text-brand-dark">
          {metin.digerDilLink.etiket}
        </Link>
      </p>
    </article>
  );
}
