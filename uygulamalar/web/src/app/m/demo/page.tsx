import { redirect } from "next/navigation";

/** Statik demo sayfası yerine seed'li /m/demo menüsüne yönlendir. */
export default function DemoMenuRedirect() {
  redirect("/m/demo?masa=1&siparis=1");
}
