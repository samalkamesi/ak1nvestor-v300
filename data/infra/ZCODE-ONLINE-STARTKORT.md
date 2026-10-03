# Z CODE ONLINE — KUNDENS STARTKORT (arbetsstation 2, 2026-10-01)

> Din ingång till ÄKTA Z Code-kvalitet via servern — från mobil, platta eller
> valfri dator. Sessionen lever på SERVERN och överlever att du stänger appen.

## Tre steg

1. **Öppna Termius** (eller valfri SSH-app) och anslut:
   `ssh ak1a@lab.ak1nvestor.com`
   (adressen följer alltid den aktuella servern — du behöver aldrig minnas IP)

2. **Starta Z Code:**
   `bash verktyg/zcode-online.sh --start`
   (första gången startar den en persistent session som heter "zcode")

3. **Prata med agenten** — samma motor och kvalitet som skrivbordsappen,
   direkt i serverns filer. Allt sparas på servern (oberoende av datorer).

## Nyckeln: sessionen överlever

Starthjälparen använder **tmux**: stäng Termius när du vill — sessionen lever
kvar på servern. Nästa gång du ansluter kör du samma kommando och är TILLBAKA
exakt där du lämnade (samma samtal, samma kontext). Avsluta ALDRIG med
"exit" inuti sessionen — stäng bara fliken.

## Om du föredrar råa kommandon

- Starta motorn direkt: `zcode`
- Persistent session: `tmux new -s zcode` → `zcode` inuti; återanslut: `tmux attach -t zcode`

## Underhåll

- Starthjälparen: `verktyg/zcode-online.sh` (hittar binären automatiskt)
- Kontroll av installation: fråga organismen i tråden ("zcode-online kontroll")
