import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  MOD_ANA_YOL,
  MOD_COOKIE,
  korunanYolMu,
  modGecerliMi,
  modYolaErisir,
  type SofraMod,
} from "@/lib/mod";

const SESSION_COOKIE = "sofra_session";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (!korunanYolMu(pathname)) {
    return NextResponse.next();
  }

  const oturum = request.cookies.get(SESSION_COOKIE)?.value;
  if (!oturum) {
    const url = request.nextUrl.clone();
    url.pathname = "/giris";
    url.searchParams.set("sonra", pathname);
    return NextResponse.redirect(url);
  }

  const modHam = request.cookies.get(MOD_COOKIE)?.value;
  if (!modGecerliMi(modHam)) {
    const url = request.nextUrl.clone();
    url.pathname = "/giris";
    url.searchParams.set("sonra", pathname);
    return NextResponse.redirect(url);
  }

  const mod = modHam as SofraMod;

  if (!modYolaErisir(mod, pathname)) {
    const url = request.nextUrl.clone();
    url.pathname = MOD_ANA_YOL[mod];
    url.search = "";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin",
    "/admin/:path*",
    "/subeler",
    "/subeler/:path*",
    "/panel",
    "/panel/:path*",
    "/g",
    "/g/:path*",
    "/k",
    "/k/:path*",
    "/mod",
  ],
};
