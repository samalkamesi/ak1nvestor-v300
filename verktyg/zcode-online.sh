#!/usr/bin/env bash
# ZCODE-ONLINE — kundens startare för interaktiv Z Code på servern (arbetsstation 2, 2026-10-01)
# Syfte: kunden vill prata med agenten i FULL Z Code-kvalitet via SSH/Termius,
# med session som OVERLEVER att Termius stängs (tmux) — allt sparat server-side.
# Användning:
#   bash verktyg/zcode-online.sh            → hitta binären + guida
#   bash verktyg/zcode-online.sh --start    → starta/återanslut i tmux-sessionen "zcode"

set -u

hitta_binär() {
  for kandidat in zcode zcode-cli zkod; do
    if command -v "$kandidat" >/dev/null 2>&1; then
      command -v "$kandidat"
      return 0
    fi
  done
  # kända installationsvägar som fallback
  for vag in "$HOME/.zcode/bin/zcode" "$HOME/.local/bin/zcode" "/usr/local/bin/zcode"; do
    if [ -x "$vag" ]; then
      echo "$vag"
      return 0
    fi
  done
  return 1
}

BIN="$(hitta_binär || true)"
if [ -z "${BIN:-}" ]; then
  echo "Z Code-binären hittades ej på vanliga vägar."
  echo "Kontrollera installationen (npm ls -g | grep -i zcode) och komplettera denna startare."
  exit 1
fi

if [ "${1:-}" = "--start" ]; then
  if command -v tmux >/dev/null 2>&1; then
    if tmux has-session -t zcode 2>/dev/null; then
      echo "Sessionen 'zcode' lever — återansluter (stäng med Ctrl+B sedan D)."
      exec tmux attach -t zcode
    fi
    echo "Startar ny session 'zcode' (avsluta ALDRIG med exit — stäng fliken, sessionen lever)."
    exec tmux new -s zcode "$BIN"
  fi
  echo "tmux saknas — startar direkt (sessionen dör då terminalen stängs)."
  exec "$BIN"
fi

echo "Z Code hittat: $BIN"
echo "Starta med:    bash verktyg/zcode-online.sh --start"
