"use client";

import { useRouter } from "next/navigation";
import { useIsletme } from "@/lib/useIsletme";

export function ImpersonationBanner() {
  const router = useRouter();
  const { impersonating, yenile } = useIsletme();

  if (!impersonating) return null;

  const subeden = Boolean(impersonating.subeden);
  const geriYol = subeden ? "/subeler" : "/admin";

  async function cik() {
    if (subeden) {
      await fetch("/api/subeler", { method: "DELETE", credentials: "include" });
    } else {
      await fetch("/api/admin/impersonate", { method: "DELETE", credentials: "include" });
    }
    await yenile();
    router.push(geriYol);
  }

  return (
    <div className="border-b border-violet-300 bg-violet-100 px-4 py-2 text-center text-sm text-violet-950">
      <span className="font-medium">{impersonating.kafeAdi}</span>
      <span className="mx-2 text-violet-700">
        {subeden ? "şubesini yönetiyorsunuz" : "kafesini görüntülüyorsunuz"}
      </span>
      <span className="text-violet-600">({impersonating.slug})</span>
      <button
        type="button"
        onClick={cik}
        className="ml-3 font-semibold underline hover:text-violet-800"
      >
        {subeden ? "Şubelere dön" : "Çık"}
      </button>
    </div>
  );
}
