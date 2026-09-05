# Referans programı

## Özet

Referans koduyla gelen işletme **ve** getiren işletme kazanır — ikisi de yıllık ücretli planda olmalı.

| Taraf | İndirim | Süre |
|-------|---------|------|
| **Davet edilen** (yeni) | **%15** | İlk **3 ay** |
| **Referans veren** (getiren) | **%15** | Referans başına **3 ay** |

Konfigürasyon: `config/referans.json`

---

## Nasıl çalışır?

### Davet edilen (yeni işletme)
1. `SOFRA-cafe-ada` gibi bir kodla kayıt olur.
2. **Yıllık ücretli plan** seçer (Menü, Menü+Adisyon veya Tam Paket).
3. İlk **3 ay boyunca %15 indirim** alır.

---

## İki müşteri bulursa?

Oran aynı kalır (**%15**), süre **uzar**:

| Senaryo | Sonuç |
|---------|-------|
| 1 yıllık referans | **3 ay** %15 |
| 2 yıllık referans | **6 ay** %15 |
| 3 yıllık referans | **9 ay** %15 |

Süreler kuyruk mantığıyla işler; bir referansın 3 ayı biter, sonraki devreye girer.

---

## Yıllık şart — kimler dahil?

| Durum | Referans sayılır mı? | İndirim alır mısınız? |
|-------|----------------------|------------------------|
| Siz yıllık, davet edilen yıllık | Evet | Evet — 3 ay %15 |
| Siz aylık, davet edilen yıllık | Evet (beklemede) | Hayır — yıllığa geçince başlar |
| Siz yıllık, davet edilen aylık | Hayır | Hayır — yıllığa geçince sayılır |
| Ücretsiz plan | Hayır | Hayır |

---

## Örnek (Menü + Adisyon yıllık)

- Yıllık liste fiyatı: ₺6.990
- 3 ay %15 indirim ≈ **₺262** tasarruf (o dönem için)
- 2 referans = 6 ay ≈ **₺524** tasarruf

> Yıllık planda zaten ~%17 ödeme indirimi var; referans %15’i bu fiyat üzerinden uygulanır (fatura motorunda netleştirilecek).

---

## Kurallar

- İndirim **referans veren** işletmenin aboneliğine uygulanır.
- Aylık abonelikte referans indirimi **yok** — teşvik yıllık aboneliğe yönlendirir.
- Davet edilen iptal ederse kalan süre düşülmez; hak zaten kazanılmış sayılır.
- Kendi kodunuzu kullanmak geçersiz.
- Davet edilen tarafa otomatik indirim yok.

---

## Veritabanı (sonraki sprint)

```text
ReferansKayit
├── davetEdenIsletmeId
├── davetEdilenIsletmeId
├── davetEdilenOdemeTipi
├── durum: beklemede | aktif | iptal
└── aktifOlmaTarihi

ReferansIndirimHakki
├── isletmeId
├── tip: getiren | gelen
├── kalanAy
├── indirimOrani    # 0.15
└── bitisTarihi
```

---

## Pazarlama metni

> Referans koduyla yıllık al: ilk 3 ay %15 indirim. Getiren de 3 ay %15 kazanır.

WhatsApp:
> Sofra’ya geçiyorum — yıllık alırsan kayıtta SOFRA-cafe-ada yaz, ilk 3 ay %15 indirim alırsın; ben de 3 ay %15 kazanırım.
