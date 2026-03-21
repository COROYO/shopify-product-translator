# Shopify Translator

Web-App zur Übersetzung von Shopify-Produkttexten über die **Shopify Admin GraphQL API**
Optional unterstützt durch **KI-Übersetzung** (OpenAI oder Google Gemini).

**Live:** [translate-product.shrymp.de](https://translate-product.shrymp.de)

## Funktionen

- **Anmeldung** mit Shopify-Shop-Domain (`*.myshopify.com`) und **Admin API Access Token** (`shpat_…`). Zugangsdaten werden als **httpOnly-Cookies** gespeichert (siehe `src/app/actions.ts`).
- **Server-Proxy** `POST /api/shopify` leitet GraphQL-Anfragen an `https://{domain}/admin/api/2024-01/graphql.json` weiter; der Token wird **nicht** im Browser ausgeliefert (`src/app/api/shopify/route.ts`).
- **Oberfläche:** Shop-Locales, paginierte Produktliste mit übersetzbaren Feldern, Rich-Text-Editor (TipTap), Einstellungen für KI-Anbieter (`src/components/sc-ai-settings-modal.tsx`, `saveAiSettingsAction` in `src/app/actions.ts`).
- **KI-Übersetzung** über `POST /api/translate`: **OpenAI** (`gpt-4o-mini`) oder **Google Gemini** (`gemini-2.5-flash`); API-Key wird serverseitig aus dem Cookie `sc-ai-key` gelesen (`src/app/api/translate/route.ts`).
- **Cookie-Banner** und optionales **Google Analytics** (nur nach Zustimmung), Mess-ID per `NEXT_PUBLIC_GA_ID` (`src/components/sc-analytics.tsx`).

## Tech-Stack

| Bereich   | Technologie                              |
| --------- | ---------------------------------------- |
| Framework | Next.js **16.2.0** (App Router)          |
| UI        | React **19.2.4**, Tailwind CSS **3.4.x** |
| Sprache   | TypeScript **5**                         |
| Editor    | TipTap **3.20.x**                        |
| Sonstiges | DOMPurify, Lucide React                  |

Build: `output: 'standalone'` in `next.config.ts` — geeignet für **Docker** oder selbst gehostete Deployments mit eigenem Node-Prozess.

## Voraussetzungen

- **Node.js** (empfohlen: aktuelle **LTS**-Version) und **npm**
- Ein Shopify-Shop mit konfigurierten **Markets / Sprachen** und übersetzbaren Produktinhalten

## Shopify einrichten

1. Im Shopify Admin eine **Custom App** anlegen (oder vorhandene App nutzen).
2. Einen **Admin API access token** erzeugen, der die für **Übersetzungen** und **Produktdaten** nötigen Berechtigungen hat. Die genauen Scopes hängen von deiner Shopify-Version ab — in der Shopify-Dokumentation zu **Translations API** / **translatableResources** / **translationsRegister** prüfen.
3. Die Shop-Domain immer als `dein-shop.myshopify.com` angeben (ohne `https://`).

## Umgebungsvariablen

| Variable            | Pflicht     | Beschreibung                                                                                                                    |
| ------------------- | ----------- | ------------------------------------------------------------------------------------------------------------------------------- |
| `NEXT_PUBLIC_GA_ID` | Nein        | Google Analytics 4 Measurement ID. Ohne Setzen nutzt der Code eine Fallback-ID im Client — für **Produktion** eigene ID setzen. |
| `NODE_ENV`          | Automatisch | `production` aktiviert u. a. `Secure`-Cookies für die Session-Cookies.                                                          |

Weitere Secrets (Shopify-Token, KI-API-Keys) werden **nicht** über `.env` erwartet, sondern über Login bzw. die App-Einstellungen in Secure Cookies abgelegt. (Schutz vor Cross Site Injections)

## Lokale Entwicklung

```bash
npm install
npm run dev
```

App im Browser: [http://localhost:3000](http://localhost:3000)

Weitere Scripts:

```bash
npm run build   # Production-Build
npm run start   # Production-Server (nach build)
npm run lint    # ESLint
```

## Betrieb mit Docker

Das Repo enthält ein **[Dockerfile](Dockerfile)** (Multi-Stage, **Node 20 Alpine**, Next **standalone**) und optional **[docker-compose.yml](docker-compose.yml)**.

### Image bauen und starten

```bash
# Image bauen
docker build -t shopify-translator .

# Container (Port 3000)
docker run --rm -p 3000:3000 shopify-translator
```

Die App lauscht auf `0.0.0.0:3000` (`HOSTNAME`/`PORT` im Dockerfile). Im Browser: [http://localhost:3000](http://localhost:3000).

### Docker Compose

```bash
docker compose up -d --build
```

Die Beispiel-`docker-compose.yml` mappt `127.0.0.1:3000:3000` und setzt u. a. `NODE_ENV=production`. Passe **Host**, **Ports** und **`environment`** an deine Domain/Infrastruktur an (z. B. Reverse-Proxy vor dem Container).

### Umgebungsvariablen im Container

- **`NEXT_PUBLIC_GA_ID`:** Werte mit `NEXT_PUBLIC_*` werden bei Next.js beim **Build** in den Client-Bundle übernommen. Für eine eigene GA-ID im Image entweder eine **`.env.production`** im Build-Kontext nutzen (liegt laut `.dockerignore` nicht auf der Ignore-Liste für `.env.production`) oder das **Dockerfile** um `ARG`/`ENV` vor `npm run build` erweitern und mit `docker build --build-arg …` setzen.
- **`NODE_ENV=production`** ist im Dockerfile/Compose sinnvoll; so sind die Session-Cookies **Secure** (HTTPS hinter Proxy erforderlich).

Shopify- und KI-Zugangsdaten kommen weiterhin **nicht** aus Container-Env, sondern über Login/Einstellungen in der App (Cookies).

### Hinweis Reverse-Proxy

Hinter **HTTPS** (z. B. Nginx, Traefik, Plesk Docker-Proxy) bereitstellen, damit Browser **Secure-Cookies** akzeptieren und die Session zuverlässig funktioniert.

## Sicherheit

Die Shopify- und KI-Zugangsdaten liegen in **httpOnly-Cookies** und sind für JavaScript im Browser nicht lesbar. Der Admin-API-Token hat **weitreichende Rechte** am Shop — nur auf **vertrauenswürdigen Geräten** nutzen und Token bei Verdacht in Shopify **rotieren** oder **löschen**.

## Datenschutz / Cookies

Hinweise zur Cookie-Nutzung und Analytics verweisen im UI auf die verlinkte **Datenschutzerklärung** (siehe Cookie-Banner in `src/components/sc-analytics.tsx`).
Wir speichern keinerlei Daten und haben in diesem Projekt nur Google Analytics laufen, um nachvollziehen zu können, wie aktiv das Tool genutzt wird.

## Lizenz

Dies ist ein Projekt von [https://coroyo.de](Coroyo) und [https://shrymp-commerce.com](Shrymp Commerce 🦐)
Falls es dich nach weiteren E-Commerce Projekten gelüstet, schreib uns gerne. 📩 [mailto:info@shrymp-commerce.com](info@shrymp-commerce.com)
