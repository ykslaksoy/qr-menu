import { PersonelIsletmeKabuk } from "@/lib/personel-layout";

export default function MutfakLayout({ children }: { children: React.ReactNode }) {
  return <PersonelIsletmeKabuk sonra="/k">{children}</PersonelIsletmeKabuk>;
}
