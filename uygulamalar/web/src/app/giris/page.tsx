import Link from "next/link";
import { SiteNav } from "@/components/SiteNav";
import { DEMO_GIRIS } from "@/lib/demo-giris";

const HATA_METIN: Record<string, string> = {
  eksik: "E-posta ve şifre gerekli",
  gecersiz: "Demo hesap bulunamadı — seed çalıştırın",
  rol: "Geçersiz rol",
};

const ROLLER = ["zincir", "yonetici", "garson", "mutfak", "platform", "musteri"] as const;

type Props = { searchParams: Promise<{ sonra?: string; hata?: string }> };

export default async function GirisPage({ searchParams }: Props) {
  const sp = await searchParams;
  const hata = sp.hata ? HATA_METIN[sp.hata] ?? "Giriş başarısız" : "";

  return (
    <div className="sofra-mesh min-h-full">
      <SiteNav />
      <main className="mx-auto max-w-md px-4 py-16">
        <h1 className="font-[family-name:var(--font-baslik)] text-3xl font-semibold">Giriş</h1>
        <p className="mt-2 text-muted">Şifre yok — rolünüze dokunun, hemen girersiniz.</p>
        {hata ? <p className="mt-3 text-sm text-red-700">{hata}</p> : null}

        <ul className="mt-8 space-y-3">
          {ROLLER.map((rol) => {
            const h = DEMO_GIRIS[rol];
            return (
              <li key={rol}>
                <a
                  href={rol === "musteri" ? "/m/demo?masa=1&siparis=1" : `/api/auth/demo/${rol}`}
                  className="flex w-full flex-col rounded-2xl border border-line bg-card px-5 py-4 text-left transition hover:border-brand/50 hover:bg-card/90"
                >
                  <span className="font-semibold text-foreground">{h.etiket}</span>
                  <span className="mt-1 text-sm text-muted">{h.aciklama}</span>
                </a>
              </li>
            );
          })}
        </ul>

        <p className="mt-10 text-center text-sm text-muted">
          Kendi hesabınız mı?{" "}
          <Link href="/kayit" className="text-brand underline">
            Kayıt olun
          </Link>
        </p>
      </main>
    </div>
  );
}
