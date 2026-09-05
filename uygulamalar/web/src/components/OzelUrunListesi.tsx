"use client";

import { formatTl } from "@/lib/abonelik";
import type { Urun } from "@/lib/store";

type Props = {
  urunler: Urun[];
  onKaldir: (id: string) => void;
};

export function OzelUrunListesi({ urunler, onKaldir }: Props) {
  if (urunler.length === 0) return null;

  return (
    <div className="mt-3">
      <p className="text-xs font-semibold uppercase tracking-wide text-amber-800">
        Özel ürünler ({urunler.length})
      </p>
      <ul className="mt-2 space-y-1">
        {urunler.map((u) => (
          <li
            key={u.id}
            className="flex items-center justify-between gap-2 rounded-lg border border-amber-200/80 bg-amber-50/50 px-3 py-2 text-sm"
          >
            <span className="min-w-0 truncate">
              {u.ad} · {formatTl(u.fiyat)}
              <span className="ml-1 text-xs text-amber-800">(özel)</span>
            </span>
            <button
              type="button"
              onClick={() => onKaldir(u.id)}
              className="shrink-0 text-xs text-red-700 hover:underline"
            >
              Çıkar
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
