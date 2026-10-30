export const BAGLANTI_NOTU = "Bağlantı yapılacak — anahtarları sonra gireceksiniz.";

export function BaglantiUyari({ konu }: { konu: string }) {
  return (
    <p className="rounded-md border border-amber-300 bg-amber-50 px-3 py-2 text-xs text-amber-900">
      <strong>{konu}:</strong> {BAGLANTI_NOTU} Şimdilik mevcut yedek davranış kullanılıyor.
    </p>
  );
}
