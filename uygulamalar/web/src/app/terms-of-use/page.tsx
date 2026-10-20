import { SiteNav } from "@/components/SiteNav";
import { KullanimSartlariIcerik } from "@/components/KullanimSartlariIcerik";
import { kullanimSartlariMetni } from "@/lib/kullanim-sartlari-icerik";

export default function TermsOfUsePage() {
  const metin = kullanimSartlariMetni("en");

  return (
    <div className="sofra-mesh flex min-h-full flex-col">
      <SiteNav />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-12">
        <h1 className="font-[family-name:var(--font-baslik)] text-3xl font-semibold md:text-4xl">
          {metin.sayfaBaslik}
        </h1>
        <div className="mt-8">
          <KullanimSartlariIcerik dil="en" />
        </div>
      </main>
    </div>
  );
}
