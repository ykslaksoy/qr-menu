export type KvkkAyarlari = {
  aydinlatmaMetni: string;
  cerezMetni: string;
  /** Müşteri menüsünde link göster */
  yayinda: boolean;
};

export const VARSAYILAN_AYDINLATMA = `6698 sayılı Kişisel Verilerin Korunması Kanunu (“KVKK”) kapsamında veri sorumlusu sıfatıyla işletmemiz, QR menü ve sipariş hizmetleri sırasında işlenen kişisel verileriniz hakkında sizi bilgilendirmektedir.

İşlenen veriler: menü görüntüleme, masa numarası, sipariş içeriği ve ödeme bilgileri (ödeme altyapısı üzerinden).

Amaç: siparişin alınması, hazırlanması ve yasal yükümlülüklerin yerine getirilmesi.

Haklarınız: KVKK m.11 uyarınca erişim, düzeltme, silme ve itiraz taleplerinizi işletmemize yazılı olarak iletebilirsiniz.`;

export const VARSAYILAN_CEREZ = `Bu dijital menü, hizmetin çalışması için gerekli teknik çerezler ve oturum bilgileri kullanabilir. Üçüncü taraf reklam çerezleri kullanılmaz.

Tarayıcı ayarlarından çerezleri yönetebilirsiniz; bazı işlevler kısıtlanabilir.

Detaylı bilgi için KVKK aydınlatma metnine bakın.`;

export function varsayilanKvkk(): KvkkAyarlari {
  return {
    aydinlatmaMetni: VARSAYILAN_AYDINLATMA,
    cerezMetni: VARSAYILAN_CEREZ,
    yayinda: false,
  };
}

/** Kayıtta metin yoksa hazır şablonu doldurur; yayın varsayılan kapalı. */
export function kvkkBirlestir(k?: KvkkAyarlari | null): KvkkAyarlari {
  const temel = varsayilanKvkk();
  if (!k) return temel;
  return {
    yayinda: k.yayinda ?? false,
    aydinlatmaMetni: k.aydinlatmaMetni?.trim() ? k.aydinlatmaMetni : temel.aydinlatmaMetni,
    cerezMetni: k.cerezMetni?.trim() ? k.cerezMetni : temel.cerezMetni,
  };
}
