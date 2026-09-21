"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { formatTl } from "@/lib/abonelik";
import {
  sesliSiparisParse,
  uyariMesaji,
  type SesliKalem,
  type SesliUyari,
  type SesliUrun,
} from "@/lib/sesli-siparis-parser";
import type { Urun } from "@/lib/store";

type Props = {
  urunler: Urun[];
  onOnayla: (kalemler: SesliKalem[]) => void;
  disabled?: boolean;
};

export function SesliSiparisAl({ urunler, onOnayla, disabled }: Props) {
  const [dinleniyor, setDinleniyor] = useState(false);
  const [metin, setMetin] = useState("");
  const [kalemler, setKalemler] = useState<SesliKalem[]>([]);
  const [uyarilar, setUyarilar] = useState<SesliUyari[]>([]);
  const [destekleniyor, setDestekleniyor] = useState(true);
  const tanimaRef = useRef<SpeechRecognition | null>(null);

  const parseEt = useCallback(
    (ham: string) => {
      const sonuc = sesliSiparisParse(ham, urunler);
      setKalemler(sonuc.kalemler);
      setUyarilar(sonuc.uyarilar);
    },
    [urunler],
  );

  useEffect(() => {
    const SR =
      typeof window !== "undefined"
        ? window.SpeechRecognition || (window as unknown as { webkitSpeechRecognition?: typeof SpeechRecognition }).webkitSpeechRecognition
        : null;
    if (!SR) {
      setDestekleniyor(false);
      return;
    }
    const rec = new SR();
    rec.lang = "tr-TR";
    rec.continuous = false;
    rec.interimResults = true;
    rec.onresult = (e: SpeechRecognitionEvent) => {
      let interim = "";
      let final = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const t = e.results[i]![0]!.transcript;
        if (e.results[i]!.isFinal) final += t;
        else interim += t;
      }
      const birlesik = (final || interim).trim();
      if (birlesik) {
        setMetin(birlesik);
        if (final) parseEt(birlesik);
      }
    };
    rec.onend = () => setDinleniyor(false);
    rec.onerror = () => setDinleniyor(false);
    tanimaRef.current = rec;
  }, [parseEt]);

  function dinlemeyiBaslat() {
    if (!tanimaRef.current || disabled) return;
    setMetin("");
    setKalemler([]);
    setUyarilar([]);
    setDinleniyor(true);
    tanimaRef.current.start();
  }

  function dinlemeyiDurdur() {
    tanimaRef.current?.stop();
    setDinleniyor(false);
  }

  function oneriSec(uyari: SesliUyari, urun: SesliUrun) {
    setKalemler((k) => {
      const mevcut = k.find((x) => x.urun.id === urun.id);
      if (mevcut) return k.map((x) => (x.urun.id === urun.id ? { ...x, adet: x.adet + 1 } : x));
      return [...k, { urun, adet: 1 }];
    });
    setUyarilar((u) => u.filter((x) => x !== uyari));
  }

  return (
    <div className="space-y-4 rounded-2xl border border-line bg-card p-4">
      <div>
        <h3 className="font-semibold">Sesli sipariş</h3>
        <p className="mt-1 text-xs text-muted">
          Mikrofona basın, siparişi söyleyin. Örn: &quot;İki latte, bir tost ve limonata&quot;
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {destekleniyor ? (
          <button
            type="button"
            disabled={disabled}
            onClick={dinleniyor ? dinlemeyiDurdur : dinlemeyiBaslat}
            className={`rounded-full px-5 py-2.5 text-sm font-semibold ${
              dinleniyor
                ? "bg-red-600 text-white animate-pulse"
                : "bg-brand text-white disabled:opacity-50"
            }`}
          >
            {dinleniyor ? "● Dinleniyor — durdur" : "🎤 Siparişi söyle"}
          </button>
        ) : (
          <p className="text-sm text-amber-800">Tarayıcı ses tanımayı desteklemiyor; metin kutusunu kullanın.</p>
        )}
      </div>

      <label className="block text-sm">
        veya yazın
        <textarea
          value={metin}
          onChange={(e) => {
            setMetin(e.target.value);
            if (e.target.value.trim()) parseEt(e.target.value);
            else {
              setKalemler([]);
              setUyarilar([]);
            }
          }}
          rows={2}
          placeholder="2 filtre kahve, bir çay..."
          className="mt-1 w-full rounded-xl border border-line bg-background px-3 py-2 text-sm"
          disabled={disabled}
        />
      </label>

      {uyarilar.length > 0 ? (
        <ul className="space-y-2">
          {uyarilar.map((u, i) => (
            <li key={i} className="rounded-xl border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-950">
              <p>{uyariMesaji(u)}</p>
              {u.oneriler.length > 0 ? (
                <div className="mt-2 flex flex-wrap gap-2">
                  {u.oneriler.map((o) => (
                    <button
                      key={o.id}
                      type="button"
                      onClick={() => oneriSec(u, o)}
                      className="rounded-full border border-amber-400 bg-white px-3 py-1 text-xs font-medium hover:bg-amber-100"
                    >
                      {o.ad} · {formatTl(o.fiyat)}
                    </button>
                  ))}
                </div>
              ) : null}
            </li>
          ))}
        </ul>
      ) : null}

      {kalemler.length > 0 ? (
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">Adisyona eklenecek</p>
          <ul className="mt-2 space-y-1 text-sm">
            {kalemler.map((k) => (
              <li key={k.urun.id} className="flex justify-between">
                <span>
                  {k.adet}× {k.urun.ad}
                </span>
                <span className="text-muted">{formatTl(k.urun.fiyat * k.adet)}</span>
              </li>
            ))}
          </ul>
          <button
            type="button"
            disabled={disabled}
            onClick={() => {
              onOnayla(kalemler);
              setMetin("");
              setKalemler([]);
              setUyarilar([]);
            }}
            className="mt-3 rounded-full bg-brand px-5 py-2 text-sm font-semibold text-white disabled:opacity-50"
          >
            Adisyona ekle
          </button>
        </div>
      ) : null}
    </div>
  );
}
