import { redirect } from "next/navigation";
import { IsletmeProvider } from "@/lib/IsletmeProvider";
import {
  efektifIsletmeGetir,
  efektifMod,
  mevcutKullanici,
  platformAdminMi,
  varsayilanMod,
} from "@/lib/auth-server";
import type { SofraMod } from "@/lib/mod";

/** Garson / mutfak sayfaları için sunucu tarafı oturum + işletme bootstrap. */
export async function PersonelIsletmeKabuk({
  children,
  sonra,
}: {
  children: React.ReactNode;
  sonra: "/g" | "/k";
}) {
  const user = await mevcutKullanici();
  if (!user) {
    redirect(`/giris?sonra=${sonra}`);
  }

  const mod = await efektifMod(user);
  if (mod === "platform" && user.isletmeler.length === 0) {
    redirect("/admin");
  }
  if (mod === "zincir" && !user.isletmeler.length) {
    redirect("/subeler");
  }

  const efektif = await efektifIsletmeGetir(user);
  if (!efektif) {
    redirect(`/giris?sonra=${sonra}`);
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
    <IsletmeProvider
      baslangic={{
        isletme: efektif.isletme,
        oturumlu: true,
        platformAdmin: admin,
        mod: mod ?? (sonra === "/k" ? "mutfak" : "garson"),
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
      {children}
    </IsletmeProvider>
  );
}
