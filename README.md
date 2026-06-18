# Atlas — EU Regulation Browser

A sleek, full-stack web application that fetches the full text of **15 key EU digital regulations** directly from the official [EUR-Lex](https://eur-lex.europa.eu/) XML source and makes them readable in all **24 official EU languages**.

![Tech](https://img.shields.io/badge/Node.js-Express-brightgreen) ![Frontend](https://img.shields.io/badge/React-Vite-blue) ![Data](https://img.shields.io/badge/Source-EUR--Lex%20XML-yellow)

## Features

- **15 regulations** – GDPR, NIS2, DSA, DMA, AI Act, Data Act, eIDAS, PSD2, and more
- **24 languages** – all official EU languages supported by EUR-Lex (BG, CS, DA, DE, EL, EN, ES, ET, FI, FR, GA, HR, HU, IT, LT, LV, MT, NL, PL, PT, RO, SK, SL, SV)
- **Live XML parsing** – Akoma Ntoso XML fetched from EUR-Lex, parsed server-side into structured articles and recitals
- **Article navigation** – collapsible table of contents with per-article scrolling
- **Regulation filter** – sidebar search to find regulations by name, ID, or tag
- **Server-side caching** – fetched documents are cached for 1 hour to avoid repeated calls
- **Dark, responsive UI** – sleek interface built with React and CSS variables

## Covered Regulations

| Act | Type | Short ID |
|-----|------|----------|
| General Data Protection Regulation | Regulation | 2016/679 |
| ePrivacy Directive | Directive | 2002/58 |
| NIS2 Directive | Directive | 2022/2555 |
| Digital Services Act | Regulation | 2022/2065 |
| Digital Markets Act | Regulation | 2022/1925 |
| Cybersecurity Act | Regulation | 2019/881 |
| eIDAS | Regulation | 910/2014 |
| Data Act | Regulation | 2023/2854 |
| Data Governance Act | Regulation | 2022/868 |
| Free Flow of Non‑Personal Data | Regulation | 2018/1807 |
| Platform‑to‑Business | Regulation | 2019/1150 |
| European Electronic Communications Code | Directive | 2018/1972 |
| PSD2 | Directive | 2015/2366 |
| Copyright DSM | Directive | 2019/790 |
| AI Act | Regulation | 2024/1689 |

## Project Structure

```
atlas/
├── server.js           # Express API — fetches & parses EUR-Lex XML
├── package.json        # Backend dependencies
├── client/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── data/regulations.js      # Regulation metadata + CELEX IDs
│   │   └── components/
│   │       ├── Header.jsx           # Top bar with language picker
│   │       ├── Sidebar.jsx          # Regulation list with search
│   │       ├── RegulationViewer.jsx # Article/recital reader
│   │       └── TableOfContents.jsx  # In-document navigation
│   ├── index.html
│   └── package.json
└── README.md
```

## Quick Start

### 1. Install dependencies

```bash
# Backend
npm install

# Frontend
cd client && npm install
```

### 2. Build the frontend

```bash
cd client && npm run build
```

### 3. Start the server

```bash
node server.js
# → http://localhost:3001
```

The Express server serves the built frontend at `/` and the API at `/api/*`.

### Development mode (hot reload)

```bash
# Terminal 1 – backend
node server.js

# Terminal 2 – frontend (Vite dev server with proxy to backend)
cd client && npm run dev
# → http://localhost:5173
```

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/regulations` | List of all 15 regulations with metadata |
| GET | `/api/languages` | All 24 EU languages |
| GET | `/api/regulation/:celex?lang=EN` | Parsed text (title, articles, recitals, TOC) |
| GET | `/api/regulation/:celex/available-languages` | Which languages are available for a document |

## Data Source

All regulation text is fetched on-demand from the official EUR-Lex XML endpoint:

```
https://eur-lex.europa.eu/legal-content/{LANG}/TXT/XML/?uri=CELEX:{CELEX}
```

The Akoma Ntoso (AKN) XML is parsed server-side and the structured result is cached for 1 hour.