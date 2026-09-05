"use client";

import Link from "next/link";
import { adetAltiDurum } from "@/lib/plan-kilit";
import type { Isletme } from "@/lib/store";

type Props = {
  isletme: Isletme;
  /** Garson/mutfak şeridi */
  compact?: boolean;
};

export function AdetAltiBanner({ isletme, compact }: Props) {
  const d = adetAltiDurum(isletme);
  if (!d.aktif) return null;

  const odemeLi = isletme.abonelik.aktif && isletme.abonelik.planId !== "ucretsiz";
  if (odemeLi) {
    if (compact) return null;
    return (
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50/60 px-4 py-3 text-sm">
        Ücretli plan aktif — aylık sipariş limiti uygulanmıyor.
      </div>
    );
  }

  if (compact) {
    if (!d.uyariVer && d.kalan > 10) return null;
    if (d.uyariVer) {
      return (
        <div className="border-b border-amber-300 bg-amber-50 px-4 py-2 text-center text-sm">
          <span className="font-medium">Kota aşıldı ({d.kullanilan}/{d.limit})</span>
          <span className="mx-2 text-muted">·</span>
          Siparişler devam ediyor.
          <Link href="/panel/abonelik" className="ml-2 font-semibold text-brand underline">
            Plan
          </Link>
        </div>
      );
    }
    return (
      <div className="border-b border-amber-200 bg-amber-50/80 px-4 py-2 text-center text-xs text-muted">
        Ücretsiz kotada {d.kalan} sipariş kaldı ({d.kullanilan}/{d.limit})
      </div>
    );
  }

  if (d.uyariVer) {
    return (
      <div className="rounded-2xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm">
        <p className="font-medium">
          Otomatik uyarı — ücretsiz kota aşıldı ({d.kullanilan}/{d.limit} sipariş bu ay)
        </p>
        <p className="mt-1 text-muted">
          Siparişler kesilmedi. Yönetici ekranında bu uyarıyı görüyorsunuz; isterseniz plan seçebilir veya
          biz sizinle iletişime geçeriz.
        </p>
        <Link href="/panel/abonelik" className="mt-2 inline-block font-semibold text-brand underline">
          Planlara bak
        </Link>
      </div>
    );
  }

  const yuzde = Math.min(100, Math.round((d.kullanilan / d.limit) * 100));

  return (
    <div className="rounded-2xl border border-line bg-card px-4 py-3 text-sm">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="font-medium">
          Ücretsiz hak: {d.kalan} sipariş kaldı
          <span className="ml-1 font-normal text-muted">
            ({d.kullanilan}/{d.limit} bu ay)
          </span>
        </p>
        <span className="text-xs text-muted">Menü + Adisyon hediye</span>
      </div>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-line">
        <div
          className={`h-full rounded-full ${yuzde >= 90 ? "bg-amber-500" : "bg-brand"}`}
          style={{ width: `${yuzde}%` }}
        />
      </div>
      {yuzde >= 90 ? (
        <p className="mt-2 text-xs text-amber-800">
          Kotaya yaklaşıyorsunuz — aşınca yöneticiye otomatik uyarı düşer, sipariş durmaz.
        </p>
      ) : null}
    </div>
  );
}
