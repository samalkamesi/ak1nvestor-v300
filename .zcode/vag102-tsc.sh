#!/usr/bin/env bash
# Våg 102: fristående tsc-körning — skriver /tmp/tsc-vag102.log + flaggfil.
# Finns i arbetsytan (skrivningar utanför kräver godkännande som klienten
# inte kan visa); startar tsc i egen session med stängda fd:o och returnerar
# direkt så studio-klientens 30 s-gräns aldrig nås.
LOG=/home/ak1a/agent/ak1/.zcode/tsc-vag102.log
MARK=/home/ak1a/agent/ak1/.zcode/tsc-vag102.flagga
rm -f "$MARK"
setsid bash -c "cd /home/ak1a/agent/ak1 && npx tsc --noEmit > '$LOG' 2>&1; ec=\$?; echo \"exit=\$ec\" >> '$LOG'; touch '$MARK'" < /dev/null > /dev/null 2>&1 &
echo "tsc startad i egen session"
