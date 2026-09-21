import { redirect } from "next/navigation";

/** Eski halka açık URL — yönetici paneline yönlendirilir (oturum gerekir). */
export default function KarsilastirmaRedirectPage() {
  redirect("/panel/sofra-farki");
}
