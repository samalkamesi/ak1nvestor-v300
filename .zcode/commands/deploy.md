---
description: Leverera AK1A-kod till prod (typkontroll → commit → push → bygge → verifiering)
---

Följ leverera-kod-färdigheten exakt:

1. `npx tsc --noEmit` — 0 nya fel mot baslinjen 36
2. Commit:a ändringar (svenskt meddelande, "studio:"-prefix, små steg)
3. `git push prod develop`
4. Bygg på servern: `cd /home/ak1a/AK1 && npm ci --no-audit --no-fund && npm run build && pm2 restart ak1a`
5. Verifiera `https://lab.ak1nvestor.com/` = 200

Vid byggefel: `git revert HEAD` → pusha → bygg om — prod lämnas ALDRIG
trasig. Rör ALDRIG .env*, nycklar eller betalningsfiler. Priser/domän/
juridik = R2 (väntar kund). $ARGUMENTS
