# MotoBazar

Interaktivni frontend prvni verze ceskeho motobazaru. React + TypeScript + Vite, bez backendu. Demonstracni inzeraty, ceny, prodejci a overeni jsou fiktivni a slouzi pouze pro test UX.

## Spusteni

```bash
npm install
npm run dev
```

Otevri URL vypsanou Vite. Produkcni build: `npm run build`.

## Co funguje

- Katalog, vyhledavani, filtrovani, razeni a rychle kategorie
- Detail inzeratu vcetne galerie a prehledu dostupnych udaju
- Oblibene inzeraty ulozene v localStorage
- Srovnavac az tri motorek
- Mobilni menu, responzivni UI, modal pro hledani a vlozeni inzeratu (demo)
- Navigace funguje bez routeru a zachovava filtrovani v ramci otevrene relace

## Omezeni

Demo neni napojeno na realne inzercni portaly, statni registr, autentizaci ani platebni system. Tlacitka kontaktu zobrazuji pouze ukazkovy kontakt a formular pro vlozeni inzeratu je demonstracni. Pred ostrym provozem je nutny backend, sprava souhlasu s daty, autorizovane importy, moderace a realne overovani.

## Publikovani pres GitHub Pages

V repozitari otevri **Settings > Pages**, nastav **Build and deployment > Source: GitHub Actions**. Potom v zalozce **Actions** spust workflow **Publish site** pres **Run workflow**.

Web pak bude dostupny na `https://xaspi7.github.io/motobazar/`, pokud nasazeni probehne uspesne. Bez zapnuti Pages repozitar obsahuje pouze zdrojovy kod a automaticky sestavovany artefakt, nikoli verejny web.