#!/usr/bin/env bash
# AK1A-AGENTEN PÅ CONTABO — ZCode i tmux (överlever nedkoppling).
# Användning:
#   ~/starta-zcode.sh               → startar/ansluter agenten i tmux
#   ~/starta-zcode.sh NYCKEL 'sk-…' → engångs: sätter Z.AI API-nyckeln i config
# I tmux: skriv som vanligt; koppla ner med Ctrl-b d; anslut igen med samma kommando.
export PATH="$HOME/.npm-global/bin:$PATH"

if [ "$1" = "NYCKEL" ]; then
  python3 - "$2" << 'PY'
import json, sys, os
p = os.path.expanduser('~/.zcode/cli/config.json')
c = json.load(open(p))
c.setdefault('provider', {}).setdefault('zai', {}).setdefault('options', {})['apiKey'] = sys.argv[1]
json.dump(c, open(p, 'w'), indent=2)
print('API-nyckeln är satt i config.json')
PY
  chmod 600 ~/.zcode/cli/config.json
  exit 0
fi

cd /home/ak1a/agent/ak1
if tmux has-session -t zcode 2>/dev/null; then
  tmux attach-session -t zcode
else
  tmux new-session -s zcode zcode
fi
