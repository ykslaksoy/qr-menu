import { redirect } from "next/navigation";
import { adminYetkiKontrol } from "@/lib/auth-server";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await adminYetkiKontrol();
  if (!user) {
    redirect("/giris?sonra=/admin");
  }

  return <div className="sofra-mesh min-h-full">{children}</div>;
}
