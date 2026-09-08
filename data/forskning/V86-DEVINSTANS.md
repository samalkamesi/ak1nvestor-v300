# V86 — DEVINSTANS på prod-servern (Contabo)

Datum: 2026-09-08 (våg 86) · Agent: V86-DEVINSTANS · Underlag: STYRELSE-VAG84-PLAN.md §d (H2-design: pm2 + nginx + basic-auth = enda telefon-kompatibla skyddet) · "Servern är datorn"-lagen.

Status: BYGGD OCH VERIFIERAD. Testytan är live.

## Arkitektur

```
Arbetsstation → git push → ~/AK1 (prod-checkout, HAR INGA remotes)
                                │
                                └─ origin → /home/ak1a/AK1-test (egen checkout, klona d4527c2)
                                              │
pm2 'ak1a-test'  =  node node_modules/next/dist/bin/next -- start -p 3100
                                              │
nginx 'ak1a-test' =  listen 80 · server_name test.ak1nvestor.com (exakt match)
                     auth_basic (/etc/nginx/.htpasswd-ak1a, användare 'ak1a')
                     X-Robots-Tag: noindex, nofollow (always)
                     proxy_pass → 127.0.0.1:3100
```

- **Isolering från prod:** test-instansen rör ALDRIG pm2 'ak1a', nginx-siten 'ak1a' (lab.ak1nvestor.com, port 3000) eller ~/AK1. Egna artefakter: katalog `~/AK1-test`, pm2-app `ak1a-test`, nginx-site `ak1a-test` + `/etc/nginx/.htpasswd-ak1a`.
- **Portfrågan (utrett):** package.json `start` = `next start -p 3000` — hårdkodad flagga slår PORT-env, så `PORT=3100 pm2 start npm -- start` hade krockat med prod på 3000. Lösning: pm2 startar next-binären direkt med args `start -p 3100` (args + cwd persistenteras av pm2, överlever `pm2 restart` — verifierat).
- **.env:** gitignorerad — kopierades från ~/AK1/.env vid setup. Om prod .env ändras: `cp ~/AK1/.env ~/AK1-test/.env` + `pm2 restart ak1a-test`.
- **Ingen DNS/certbot för test:** test.ak1nvestor.com pekar ej hit. Nås via Host-header (nedan). Nginx väljer exakt server_name-match före prod-sitens `_`-catch-all (som svarar 404 på okända hostar + 301 för lab → https).
- **UFW:** oförändrad — port 80/443/SSH redan öppna, inga nya portar mot internet. 3100 binder endast lokalt (127.0.0.1).
- **Skyddslager:** basic-auth (htpasswd apr1-hash, fil 640 root:www-data) + obscurs hostname + noindex. ALDRIG index; siten sänder `X-Robots-Tag: noindex, nofollow` på ALLA svar (always), även 401.
- **Boot:** `pm2 save` körd (båda apparna i dump.pm2), systemd `pm2-ak1a` är enabled.

## Åtkomst (lösenord distribueras EN gång via styrelsekanal — står ej i repot)

```
curl -H 'Host: test.ak1nvestor.com' http://5.189.162.162/            → 401
curl -u ak1a:<pw> -H 'Host: test.ak1nvestor.com' http://5.189.162.162/ → 200, sidan innehåller AK1A
```

Rotation vid behov: `openssl passwd -apr1 '<nytt>' | sudo tee /etc/nginx/.htpasswd-ak1a` (format `ak1a:<hash>`).

## Test-deploy — arbetsgång

1. **Leverera kod till servern** (befintligt flöde): push/överför så att ~/AK1 (prod-checkout) har target-commit.
2. **Uppdatera test:** `cd ~/AK1-test && git pull` (origin = /home/ak1a/AK1).
3. **Bygg:** `cd ~/AK1-test && npm ci && npm run build` (~5–8 min på 4 kärnor; kör gärna med nohup + logg).
4. **Starta om:** `pm2 restart ak1a-test` (port 3100 sitter i pm2-args, ingen env krävs).
5. **Verifiera (INNAN prod-deploy):** 401 utan auth + 200 med auth + AK1A-innehåll, både inifrån (`curl -H 'Host: test.ak1nvestor.com' http://127.0.0.1/`) och utifrån (Host-header mot 5.189.162.162). Kolla även `pm2 logs ak1a-test --err`.
6. **Godkänt? → prod-deploy** i prod-kataloget enligt befintlig rutin (~/AK1: pull/ci/build + `pm2 restart ak1a`). Misslyckat? prod opåverkad — fixa och gör om steg 2–5.

## Verifieringsresultat 2026-09-08 ( Commit d4527c2)

| Test | Inifrån servern | Utifrån arbetsstationen |
|---|---|---|
| Utan auth | 401 | 401 |
| Med auth `ak1a` | 200, "AK1A" x2 i HTML | 200, "AK1A" x2 i HTML |
| Fel lösenord | 401 | — |
| X-Robots-Tag | noindex, nofollow | noindex, nofollow |
| Prod oskadd | lab→301, okänd host→404, :3000→200 | lab→301 |
| Omstart uthållighet | `pm2 restart ak1a-test` → :3100 fortfarande 200 | — |

Observation: parallell prod-deploy (v88, ~/AK1 .next/node_modules + pm2-restart av 'ak1a' kl 22:42, graceful SIGINT kod 0) pågick samtidigt som test-bygget — inga krockar; test-instansen påverkade inte prod.

## Skötsel

- `pm2 logs ak1a-test` / `pm2 monit`; minnesbild ~190–230 MB under drift.
- Riv testytan: `pm2 delete ak1a-test && pm2 save && sudo rm /etc/nginx/sites-enabled/ak1a-test && sudo nginx -t && sudo systemctl reload nginx && rm -rf ~/AK1-test`.
- När test-domänen får DNS + certbot: kör certbot --nginx -d test.ak1nvestor.com (siten är förberedd; auth + noindex blir kvar).

— Agent V86-DEVINSTANS, AI-styrelsen AK1A (våg 86, 2026-09-08)
