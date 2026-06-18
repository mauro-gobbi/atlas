'use strict';

const express = require('express');
const cors = require('cors');
const path = require('path');
const axios = require('axios');
const { XMLParser } = require('fast-xml-parser');
const NodeCache = require('node-cache');

const app = express();
const cache = new NodeCache({ stdTTL: 3600 });

app.use(cors());
app.use(express.json());

// ---------------------------------------------------------------------------
// Static regulation metadata
// ---------------------------------------------------------------------------
const REGULATIONS = [
  {
    id: 'gdpr',
    name: 'General Data Protection Regulation',
    shortId: '2016/679',
    celex: '32016R0679',
    type: 'Regulation',
    description: 'Data protection baseline for processing personal data',
    tags: ['privacy', 'data protection'],
  },
  {
    id: 'eprivacy',
    name: 'ePrivacy Directive',
    shortId: '2002/58',
    celex: '32002L0058',
    type: 'Directive',
    description: 'Confidentiality of communications; cookies; traffic data',
    tags: ['privacy', 'communications'],
  },
  {
    id: 'nis2',
    name: 'NIS2 Directive',
    shortId: '2022/2555',
    celex: '32022L2555',
    type: 'Directive',
    description:
      'Cyber risk management & incident reporting for many digital/critical sectors',
    tags: ['cybersecurity'],
  },
  {
    id: 'dsa',
    name: 'Digital Services Act',
    shortId: '2022/2065',
    celex: '32022R2065',
    type: 'Regulation',
    description:
      'Platform duties, illegal content, transparency for online intermediaries',
    tags: ['platforms', 'digital services'],
  },
  {
    id: 'dma',
    name: 'Digital Markets Act',
    shortId: '2022/1925',
    celex: '32022R1925',
    type: 'Regulation',
    description: 'Rules for gatekeeper platforms and interoperability',
    tags: ['competition', 'platforms'],
  },
  {
    id: 'csa',
    name: 'Cybersecurity Act',
    shortId: '2019/881',
    celex: '32019R0881',
    type: 'Regulation',
    description: 'ENISA mandate and ICT certification framework',
    tags: ['cybersecurity', 'certification'],
  },
  {
    id: 'eidas',
    name: 'eIDAS Regulation',
    shortId: '910/2014',
    celex: '32014R0910',
    type: 'Regulation',
    description:
      'e‑IDs, wallets, trust services and cross‑border authentication',
    tags: ['identity', 'trust services'],
  },
  {
    id: 'dataact',
    name: 'Data Act',
    shortId: '2023/2854',
    celex: '32023R2854',
    type: 'Regulation',
    description:
      'Access to and use of data from connected products; switching',
    tags: ['data', 'IoT'],
  },
  {
    id: 'dga',
    name: 'Data Governance Act',
    shortId: '2022/868',
    celex: '32022R0868',
    type: 'Regulation',
    description:
      'Data intermediaries, re‑use of public sector data, governance',
    tags: ['data', 'governance'],
  },
  {
    id: 'ffnpd',
    name: 'Free Flow of Non‑Personal Data',
    shortId: '2018/1807',
    celex: '32018R1807',
    type: 'Regulation',
    description: 'Bans unjustified data localisation; cloud portability',
    tags: ['data', 'cloud'],
  },
  {
    id: 'p2b',
    name: 'Platform‑to‑Business Regulation',
    shortId: '2019/1150',
    celex: '32019R1150',
    type: 'Regulation',
    description:
      'Fairness/transparency for business users of platforms',
    tags: ['platforms', 'fairness'],
  },
  {
    id: 'eecc',
    name: 'European Electronic Communications Code',
    shortId: '2018/1972',
    celex: '32018L1972',
    type: 'Directive',
    description:
      'Telecoms rules, numbering, universal service, security',
    tags: ['telecoms', 'communications'],
  },
  {
    id: 'psd2',
    name: 'PSD2 – Payment Services Directive',
    shortId: '2015/2366',
    celex: '32015L2366',
    type: 'Directive',
    description:
      'Payment initiation, account access (relevant for fintech)',
    tags: ['payments', 'fintech'],
  },
  {
    id: 'dsm',
    name: 'Copyright in the Digital Single Market',
    shortId: '2019/790',
    celex: '32019L0790',
    type: 'Directive',
    description:
      'TDM exceptions and rights relevant to data projects',
    tags: ['copyright', 'data'],
  },
  {
    id: 'aiact',
    name: 'AI Act',
    shortId: '2024/1689',
    celex: '32024R1689',
    type: 'Regulation',
    description:
      'Risk‑based rules for AI systems (affects many IT products)',
    tags: ['AI', 'risk'],
  },
];

