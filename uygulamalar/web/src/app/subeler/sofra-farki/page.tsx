import Link from "next/link";
import { redirect } from "next/navigation";
import { SofraFarkiIcerik } from "@/components/SofraFarkiIcerik";
import { efektifMod, mevcutKullanici } from "@/lib/auth-server";

export default async function SubelerSofraFarkiPage() {
  const user = await mevcutKullanici();
  if (!user) redirect("/giris?sonra=/subeler/sofra-farki");
  const mod = await efektifMod(user);
  if (mod !== "zincir") redirect("/subeler");

  return (
    <div className="sofra-mesh min-h-full">
      <header className="border-b border-line bg-card">
        <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3">
          <Link
            href="/subeler"
            className="font-[family-name:var(--font-baslik)] text-xl font-semibold text-brand-dark"
          >
            Sofra
          </Link>
          <Link href="/subeler" className="text-sm text-brand underline">
            ← Şubeler
          </Link>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8">
        <SofraFarkiIcerik ustLink={[{ href: "/subeler", label: "Şubeler" }]} />
      </main>
    </div>
  );
}
