import { redirect } from "next/navigation";
import { referansSlugDogrula } from "@/lib/referans";

type Props = {
  params: Promise<{ slug: string }>;
};

/** Eski davet linkleri menü QR sayfasına yönlendirilir. */
export default async function DavetYonlendirPage({ params }: Props) {
  const { slug } = await params;
  if (!referansSlugDogrula(slug)) {
    redirect("/kayit");
  }
  redirect(`/m/${slug}?masa=1`);
}
