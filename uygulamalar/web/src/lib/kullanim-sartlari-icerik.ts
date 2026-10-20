import { KULLANIM_SARTLARI_YURURLUK, PLATFORM_CONTACT_EMAIL } from "@/lib/legal-contact";

export type KullanimSartlariDil = "tr" | "en";

export type KullanimSartlariBolum = {
  baslik: string;
  maddeler: string[];
};

export type KullanimSartlariMetin = {
  dil: KullanimSartlariDil;
  sayfaBaslik: string;
  yururlukEtiket: string;
  giris: string;
  bolumler: KullanimSartlariBolum[];
  iletisimBaslik: string;
  iletisimMetin: string;
  digerDilLink: { href: string; etiket: string };
};

const ortakMaddelerTr = [
  "Hizmete bot, script, tarayıcı (crawler), scraper, yapay zekâ aracı veya başka otomatik araçlarla, yazılı izin olmadan erişemez veya hizmeti kullanamazsınız.",
  "Hizmetten veya hizmet aracılığıyla sunulan veri veya içerikleri toplayamaz, kopyalayamaz, indeksleyemez veya başka şekilde elde edemezsiniz.",
  "Yazılımı, tasarımı veya içeriği tersine mühendislik yapamaz, kaynak koda dönüştüremez, kopyalayamaz veya türev çalışma oluşturamazsınız.",
  "Hizmeti rakip bir ürün geliştirmek, eğitmek veya kıyaslamak (benchmark) amacıyla kullanamazsınız.",
  "Bu şartların ihlali halinde hesabınız askıya alınabilir veya sonlandırılabilir; ihlale ilişkin ek yasal yollara başvurulabilir.",
  "Bu şartlar Türkiye Cumhuriyeti kanunlarına tabidir. Uyuşmazlıklarda Türkiye mahkemeleri ve icra daireleri yetkilidir.",
];

const ortakMaddelerEn = [
  "You may not access or use the service via bots, scripts, crawlers, scrapers, AI agents, or other automated means without our prior written permission.",
  "You may not collect, harvest, copy, index, or otherwise obtain data or content from the service.",
  "You may not reverse engineer, decompile, copy, or create derivative works from the software, design, or content.",
  "You may not use the service to build, train, or benchmark a competing product.",
  "We may suspend or terminate your account for violations of these terms; we may also pursue other legal remedies.",
  "These terms are governed by the laws of the Republic of Türkiye. The courts and enforcement offices of Türkiye have exclusive jurisdiction.",
];

export function kullanimSartlariMetni(dil: KullanimSartlariDil): KullanimSartlariMetin {
  if (dil === "en") {
    return {
      dil: "en",
      sayfaBaslik: "Terms of Use",
      yururlukEtiket: `Effective date: ${KULLANIM_SARTLARI_YURURLUK}`,
      giris:
        "These Terms of Use govern your access to and use of Sofra (QR menu, design, and adisyon services). By registering or using the service, you agree to these terms.",
      bolumler: [
        {
          baslik: "Acceptable use",
          maddeler: ortakMaddelerEn,
        },
      ],
      iletisimBaslik: "Contact",
      iletisimMetin: `Questions about these terms: ${PLATFORM_CONTACT_EMAIL}`,
      digerDilLink: { href: "/kullanim-sartlari", etiket: "Türkçe" },
    };
  }

  return {
    dil: "tr",
    sayfaBaslik: "Kullanım Şartları",
    yururlukEtiket: `Yürürlük tarihi: ${KULLANIM_SARTLARI_YURURLUK}`,
    giris:
      "Bu Kullanım Şartları, Sofra hizmetine (QR menü, tasarım ve adisyon) erişiminizi ve kullanımınızı düzenler. Kayıt olmak veya hizmeti kullanmakla bu şartları kabul etmiş olursunuz.",
    bolumler: [
      {
        baslik: "Kabul edilebilir kullanım",
        maddeler: ortakMaddelerTr,
      },
    ],
    iletisimBaslik: "İletişim",
    iletisimMetin: `Bu şartlar hakkında sorularınız için: ${PLATFORM_CONTACT_EMAIL}`,
    digerDilLink: { href: "/terms-of-use", etiket: "English" },
  };
}
