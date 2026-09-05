import { redirect } from "next/navigation";

/** Eski Tasarım rotası → Ayarlar (şablon seçimi burada). */
export default function PanelTasarimRedirect() {
  redirect("/panel/ayarlar");
}