// EU official languages supported by EUR-Lex
const EU_LANGUAGES = [
  { code: 'BG', name: 'Bulgarian', nativeName: 'Български' },
  { code: 'CS', name: 'Czech', nativeName: 'Čeština' },
  { code: 'DA', name: 'Danish', nativeName: 'Dansk' },
  { code: 'DE', name: 'German', nativeName: 'Deutsch' },
  { code: 'EL', name: 'Greek', nativeName: 'Ελληνικά' },
  { code: 'EN', name: 'English', nativeName: 'English' },
  { code: 'ES', name: 'Spanish', nativeName: 'Español' },
  { code: 'ET', name: 'Estonian', nativeName: 'Eesti' },
  { code: 'FI', name: 'Finnish', nativeName: 'Suomi' },
  { code: 'FR', name: 'French', nativeName: 'Français' },
  { code: 'GA', name: 'Irish', nativeName: 'Gaeilge' },
  { code: 'HR', name: 'Croatian', nativeName: 'Hrvatski' },
  { code: 'HU', name: 'Hungarian', nativeName: 'Magyar' },
  { code: 'IT', name: 'Italian', nativeName: 'Italiano' },
  { code: 'LT', name: 'Lithuanian', nativeName: 'Lietuvių' },
  { code: 'LV', name: 'Latvian', nativeName: 'Latviešu' },
  { code: 'MT', name: 'Maltese', nativeName: 'Malti' },
  { code: 'NL', name: 'Dutch', nativeName: 'Nederlands' },
  { code: 'PL', name: 'Polish', nativeName: 'Polski' },
  { code: 'PT', name: 'Portuguese', nativeName: 'Português' },
  { code: 'RO', name: 'Romanian', nativeName: 'Română' },
  { code: 'SK', name: 'Slovak', nativeName: 'Slovenčina' },
  { code: 'SL', name: 'Slovenian', nativeName: 'Slovenščina' },
  { code: 'SV', name: 'Swedish', nativeName: 'Svenska' },
];

// ---------------------------------------------------------------------------
// XML parsing helpers
// ---------------------------------------------------------------------------
const xmlParser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: '@_',
  textNodeName: '#text',
  parseAttributeValue: false,
  allowBooleanAttributes: true,
  removeNSPrefix: true,
  isArray: (name) =>
    ['recital', 'article', 'chapter', 'section', 'paragraph', 'point', 'indent', 'p'].includes(name),
});

function getText(node) {
  if (!node) return '';
  if (typeof node === 'string') return node;
  if (typeof node === 'number') return String(node);
  if (Array.isArray(node)) return node.map(getText).join(' ');
  if (node['#text']) return String(node['#text']);
  return Object.values(node)
    .filter((v) => typeof v !== 'object' || v !== null)
    .map(getText)
    .join(' ');
}

function extractArticles(body) {
  const articles = [];
  if (!body) return articles;

  const collectArticles = (node, chapterNum, chapterTitle) => {
    if (!node || typeof node !== 'object') return;

    if (node.article) {
      const arr = Array.isArray(node.article) ? node.article : [node.article];
      arr.forEach((art) => {
        const artNum = getText(art.num);
        const artHeading = getText(art.heading);
        const paragraphs = [];

        if (art.paragraph) {
          const paras = Array.isArray(art.paragraph) ? art.paragraph : [art.paragraph];
          paras.forEach((p) => {
            paragraphs.push({
              num: getText(p.num),
              text: getText(p.content || p),
            });
          });
        } else if (art.content) {
          paragraphs.push({ num: '', text: getText(art.content) });
        } else {
          paragraphs.push({ num: '', text: getText(art) });
        }

        articles.push({
          eId: art['@_eId'] || '',
          num: artNum.trim(),
          heading: artHeading.trim(),
          chapterNum,
          chapterTitle,
          paragraphs,
        });
      });
    }

    if (node.section) {
      const secs = Array.isArray(node.section) ? node.section : [node.section];
      secs.forEach((sec) => collectArticles(sec, chapterNum, chapterTitle));
    }
  };

  if (body.chapter) {
    const chapters = Array.isArray(body.chapter) ? body.chapter : [body.chapter];
    chapters.forEach((ch) => {
      const chNum = getText(ch.num).trim();
      const chTitle = getText(ch.heading).trim();
      collectArticles(ch, chNum, chTitle);
    });
  } else {
    collectArticles(body, '', '');
  }

  return articles;
}

function extractRecitals(preamble) {
  if (!preamble) return [];
  const recitalsNode = preamble.recitals;
  if (!recitalsNode) return [];
  const recitals = Array.isArray(recitalsNode.recital)
    ? recitalsNode.recital
    : recitalsNode.recital
    ? [recitalsNode.recital]
    : [];
  return recitals.map((r) => ({
    num: getText(r.num).trim(),
    text: getText(r.intro || r.content || r).trim(),
  }));
}

