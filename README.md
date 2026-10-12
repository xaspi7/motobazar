# MotoBazar — design prototype 02

Minimalistický český motobazar a ukázková administrace pro samostatné prodejce. Vizuální směr: industriální editorial, ostrá geometrie, výrazná typografie a vlastní vyhledávací komponenty místo standardních systémových `<select>` v katalogu.

**Živé demo:** https://xaspi7.github.io/motobazar/

## Lokální spuštění

```bash
npm install
npm run dev
```

Produkční kontrola:

```bash
npx tsc --noEmit
npm run build
```

## Cesty

Web je na GitHub Pages nasazený jako klientská aplikace s hash navigací:

- `#motorky` — katalog, filtry, našeptávání, řazení
- `#motorka/m-101` — detail nabídky
- `#bazary` — seznam ukázkových bazarů
- `#bazar/ride-lab` — vlastní profil bazaru
- `#sprava` — ukázková správa všech bazarů
- `#oblibene` — uložené motorky

## Demo správy bazarů

1. V hlavičce vyber **Pro prodejce**.
2. V levém panelu přepni ukázkový bazar. Každý má oddělené inzeráty.
3. Vytvoř inzerát, změň cenu, uprav stav na **Aktivní**, **Koncept** nebo **Prodaný**, případně ho smaž.
4. V sekci **Profil bazaru** lze změnit jméno, město, motto, popis a barevný akcent.
5. Všechny změny se okamžitě projeví na veřejném profilu příslušného bazaru **ve stejném prohlížeči**.
6. Reset ukázkových dat je ve footeru.

## DŮLEŽITÉ: není to zabezpečená administrace

- **Žádné reálné účty a žádné ověření přístupu.** Každý návštěvník může přepínat ukázkové bazary. Nikdy nevkládat reálné údaje.
- Inzeráty a profily se ukládají výhradně do `localStorage` konkrétního prohlížeče. Neexistuje sdílená databáze, synchronizace, backend ani API.
- Všechny předpřipravené motorky a prodejci jsou **fiktivní**; fotografie jsou **ilustrační**, nikoli snímky daných motorek. Žádné údaje nejsou ověřené.
- Funkce kontaktování kupujícího je pouze informativní. Není připojené posílání e-mailů, nahrávání fotografií ani rezervace.
- Neprobíhá scraping cizích bazarů ani dotazování státního registru.
- Před ostrým nasazením nutné připojit autentizaci, role/opránění jednotlivých prodejců, serverovou databázi, upload obrázků, moderaci inzerátů a ochranu osobních údajů.

## GitHub Pages

Workflow `.github/workflows/build.yml` po každém pushi do `main` spustí TypeScript kontrolu, Vite produkční build a publikuje složku `dist` přes GitHub Actions.

V GitHub repozitáři musí být v **Settings → Pages → Build and deployment → Source** zvoleno **GitHub Actions**. Web běží pod cestou `/motobazar/`.
