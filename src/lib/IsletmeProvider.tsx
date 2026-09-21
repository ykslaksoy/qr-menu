"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { MOD_ETIKET, type SofraMod } from "@/lib/mod";
import {
  isletmeOku,
  isletmeYaz,
  ornekIsletme,
  type Isletme,
} from "@/lib/store";

export type AdminOzet = {
  toplamIsletme: number;
  toplamSiparisBuAy: number;
  kotaAsan: number;
  ucretsiz: number;
  odemeli: number;
};

export type Impersonating = {
  slug: string;
  kafeAdi: string;
  /** Zincir yöneticisi şubeye girdi */
  subeden?: boolean;
};

type AuthYanit = {
  user?: { id: string; email: string; platformAdmin?: boolean } | null;
  isletme?: Isletme | null;
  mod?: SofraMod | null;
  modSecenekleri?: SofraMod[];
  impersonating?: Impersonating | null;
  adminOzet?: AdminOzet | null;
};

export type IsletmeBaslangic = {
  isletme: Isletme | null;
  oturumlu: boolean;
  platformAdmin: boolean;
  mod: SofraMod | null;
  modSecenekleri?: SofraMod[];
  impersonating?: Impersonating | null;
  adminOzet?: AdminOzet | null;
};

type IsletmeContextValue = {
  isletme: Isletme | null;
  hazir: boolean;
  oturumlu: boolean;
  platformAdmin: boolean;
  impersonating: Impersonating | null;
  adminOzet: AdminOzet | null;
  mod: SofraMod | null;
  modEtiket: string | null;
  modSecenekleri: SofraMod[];
  kaydet: (sonraki: Isletme) => Promise<void>;
  olustur: (kafeAdi: string, slug: string, ekstra?: Partial<Isletme>) => Isletme;
  yenile: () => Promise<Isletme | null>;
};

const IsletmeContext = createContext<IsletmeContextValue | null>(null);

async function authCek(signal?: AbortSignal): Promise<AuthYanit> {
  const yanit = await fetch("/api/auth", {
    credentials: "include",
    cache: "no-store",
    signal,
  });
  return (await yanit.json()) as AuthYanit;
}

export function IsletmeProvider({
  children,
  baslangic = null,
}: {
  children: ReactNode;
  baslangic?: IsletmeBaslangic | null;
}) {
  const [isletme, setIsletme] = useState<Isletme | null>(baslangic?.isletme ?? null);
  // Sunucu verisi varsa hemen hazır — "Yükleniyor" takılması olmaz
  const [hazir, setHazir] = useState(() => Boolean(baslangic?.oturumlu || baslangic?.isletme));
  const [oturumlu, setOturumlu] = useState(Boolean(baslangic?.oturumlu));
  const [platformAdmin, setPlatformAdmin] = useState(Boolean(baslangic?.platformAdmin));
  const [impersonating, setImpersonating] = useState<Impersonating | null>(
    baslangic?.impersonating ?? null,
  );
  const [adminOzet, setAdminOzet] = useState<AdminOzet | null>(baslangic?.adminOzet ?? null);
  const [mod, setMod] = useState<SofraMod | null>(baslangic?.mod ?? null);
  const [modSecenekleri, setModSecenekleri] = useState<SofraMod[]>(
    baslangic?.modSecenekleri ?? [],
  );

  const yenile = useCallback(async () => {
    const kontrol = new AbortController();
    const zaman = setTimeout(() => kontrol.abort(), 8000);
    try {
      const veri = await authCek(kontrol.signal);
      if (veri.user) {
        setOturumlu(true);
        setPlatformAdmin(Boolean(veri.user.platformAdmin));
        setImpersonating(veri.impersonating ?? null);
        setAdminOzet(veri.adminOzet ?? null);
        setMod(veri.mod ?? null);
        setModSecenekleri(veri.modSecenekleri ?? []);
        if (veri.isletme) {
          setIsletme(veri.isletme);
          isletmeYaz(veri.isletme);
          return veri.isletme;
        }
        setIsletme(null);
        return null;
      }
      const yerel = isletmeOku();
      setIsletme(yerel);
      setOturumlu(false);
      setPlatformAdmin(false);
      setImpersonating(null);
      setAdminOzet(null);
      setMod(null);
      setModSecenekleri([]);
      return yerel;
    } catch {
      return isletme;
    } finally {
      clearTimeout(zaman);
      setHazir(true);
    }
  }, [isletme]);

  useEffect(() => {
    if (baslangic?.isletme) isletmeYaz(baslangic.isletme);
    void yenile();
    // yalnızca mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const kaydet = useCallback(
    async (sonraki: Isletme) => {
      isletmeYaz(sonraki);
      setIsletme(sonraki);
      if (oturumlu) {
        await fetch("/api/auth", {
          method: "PUT",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(sonraki),
        });
      }
    },
    [oturumlu],
  );

  const olustur = useCallback((kafeAdi: string, slug: string, ekstra?: Partial<Isletme>) => {
    const yeni = ornekIsletme(kafeAdi, slug, ekstra);
    isletmeYaz(yeni);
    setIsletme(yeni);
    return yeni;
  }, []);

  const value = useMemo<IsletmeContextValue>(
    () => ({
      isletme,
      hazir,
      oturumlu,
      platformAdmin,
      impersonating,
      adminOzet,
      mod,
      modEtiket: mod ? MOD_ETIKET[mod] : null,
      modSecenekleri,
      kaydet,
      olustur,
      yenile,
    }),
    [
      isletme,
      hazir,
      oturumlu,
      platformAdmin,
      impersonating,
      adminOzet,
      mod,
      modSecenekleri,
      kaydet,
      olustur,
      yenile,
    ],
  );

  return <IsletmeContext.Provider value={value}>{children}</IsletmeContext.Provider>;
}

export function useIsletme(): IsletmeContextValue {
  const ctx = useContext(IsletmeContext);
  if (!ctx) {
    throw new Error("useIsletme IsletmeProvider içinde kullanılmalı");
  }
  return ctx;
}