function parseAknDocument(xmlText) {
  const parsed = xmlParser.parse(xmlText);
  const root = parsed.akomaNtoso || parsed;
  const act = root.act || root.regulation || root.directive || root.doc || {};

  const meta = act.meta || {};
  const preface = act.preface || {};
  const preamble = act.preamble || {};
  const body = act.body || {};

  const title = getText(preface.longTitle || preface.p || preface).trim();
  const recitals = extractRecitals(preamble);
  const articles = extractArticles(body);

  // Build table of contents
  const toc = [];
  const chapterMap = {};
  articles.forEach((art) => {
    const key = art.chapterNum;
    if (!chapterMap[key]) {
      chapterMap[key] = { num: art.chapterNum, title: art.chapterTitle, articles: [] };
      toc.push(chapterMap[key]);
    }
    chapterMap[key].articles.push({ num: art.num, heading: art.heading, eId: art.eId });
  });

  return { title, recitals, articles, toc };
}

// ---------------------------------------------------------------------------
// API routes
// ---------------------------------------------------------------------------
app.get('/api/regulations', (req, res) => {
  res.json(REGULATIONS);
});

app.get('/api/languages', (req, res) => {
  res.json(EU_LANGUAGES);
});

app.get('/api/regulation/:celex', async (req, res) => {
  const { celex } = req.params;
  const lang = (req.query.lang || 'EN').toUpperCase();

  // Validate celex to only allow alphanumeric
  if (!/^[A-Z0-9]+$/.test(celex)) {
    return res.status(400).json({ error: 'Invalid CELEX number' });
  }
  if (!/^[A-Z]{2}$/.test(lang)) {
    return res.status(400).json({ error: 'Invalid language code' });
  }

  const cacheKey = `${celex}-${lang}`;
  const cached = cache.get(cacheKey);
  if (cached) return res.json(cached);

  const url = `https://eur-lex.europa.eu/legal-content/${lang}/TXT/XML/?uri=CELEX:${celex}`;

  try {
    const response = await axios.get(url, {
      timeout: 30000,
      maxContentLength: 50 * 1024 * 1024, // 50 MB
      headers: {
        'User-Agent': 'Atlas-EU-Regulation-Viewer/1.0',
        Accept: 'application/xml,text/xml',
      },
      responseType: 'text',
    });

    const contentType = response.headers['content-type'] || '';
    const xmlText = response.data;

    if (!xmlText || !xmlText.trim().startsWith('<')) {
      return res.status(404).json({
        error: `Document not available in ${lang}`,
      });
    }

    const doc = parseAknDocument(xmlText);
    cache.set(cacheKey, doc);
    return res.json(doc);
  } catch (err) {
    if (err.response && err.response.status === 404) {
      return res.status(404).json({ error: `Document not available in ${lang}` });
    }
    console.error(`Error fetching ${celex} in ${lang}:`, err.message);
    return res.status(502).json({ error: 'Failed to fetch document from EUR-Lex' });
  }
});

// Check which languages are available for a document
app.get('/api/regulation/:celex/available-languages', async (req, res) => {
  const { celex } = req.params;

  if (!/^[A-Z0-9]+$/.test(celex)) {
    return res.status(400).json({ error: 'Invalid CELEX number' });
  }

  const cacheKey = `avail-${celex}`;
  const cached = cache.get(cacheKey);
  if (cached) return res.json(cached);

  // Check a subset of commonly available languages concurrently
  const langCodesToCheck = EU_LANGUAGES.map((l) => l.code);
  const checks = langCodesToCheck.map(async (lang) => {
    const url = `https://eur-lex.europa.eu/legal-content/${lang}/TXT/XML/?uri=CELEX:${celex}`;
    try {
      const r = await axios.head(url, {
        timeout: 10000,
        headers: { 'User-Agent': 'Atlas-EU-Regulation-Viewer/1.0' },
        validateStatus: (s) => s < 500,
      });
      return r.status === 200 ? lang : null;
    } catch {
      return null;
    }
  });

  const results = await Promise.all(checks);
  const available = results.filter(Boolean);
  cache.set(cacheKey, available, 86400); // cache for 24h
  return res.json(available);
});

// ---------------------------------------------------------------------------
// Serve built frontend in production
// ---------------------------------------------------------------------------
const CLIENT_DIST = path.join(__dirname, 'client', 'dist');
app.use(express.static(CLIENT_DIST));
app.get('*', (req, res) => {
  res.sendFile(path.join(CLIENT_DIST, 'index.html'));
});

// ---------------------------------------------------------------------------
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Atlas API server running on http://localhost:${PORT}`);
});
