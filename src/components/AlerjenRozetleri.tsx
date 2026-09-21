import { alerjenRozet } from "@/lib/alerjen-etiketleri";
import { alerjenCevir, alerjenKisaCevir, type MenuDil } from "@/lib/menu-dil";

type Props = {
  alerjenler?: string[] | null;
  kalori?: number | null;
  /** compact = kart; genis = detay modal */
  boyut?: "compact" | "genis";
  anaRenk?: string;
  dil?: MenuDil;
};

export function AlerjenRozetleri({
  alerjenler,
  kalori,
  boyut = "compact",
  anaRenk,
  dil = "tr",
}: Props) {
  if (!alerjenler?.length && kalori == null) return null;

  const kucuk = boyut === "compact";

  return (
    <div className={`flex flex-wrap items-center gap-1.5 ${kucuk ? "mt-1.5" : "mt-3"}`}>
      {alerjenler?.map((a) => {
        const r = alerjenRozet(a);
        const etiket = kucuk ? alerjenKisaCevir(a, dil) : alerjenCevir(a, dil);
        return (
          <span
            key={a}
            title={alerjenCevir(a, dil)}
            className={`inline-flex items-center gap-0.5 rounded-full font-medium ${
              kucuk ? "px-1.5 py-0.5 text-[10px]" : "px-2 py-1 text-xs"
            }`}
            style={{
              background: (anaRenk ?? "#1f6f5b") + "14",
              color: anaRenk ?? undefined,
            }}
          >
            <span aria-hidden>{r.ikon}</span>
            {etiket}
          </span>
        );
      })}
      {kalori != null ? (
        <span
          className={`inline-flex items-center rounded-full bg-black/5 font-medium ${
            kucuk ? "px-1.5 py-0.5 text-[10px]" : "px-2 py-1 text-xs"
          } opacity-70`}
        >
          ~{kalori} kcal
        </span>
      ) : null}
    </div>
  );
}
