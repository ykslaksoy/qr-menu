import { PersonelIsletmeKabuk } from "@/lib/personel-layout";

export default function GarsonLayout({ children }: { children: React.ReactNode }) {
  return <PersonelIsletmeKabuk sonra="/g">{children}</PersonelIsletmeKabuk>;
}
