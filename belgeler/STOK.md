# Stok kontrolü (satıştan düşüm)

## Karar
Sofra’da **satılan üründen stok kontrolü** yapılır.
“Ağır stok” (malzeme kilosu, reçete, fire muhasebesi) **yok / sonra**.

## Model (basit)

```text
Ürün: Filtre Kahve
  stokTakibi: açık
  kalanAdet: 40

Sipariş / adisyon onayı (satış)
  → kalanAdet -= satılan adet

kalanAdet <= kritikSeviye  → uyarı (sarı)
kalanAdet <= 0            → menüde tükendi modu (aşağıdaki UX)
```

## Menüde tükendi UX (müşteri)

Stok bittiğinde (`kalanAdet <= 0` veya `tukendiMi`):

| Davranış | Kural |
|----------|--------|
| Görünüm | **Silik** (~%45 opacity), hafif gri ton |
| Etiket | **“Tükendi”** rozeti |
| Tıklama | **Kapalı** — sepete eklenemez, detay açılmaz |
| Erişilebilirlik | `aria-disabled`, `pointer-events: none` |
| Liste | Ürün **silinmez**; menüde kalır ama pasif (garson “bitti” bilir) |

Stok tekrar eklendiğinde (`kalanAdet > 0`) normal görünüm ve tıklama geri gelir.

**Sipariş modu:** Tükenen ürün butonu yok; tıklanamaz kart.

**Sadece menü (sipariş yok):** Yine silik + tıklanamaz; fiyat okunabilir kalabilir.

## Ürün alanları

| Alan | Açıklama |
|------|----------|
| `stokTakibi` | Açık / kapalı (içki-atıştırmalık için açık; sınırsız ürünlerde kapalı) |
| `kalanAdet` | Güncel adet |
| `kritikSeviye` | Örn. 5 — altında uyarı |
| `tukendiMi` | 0’da veya elle kapatınca true |

## Ne zaman düşer?

| Olay | Stok |
|------|------|
| QR / garson siparişi **onaylandı** veya adisyona yazıldı | −adet |
| İptal / iade | +adet (geri ekle) |
| İkram (stok düşsün mü?) | Varsayılan: **düşer** (malzeme gider) |
| Sadece menü görüntüleme | Değişmez |

## Panelde ne görünür?

- Ürün listesinde kalan adet
- Kritikte uyarı rozeti
- “Stok ekle” (mal geldiğinde elle +10)
- Tükenenler menüde **silik + tıklanamaz + “Tükendi”** (`MenuUrunKarti`)

## Yapılmayan (ağır stok — sonra)

- Et/kg, sos ml reçetesi
- Tedarikçi siparişi
- Sayım / depo transferi
- Maliyet hesabı (food cost %)

## MVP sırası

Menü CRUD ile birlikte veya hemen sonra:
1. Ürüne `kalanAdet` + `stokTakibi`
2. Satışta otomatik düşüm
3. Tükendi → menüde kapat
4. Kritik uyarı

Ayrıntılı depo modülü backlog’da kalır.
