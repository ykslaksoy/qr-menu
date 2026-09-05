#!/usr/bin/env bash
# Sofra demoyu sıfırdan ayağa kaldırır (seed + production + tünel).
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
WEB="$ROOT/uygulamalar/web"
URLF=/tmp/sofra-public.url
LOG=/tmp/sofra-cf-keep.log
BIN=/tmp/cloudflared

cd "$WEB"
echo "==> Seed"
pnpm db:seed

echo "==> Build"
pnpm build

echo "==> Next.js"
# Eski process'leri nazikçe bırak; port doluysa kill
if curl -sf -o /dev/null --max-time 2 http://127.0.0.1:3000/; then
  echo "Port 3000 zaten ayakta"
else
  PORT=3000 pnpm start > /tmp/sofra-next.log 2>&1 &
  for _ in $(seq 1 30); do
    curl -sf -o /dev/null --max-time 2 http://127.0.0.1:3000/api/m/demo && break
    sleep 1
  done
fi

echo "==> Cloudflare tunnel"
if [[ -x "$BIN" ]]; then
  # Sadece cloudflared binary PID'lerini kapat
  pgrep -f "^$BIN tunnel" | xargs -r kill 2>/dev/null || true
  sleep 1
  : > "$LOG"
  nohup "$BIN" tunnel --protocol http2 --url http://127.0.0.1:3000 >> "$LOG" 2>&1 &
  echo $! > /tmp/sofra-cf.pid
  URL=""
  for _ in $(seq 1 40); do
    URL=$(grep -Eo 'https://[a-zA-Z0-9.-]+\.trycloudflare\.com' "$LOG" | tail -1 || true)
    [[ -n "$URL" ]] && break
    sleep 1
  done
  if [[ -z "$URL" ]]; then
    echo "Tünel URL alınamadı" >&2
    exit 1
  fi
  echo "$URL" > "$URLF"
  for _ in $(seq 1 20); do
    code=$(curl -s -o /dev/null -w "%{http_code}" --max-time 12 "$URL/api/m/demo" || echo 000)
    [[ "$code" == "200" ]] && break
    sleep 2
  done
else
  echo "cloudflared yok: $BIN" >&2
  URL="http://127.0.0.1:3000"
  echo "$URL" > "$URLF"
fi

cat > /tmp/sofra-links.txt <<EOF
Sofra demo (geçici tünel — yeniden başlayınca değişebilir)

Müşteri menü:  $URL/m/demo?masa=1&siparis=1
Garson:        $URL/api/auth/demo/garson
Mutfak:        $URL/api/auth/demo/mutfak
Şube yönetici: $URL/api/auth/demo/yonetici
Zincir:        $URL/api/auth/demo/zincir
Platform:      $URL/api/auth/demo/platform
Giriş (roller): $URL/giris
EOF

echo
cat /tmp/sofra-links.txt
