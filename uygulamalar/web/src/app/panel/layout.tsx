import Link from "next/link";
import { redirect } from "next/navigation";
import { PanelNav } from "@/components/PanelNav";
import { AdetAltiBanner } from "@/components/AdetAltiBanner";
import { ImpersonationBanner } from "@/components/ImpersonationBanner";
import { PanelIsletmeProvider } from "@/components/PanelIsletmeProvider";
import {
  efektifIsletmeGetir,
  efektifMod,
  mevcutKullanici,
  platformAdminMi,
  varsayilanMod,
} from "@/lib/auth-server";
import type { SofraMod } from "@/lib/mod";

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const user = await mevcutKullanici();
  if (!user) {
    redirect("/giris?sonra=/panel");
  }

  const mod = await efektifMod(user);
  if (mod === "platform" && user.isletmeler.length === 0) {
    redirect("/admin");
  }
  if (mod === "zincir") {
    redirect("/subeler");
  }

  const efektif = await efektifIsletmeGetir(user);
  if (!efektif) {
    return (
      <div className="sofra-mesh min-h-full">
        <PanelNav />
        <main className="mx-auto max-w-lg px-4 py-16 text-center">
          <h1 className="font-[family-name:var(--font-baslik)] text-2xl font-semibold">
            İşletme bulunamadı
          </h1>
          <p className="mt-2 text-muted">Hesabınıza bağlı bir işletme kaydı yok.</p>
          <Link
            href="/kayit"
            className="mt-6 inline-block rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-white"
          >
            Kayıt ol
          </Link>
        </main>
      </div>
    );
  }

  const admin = platformAdminMi(user);
  const varsayilan = varsayilanMod(user);
  const modSecenekleri: SofraMod[] = [];
  if (admin) {
    if (efektif.impersonating) {
      modSecenekleri.push("platform", "yonetici", "garson", "mutfak");
    } else {
      modSecenekleri.push("platform");
    }
  } else if (user.zincir) {
    if (efektif.subeden) {
      modSecenekleri.push("zincir", "yonetici", "garson", "mutfak");
    } else {
      modSecenekleri.push("zincir");
    }
  } else if (user.isletmeler.length > 0) {
    modSecenekleri.push("yonetici", "garson", "mutfak");
  } else if (varsayilan === "garson") {
    modSecenekleri.push("garson");
  } else if (varsayilan === "mutfak") {
    modSecenekleri.push("mutfak");
  }

  return (
    <PanelIsletmeProvider
      baslangic={{
        isletme: efektif.isletme,
        oturumlu: true,
        platformAdmin: admin,
        mod: mod ?? "yonetici",
        modSecenekleri: [...new Set(modSecenekleri)],
        impersonating:
          efektif.impersonating || efektif.subeden
            ? {
                slug: efektif.kayit.slug,
                kafeAdi: efektif.kayit.kafeAdi,
                subeden: efektif.subeden,
              }
            : null,
        adminOzet: null,
      }}
    >
      <div className="sofra-mesh min-h-full">
        <ImpersonationBanner />
        <PanelNav />
        <main className="mx-auto max-w-6xl px-4 py-8">
          <div className="mb-6">
            <AdetAltiBanner isletme={efektif.isletme} />
          </div>
          {children}
        </main>
      </div>
    </PanelIsletmeProvider>
  );
}
