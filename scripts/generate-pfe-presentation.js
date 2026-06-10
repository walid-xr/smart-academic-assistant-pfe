const fs = require('fs');
const path = require('path');
const pptxgen = require('pptxgenjs');

const rootDir = path.resolve(__dirname, '..');
const outputDir = path.join(rootDir, 'presentation');
const assetDir = path.join(outputDir, 'assets');
const outputPath = path.join(outputDir, 'Smart-Academic-Assistant-PFE-10min.pptx');
const logoPath = path.join(rootDir, 'frontend', 'public', 'smart-academic-assistant-logo.svg');
const architectureImagePath = path.join(assetDir, 'architecture-project-visual.svg');
const workflowImagePath = path.join(assetDir, 'n8n-workflow-visual.svg');

const pptx = new pptxgen();
pptx.layout = 'LAYOUT_WIDE';
pptx.author = 'Smart Academic Assistant';
pptx.company = 'PFE';
pptx.subject = 'Presentation PFE 10 minutes';
pptx.title = 'Smart Academic Assistant - Presentation PFE';
pptx.lang = 'fr-FR';
pptx.theme = {
  headFontFace: 'Aptos Display',
  bodyFontFace: 'Aptos',
  lang: 'fr-FR'
};
pptx.margin = 0.35;

const C = {
  navy: '133B5C',
  blue: '256FA8',
  blue2: '1B5E8C',
  teal: '51C4B8',
  gold: 'F0B44C',
  ink: '102A43',
  muted: '5F6C7B',
  pale: 'F4F8FB',
  line: 'D8E4EE',
  white: 'FFFFFF',
  red: 'D9524A',
  green: '2E8B57'
};

const W = 13.333;
const H = 7.5;

function writeVisualAssets() {
  fs.mkdirSync(assetDir, { recursive: true });

  fs.writeFileSync(
    architectureImagePath,
    `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1280" height="720" viewBox="0 0 1280 720">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#F5FAFD"/>
      <stop offset="1" stop-color="#E8F1F8"/>
    </linearGradient>
    <linearGradient id="blue" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#256FA8"/>
      <stop offset="1" stop-color="#133B5C"/>
    </linearGradient>
    <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="12" stdDeviation="14" flood-color="#123B5C" flood-opacity="0.14"/>
    </filter>
    <marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="8" markerHeight="8" orient="auto-start-reverse">
      <path d="M 0 0 L 10 5 L 0 10 z" fill="#256FA8"/>
    </marker>
  </defs>
  <rect width="1280" height="720" rx="34" fill="url(#bg)"/>
  <rect x="58" y="54" width="1164" height="612" rx="30" fill="#FFFFFF" filter="url(#shadow)"/>
  <rect x="58" y="54" width="1164" height="66" rx="30" fill="#133B5C"/>
  <circle cx="96" cy="88" r="9" fill="#F05D5E"/>
  <circle cx="124" cy="88" r="9" fill="#F0B44C"/>
  <circle cx="152" cy="88" r="9" fill="#51C4B8"/>
  <text x="190" y="95" font-family="Aptos, Arial, sans-serif" font-size="22" font-weight="700" fill="#FFFFFF">Architecture du projet</text>

  <g font-family="Aptos, Arial, sans-serif" font-size="20" font-weight="700">
    <rect x="106" y="185" width="190" height="106" rx="18" fill="#256FA8"/>
    <text x="201" y="229" text-anchor="middle" fill="#FFFFFF">Frontend</text>
    <text x="201" y="258" text-anchor="middle" font-size="16" font-weight="500" fill="#DCEBF5">React + Vite</text>

    <rect x="420" y="185" width="205" height="106" rx="18" fill="#133B5C"/>
    <text x="522" y="229" text-anchor="middle" fill="#FFFFFF">Backend API</text>
    <text x="522" y="258" text-anchor="middle" font-size="16" font-weight="500" fill="#DCEBF5">Node + Express</text>

    <rect x="745" y="176" width="190" height="92" rx="18" fill="#51C4B8"/>
    <text x="840" y="214" text-anchor="middle" fill="#102A43">MySQL</text>
    <text x="840" y="243" text-anchor="middle" font-size="15" font-weight="500" fill="#17324D">données métier</text>

    <rect x="745" y="304" width="190" height="92" rx="18" fill="#F0B44C"/>
    <text x="840" y="343" text-anchor="middle" fill="#102A43">Uploads</text>
    <text x="840" y="372" text-anchor="middle" font-size="15" font-weight="500" fill="#17324D">PDF devoirs</text>

    <rect x="1012" y="185" width="162" height="106" rx="18" fill="#1B5E8C"/>
    <text x="1093" y="229" text-anchor="middle" fill="#FFFFFF">n8n</text>
    <text x="1093" y="258" text-anchor="middle" font-size="16" font-weight="500" fill="#DCEBF5">webhooks</text>

    <rect x="1012" y="386" width="162" height="106" rx="18" fill="#D9524A"/>
    <text x="1093" y="430" text-anchor="middle" fill="#FFFFFF">Gemini</text>
    <text x="1093" y="459" text-anchor="middle" font-size="16" font-weight="500" fill="#FFE4E1">analyse IA</text>
  </g>

  <g fill="none" stroke="#256FA8" stroke-width="5" marker-end="url(#arrow)">
    <path d="M296 238 H410"/>
    <path d="M625 222 H735"/>
    <path d="M625 254 C670 254 682 350 735 350"/>
    <path d="M935 222 H1000"/>
    <path d="M1093 291 V372"/>
    <path d="M1012 439 C845 600 556 570 522 305"/>
  </g>

  <g font-family="Aptos, Arial, sans-serif">
    <rect x="126" y="480" width="322" height="92" rx="18" fill="#F4F8FB" stroke="#D8E4EE"/>
    <text x="150" y="516" font-size="18" font-weight="700" fill="#133B5C">Sécurité</text>
    <text x="150" y="546" font-size="15" fill="#5F6C7B">JWT, rôles, CORS, validation, secrets</text>

    <rect x="478" y="480" width="322" height="92" rx="18" fill="#F4F8FB" stroke="#D8E4EE"/>
    <text x="502" y="516" font-size="18" font-weight="700" fill="#133B5C">Tests</text>
    <text x="502" y="546" font-size="15" fill="#5F6C7B">Vitest, Supertest, Playwright</text>

    <rect x="830" y="480" width="322" height="92" rx="18" fill="#F4F8FB" stroke="#D8E4EE"/>
    <text x="854" y="516" font-size="18" font-weight="700" fill="#133B5C">Résultat</text>
    <text x="854" y="546" font-size="15" fill="#5F6C7B">score, feedback français, alertes</text>
  </g>
</svg>`,
    'utf8'
  );

  fs.writeFileSync(
    workflowImagePath,
    `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1280" height="720" viewBox="0 0 1280 720">
  <defs>
    <linearGradient id="canvas" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#102A43"/>
      <stop offset="1" stop-color="#133B5C"/>
    </linearGradient>
    <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="10" stdDeviation="12" flood-color="#031323" flood-opacity="0.28"/>
    </filter>
    <marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="8" markerHeight="8" orient="auto-start-reverse">
      <path d="M 0 0 L 10 5 L 0 10 z" fill="#51C4B8"/>
    </marker>
  </defs>
  <rect width="1280" height="720" rx="34" fill="#E8F1F8"/>
  <rect x="60" y="52" width="1160" height="616" rx="28" fill="url(#canvas)" filter="url(#shadow)"/>
  <rect x="60" y="52" width="1160" height="62" rx="28" fill="#071D30"/>
  <text x="104" y="91" font-family="Aptos, Arial, sans-serif" font-size="21" font-weight="700" fill="#FFFFFF">Workflow n8n - Correction intelligente</text>
  <text x="1040" y="91" font-family="Aptos, Arial, sans-serif" font-size="15" font-weight="700" fill="#F0B44C">Webhook actif</text>

  <g stroke="#31506B" stroke-width="1">
    <path d="M100 160 H1180"/>
    <path d="M100 230 H1180"/>
    <path d="M100 300 H1180"/>
    <path d="M100 370 H1180"/>
    <path d="M100 440 H1180"/>
    <path d="M100 510 H1180"/>
    <path d="M100 580 H1180"/>
    <path d="M160 135 V615"/>
    <path d="M300 135 V615"/>
    <path d="M440 135 V615"/>
    <path d="M580 135 V615"/>
    <path d="M720 135 V615"/>
    <path d="M860 135 V615"/>
    <path d="M1000 135 V615"/>
    <path d="M1140 135 V615"/>
  </g>

  <g font-family="Aptos, Arial, sans-serif">
    <g>
      <rect x="112" y="198" width="150" height="86" rx="16" fill="#256FA8"/>
      <text x="187" y="233" text-anchor="middle" font-size="17" font-weight="700" fill="#FFFFFF">Webhook</text>
      <text x="187" y="259" text-anchor="middle" font-size="13" fill="#DCEBF5">soumission</text>
    </g>
    <g>
      <rect x="315" y="198" width="150" height="86" rx="16" fill="#51C4B8"/>
      <text x="390" y="233" text-anchor="middle" font-size="17" font-weight="700" fill="#102A43">Normalize</text>
      <text x="390" y="259" text-anchor="middle" font-size="13" fill="#17324D">payload</text>
    </g>
    <g>
      <rect x="518" y="198" width="150" height="86" rx="16" fill="#F0B44C"/>
      <text x="593" y="233" text-anchor="middle" font-size="17" font-weight="700" fill="#102A43">Extract PDF</text>
      <text x="593" y="259" text-anchor="middle" font-size="13" fill="#17324D">texte étudiant</text>
    </g>
    <g>
      <rect x="721" y="198" width="150" height="86" rx="16" fill="#D9524A"/>
      <text x="796" y="233" text-anchor="middle" font-size="17" font-weight="700" fill="#FFFFFF">Gemini</text>
      <text x="796" y="259" text-anchor="middle" font-size="13" fill="#FFE4E1">JSON structuré</text>
    </g>
    <g>
      <rect x="924" y="198" width="150" height="86" rx="16" fill="#2E8B57"/>
      <text x="999" y="233" text-anchor="middle" font-size="17" font-weight="700" fill="#FFFFFF">Callback</text>
      <text x="999" y="259" text-anchor="middle" font-size="13" fill="#E4F5EB">backend</text>
    </g>

    <g fill="none" stroke="#51C4B8" stroke-width="5" marker-end="url(#arrow)">
      <path d="M262 241 H304"/>
      <path d="M465 241 H507"/>
      <path d="M668 241 H710"/>
      <path d="M871 241 H913"/>
      <path d="M999 284 C999 384 842 418 720 418"/>
    </g>

    <rect x="222" y="380" width="210" height="72" rx="16" fill="#FFFFFF" fill-opacity="0.96"/>
    <text x="327" y="410" text-anchor="middle" font-size="16" font-weight="700" fill="#133B5C">Feedback en français</text>
    <text x="327" y="435" text-anchor="middle" font-size="13" fill="#5F6C7B">score, conseils, questions manquantes</text>

    <rect x="475" y="380" width="210" height="72" rx="16" fill="#FFFFFF" fill-opacity="0.96"/>
    <text x="580" y="410" text-anchor="middle" font-size="16" font-weight="700" fill="#133B5C">Alertes</text>
    <text x="580" y="435" text-anchor="middle" font-size="13" fill="#5F6C7B">IA probable, plagiat, revue</text>

    <rect x="728" y="380" width="210" height="72" rx="16" fill="#FFFFFF" fill-opacity="0.96"/>
    <text x="833" y="410" text-anchor="middle" font-size="16" font-weight="700" fill="#133B5C">Notifications</text>
    <text x="833" y="435" text-anchor="middle" font-size="13" fill="#5F6C7B">étudiant et enseignant</text>

    <rect x="210" y="520" width="860" height="58" rx="18" fill="#071D30" stroke="#31506B"/>
    <text x="640" y="556" text-anchor="middle" font-size="18" font-weight="700" fill="#FFFFFF">Sécurité du webhook : header x-n8n-secret</text>
  </g>
</svg>`,
    'utf8'
  );
}

function addLogo(slide, x = 11.85, y = 0.25, w = 0.72, h = 0.72) {
  if (fs.existsSync(logoPath)) {
    slide.addImage({ path: logoPath, x, y, w, h, altText: 'Logo Smart Academic Assistant' });
    return;
  }

  slide.addShape(pptx.ShapeType.arc, {
    x,
    y,
    w,
    h,
    fill: { color: C.blue },
    line: { color: C.blue }
  });
}

function addBg(slide, opts = {}) {
  slide.background = { color: opts.color || C.pale };
  slide.addShape(pptx.ShapeType.rect, {
    x: 0,
    y: 0,
    w: W,
    h: H,
    fill: { color: opts.color || C.pale },
    line: { color: opts.color || C.pale }
  });
  slide.addShape(pptx.ShapeType.rect, {
    x: 0,
    y: 0,
    w: 0.16,
    h: H,
    fill: { color: opts.bar || C.blue },
    line: { color: opts.bar || C.blue }
  });
  slide.addShape(pptx.ShapeType.rect, {
    x: 0.16,
    y: 7.28,
    w: W - 0.16,
    h: 0.05,
    fill: { color: opts.accent || C.teal },
    line: { color: opts.accent || C.teal }
  });
}

function addHeader(slide, title, label) {
  addBg(slide);
  slide.addText(label || 'Projet PFE', {
    x: 0.55,
    y: 0.25,
    w: 4.2,
    h: 0.28,
    fontFace: 'Aptos',
    fontSize: 10,
    bold: true,
    color: C.blue,
    margin: 0
  });
  slide.addText(title, {
    x: 0.55,
    y: 0.55,
    w: 9.9,
    h: 0.6,
    fontFace: 'Aptos Display',
    fontSize: 28,
    bold: true,
    color: C.ink,
    margin: 0,
    breakLine: false,
    fit: 'shrink'
  });
  addLogo(slide);
}

function addFooter(slide, index, timing) {
  slide.addText(`Smart Academic Assistant  |  ${timing}`, {
    x: 0.55,
    y: 7.05,
    w: 8,
    h: 0.22,
    fontSize: 7.8,
    color: C.muted,
    margin: 0
  });
  slide.addText(String(index).padStart(2, '0'), {
    x: 12.15,
    y: 7.02,
    w: 0.5,
    h: 0.25,
    fontSize: 8.5,
    bold: true,
    color: C.blue,
    margin: 0,
    align: 'right'
  });
}

function addPill(slide, text, x, y, w, color = C.blue, textColor = C.white) {
  slide.addShape(pptx.ShapeType.roundRect, {
    x,
    y,
    w,
    h: 0.38,
    rectRadius: 0.08,
    fill: { color },
    line: { color },
  });
  slide.addText(text, {
    x: x + 0.12,
    y: y + 0.09,
    w: w - 0.24,
    h: 0.16,
    fontSize: 9.5,
    bold: true,
    align: 'center',
    color: textColor,
    margin: 0,
    fit: 'shrink'
  });
}

function addCard(slide, title, body, x, y, w, h, accent = C.blue) {
  slide.addShape(pptx.ShapeType.roundRect, {
    x,
    y,
    w,
    h,
    rectRadius: 0.08,
    fill: { color: C.white },
    line: { color: C.line, width: 1 }
  });
  slide.addShape(pptx.ShapeType.rect, {
    x,
    y,
    w: 0.08,
    h,
    fill: { color: accent },
    line: { color: accent }
  });
  slide.addText(title, {
    x: x + 0.25,
    y: y + 0.18,
    w: w - 0.45,
    h: 0.34,
    fontSize: 16,
    bold: true,
    color: C.ink,
    margin: 0,
    fit: 'shrink'
  });
  slide.addText(body, {
    x: x + 0.25,
    y: y + 0.64,
    w: w - 0.45,
    h: h - 0.82,
    fontSize: 14,
    color: C.ink,
    margin: 0,
    breakLine: false,
    fit: 'shrink',
    valign: 'top'
  });
}

function addBullets(slide, items, x, y, w, h, opts = {}) {
  const rich = [];
  items.forEach((item) => {
    rich.push({
      text: item,
      options: {
        bullet: { type: 'ul' },
        hanging: 4,
        breakLine: true,
      }
    });
  });

  slide.addText(rich, {
    x,
    y,
    w,
    h,
    fontSize: opts.fontSize || 15,
    color: opts.color || C.ink,
    fit: 'shrink',
    breakLine: false,
    paraSpaceAfterPt: opts.space || 8,
    margin: 0.02,
    valign: 'top'
  });
}

function addFlowNode(slide, text, x, y, w, color, h = 0.62) {
  slide.addShape(pptx.ShapeType.roundRect, {
    x,
    y,
    w,
    h,
    rectRadius: 0.08,
    fill: { color },
    line: { color }
  });
  slide.addText(text, {
    x: x + 0.08,
    y: y + 0.16,
    w: w - 0.16,
    h: h - 0.18,
    fontSize: 11.5,
    bold: true,
    color: C.white,
    align: 'center',
    margin: 0,
    fit: 'shrink'
  });
}

function addArrow(slide, x1, y1, x2, y2, color = C.blue) {
  slide.addShape(pptx.ShapeType.line, {
    x: x1,
    y: y1,
    w: x2 - x1,
    h: y2 - y1,
    line: {
      color,
      width: 1.8,
      beginArrowType: 'none',
      endArrowType: 'triangle'
    }
  });
}

function addNotes(slide, notes) {
  slide.addNotes(notes.trim());
}

function titleSlide() {
  const slide = pptx.addSlide();
  slide.background = { color: C.navy };
  slide.addShape(pptx.ShapeType.rect, {
    x: 0,
    y: 0,
    w: W,
    h: H,
    fill: { color: C.navy },
    line: { color: C.navy }
  });
  slide.addShape(pptx.ShapeType.rect, {
    x: 0,
    y: 6.6,
    w: W,
    h: 0.9,
    fill: { color: C.blue2, transparency: 15 },
    line: { color: C.blue2, transparency: 100 }
  });
  slide.addShape(pptx.ShapeType.arc, {
    x: 8.35,
    y: -0.85,
    w: 5.8,
    h: 5.8,
    fill: { color: C.teal, transparency: 78 },
    line: { color: C.teal, transparency: 100 }
  });
  slide.addShape(pptx.ShapeType.arc, {
    x: 10.6,
    y: 4.3,
    w: 3.2,
    h: 3.2,
    fill: { color: C.gold, transparency: 68 },
    line: { color: C.gold, transparency: 100 }
  });
  addLogo(slide, 0.72, 0.65, 1.15, 1.15);
  slide.addText('Smart Academic Assistant', {
    x: 0.72,
    y: 2.0,
    w: 7.8,
    h: 0.6,
    fontFace: 'Aptos Display',
    fontSize: 34,
    bold: true,
    color: C.white,
    margin: 0,
    fit: 'shrink'
  });
  slide.addText('Gestion intelligente des devoirs, feedback IA et détection des risques', {
    x: 0.75,
    y: 2.78,
    w: 7.9,
    h: 0.45,
    fontSize: 15,
    color: 'DCEBF5',
    margin: 0,
    fit: 'shrink'
  });
  slide.addText('Présentation PFE - Démo 10 minutes', {
    x: 0.75,
    y: 3.55,
    w: 5.8,
    h: 0.32,
    fontSize: 12,
    bold: true,
    color: C.gold,
    margin: 0
  });
  slide.addText('Présenté par :\nM. CHAROUNE Walid\nM. CHAGOUTI Taquiou Allah', {
    x: 0.75,
    y: 4.82,
    w: 5.6,
    h: 0.72,
    fontSize: 14,
    bold: true,
    color: C.white,
    breakLine: false,
    margin: 0,
    fit: 'shrink'
  });
  addPill(slide, 'React', 0.75, 4.22, 1.0, C.blue);
  addPill(slide, 'Express', 1.9, 4.22, 1.15, C.teal, C.ink);
  addPill(slide, 'MySQL', 3.2, 4.22, 1.05, C.gold, C.ink);
  addPill(slide, 'n8n + Gemini', 4.4, 4.22, 1.65, C.white, C.blue);
  slide.addText('Objectif : montrer une plateforme académique complète, sécurisée et démontrable.', {
    x: 0.75,
    y: 6.88,
    w: 8.8,
    h: 0.25,
    fontSize: 11,
    color: C.white,
    margin: 0
  });
  addNotes(slide, `
Bonjour. Je présente Smart Academic Assistant, une application PFE full-stack pour gérer les devoirs.
En 10 minutes, je vais expliquer le problème, l'architecture, les rôles, le workflow IA avec n8n/Gemini, les tests, la sécurité, puis le scénario de démonstration.
`);
}

function slideProblem() {
  const slide = pptx.addSlide();
  addHeader(slide, 'Problématique et objectif', '01 | Contexte');
  addCard(slide, 'Problème', 'Trop de tâches manuelles : collecte, suivi, correction, feedback et risques de triche.', 0.65, 1.55, 3.9, 2.0, C.red);
  addCard(slide, 'Objectif', 'Une seule plateforme pour créer, soumettre, analyser et consulter les résultats.', 4.75, 1.55, 3.9, 2.0, C.blue);
  addCard(slide, 'Valeur PFE', 'Un vrai projet full-stack : React, Express, MySQL, n8n, IA, sécurité et tests.', 8.85, 1.55, 3.75, 2.0, C.teal);
  slide.addText('Idée clé', {
    x: 0.65,
    y: 4.22,
    w: 2.0,
    h: 0.3,
    fontSize: 12,
    bold: true,
    color: C.blue,
    margin: 0
  });
  slide.addText('Un devoir suit un cycle simple : publier -> soumettre -> analyser -> corriger.', {
    x: 0.65,
    y: 4.62,
    w: 11.5,
    h: 0.7,
    fontFace: 'Aptos Display',
    fontSize: 28,
    bold: true,
    color: C.ink,
    margin: 0,
    fit: 'shrink'
  });
  addFooter(slide, 1, '0:45');
  addNotes(slide, `
Le point de départ est simple : dans beaucoup de classes, la gestion des devoirs est dispersée.
Le professeur crée le travail, les étudiants rendent des fichiers, puis il faut corriger, donner du feedback et vérifier les comportements suspects.
Mon objectif est de regrouper tout cela dans une plateforme claire et démontrable.
`);
}

function slideSolution() {
  const slide = pptx.addSlide();
  addHeader(slide, 'Vue globale de la solution', '02 | Fonctionnalités');
  addFlowNode(slide, 'Créer un devoir\nquestionnaire ou PDF', 0.72, 1.55, 2.0, C.blue);
  addArrow(slide, 2.82, 1.86, 3.35, 1.86);
  addFlowNode(slide, 'Publier aux\nétudiants', 3.42, 1.55, 1.65, C.teal);
  addArrow(slide, 5.16, 1.86, 5.75, 1.86);
  addFlowNode(slide, 'Soumettre réponse\ntexte ou PDF', 5.85, 1.55, 2.0, C.gold, 0.62);
  addArrow(slide, 7.95, 1.86, 8.5, 1.86);
  addFlowNode(slide, 'Analyser avec\nn8n + IA', 8.6, 1.55, 1.75, C.navy);
  addArrow(slide, 10.45, 1.86, 10.95, 1.86);
  addFlowNode(slide, 'Afficher score,\nfeedback, alertes', 11.05, 1.55, 1.8, C.green);

  addCard(slide, 'Interface enseignant', 'Créer et publier les devoirs.\nVoir les soumissions.\nConsulter les alertes.', 0.75, 3.2, 3.55, 2.15, C.blue);
  addCard(slide, 'Interface étudiant', 'Voir les devoirs.\nRépondre en texte ou PDF.\nLire le feedback.', 4.65, 3.2, 3.55, 2.15, C.teal);
  addCard(slide, 'Automatisation IA', 'n8n + Gemini analysent la soumission et renvoient un résultat JSON.', 8.55, 3.2, 3.65, 2.15, C.gold);
  addFooter(slide, 2, '0:55');
  addNotes(slide, `
La solution suit un cycle très lisible.
Le professeur crée le devoir, soit sous forme de questions dans la plateforme, soit avec un fichier PDF.
L'étudiant répond avec du texte ou un PDF. Ensuite n8n orchestre l'analyse avec Gemini, et le résultat revient dans l'application.
`);
}

function slideTechnologies() {
  const slide = pptx.addSlide();
  addHeader(slide, 'Technologies utilisées', '03 | Stack technique');

  addCard(slide, 'Frontend', 'React.js\nVite\nBootstrap\nCSS responsive', 0.75, 1.45, 3.75, 2.1, C.blue);
  addCard(slide, 'Backend', 'Node.js\nExpress.js\nAPI REST\nJWT auth', 4.8, 1.45, 3.75, 2.1, C.navy);
  addCard(slide, 'Base de données', 'MySQL\nTables utilisateurs\nDevoirs\nSoumissions', 8.85, 1.45, 3.75, 2.1, C.teal);

  addCard(slide, 'IA & automatisation', 'n8n workflows\nGemini API\nWebhooks\nFeedback en français', 0.75, 4.05, 3.75, 2.1, C.gold);
  addCard(slide, 'Tests', 'Vitest\nSupertest\nPlaywright\nSmoke tests', 4.8, 4.05, 3.75, 2.1, C.green);
  addCard(slide, 'Sécurité', 'bcryptjs\nHelmet\nCORS\nRate limiting\nZod validation', 8.85, 4.05, 3.75, 2.1, C.red);

  slide.addText('La stack est simple à expliquer et complète pour une démo PFE.', {
    x: 0.85,
    y: 6.55,
    w: 11.2,
    h: 0.3,
    fontSize: 16,
    bold: true,
    color: C.ink,
    align: 'center',
    margin: 0,
    fit: 'shrink'
  });
  addFooter(slide, 3, '0:50');
  addNotes(slide, `
Cette slide résume les technologies utilisées.
Côté frontend, le projet utilise React avec Vite, Bootstrap et CSS.
Côté backend, il utilise Node.js, Express et des APIs REST sécurisées avec JWT.
La base de données est MySQL. L'automatisation IA est faite avec n8n et Gemini.
Pour la qualité, on utilise Vitest, Supertest et Playwright. Pour la sécurité : bcryptjs, Helmet, CORS, rate limiting et validation des entrées.
`);
}

function slideArchitecture() {
  const slide = pptx.addSlide();
  addHeader(slide, 'Architecture technique', '04 | Full-stack');

  slide.addText('Une séparation claire entre interface, API, données et automatisation IA.', {
    x: 0.65,
    y: 1.18,
    w: 11.2,
    h: 0.34,
    fontSize: 15,
    bold: true,
    color: C.blue,
    margin: 0,
    fit: 'shrink'
  });

  const y = 2.05;
  addFlowNode(slide, 'Frontend\nReact + Vite', 0.75, y, 2.25, C.blue, 0.9);
  addArrow(slide, 3.15, y + 0.45, 3.82, y + 0.45);
  addFlowNode(slide, 'Backend API\nNode + Express', 3.95, y, 2.25, C.navy, 0.9);
  addArrow(slide, 6.35, y + 0.45, 7.02, y + 0.45);
  addFlowNode(slide, 'Données\nMySQL + Uploads', 7.15, y, 2.25, C.teal, 0.9);
  addArrow(slide, 9.55, y + 0.45, 10.22, y + 0.45);
  addFlowNode(slide, 'Automatisation\nn8n + Gemini', 10.35, y, 2.25, C.red, 0.9);

  slide.addShape(pptx.ShapeType.line, {
    x: 4.95,
    y: 3.08,
    w: 0,
    h: 0.85,
    line: { color: C.gold, width: 2, beginArrowType: 'none', endArrowType: 'triangle' }
  });
  addFlowNode(slide, 'Fichiers PDF\nDevoirs et réponses', 3.8, 4.0, 2.55, C.gold, 0.75);

  slide.addShape(pptx.ShapeType.line, {
    x: 11.48,
    y: 3.08,
    w: 0,
    h: 0.85,
    line: { color: C.green, width: 2, beginArrowType: 'none', endArrowType: 'triangle' }
  });
  addFlowNode(slide, 'Retour JSON\nscore + feedback', 10.25, 4.0, 2.55, C.green, 0.75);

  addCard(
    slide,
    'Responsabilités',
    'React : interface utilisateur.\nExpress : API sécurisée.\nMySQL : données.\nn8n/Gemini : analyse IA.',
    0.75,
    5.18,
    5.75,
    1.35,
    C.blue
  );
  addCard(
    slide,
    'Flux principal',
    'Soumission -> backend -> n8n -> Gemini -> résultat -> feedback dans l’application.',
    6.85,
    5.18,
    5.75,
    1.35,
    C.teal
  );
  addFooter(slide, 4, '1:05');
  addNotes(slide, `
L'architecture est volontairement simple à expliquer.
Le frontend React communique avec l'API Express. L'API stocke les données dans MySQL et garde les fichiers dans le dossier uploads.
Pour l'intelligence artificielle, le backend ne parle pas directement avec Gemini. Il envoie la soumission à n8n, qui appelle Gemini puis renvoie le résultat.
`);
}

function slideRoles() {
  const slide = pptx.addSlide();
  addHeader(slide, 'Les trois rôles utilisateur', '05 | Accès');
  addCard(slide, 'Administrateur', 'Gère les utilisateurs.\nAccède aux fonctions de supervision.', 0.75, 1.55, 3.75, 3.55, C.navy);
  addCard(slide, 'Enseignant', 'Crée et publie les devoirs.\nRevoit les soumissions.\nConsulte les alertes.', 4.8, 1.55, 3.75, 3.55, C.blue);
  addCard(slide, 'Étudiant', 'Voit les devoirs publiés.\nSoumet texte ou PDF.\nReçoit score et feedback.', 8.85, 1.55, 3.75, 3.55, C.teal);

  slide.addText('Chaque rôle voit uniquement les actions nécessaires à son travail.', {
    x: 0.78,
    y: 5.85,
    w: 11.5,
    h: 0.35,
    fontSize: 18,
    bold: true,
    color: C.ink,
    align: 'center',
    margin: 0
  });
  addFooter(slide, 5, '0:55');
  addNotes(slide, `
La plateforme est organisée autour de trois rôles.
L'administrateur sert à la gestion et à la supervision.
L'enseignant crée et publie les devoirs, puis analyse les résultats.
L'étudiant voit seulement les devoirs disponibles, soumet son travail et reçoit le feedback.
`);
}

function slideTeacherStudentFlow() {
  const slide = pptx.addSlide();
  addHeader(slide, 'Cycle enseignant - étudiant', '06 | Démo fonctionnelle');
  slide.addText('Côté enseignant', {
    x: 0.85,
    y: 1.35,
    w: 4.4,
    h: 0.25,
    fontSize: 16,
    bold: true,
    color: C.blue,
    margin: 0
  });
  addBullets(slide, [
    'Créer un devoir',
    'Choisir questionnaire ou PDF',
    'Publier aux étudiants',
    'Revoir les soumissions'
  ], 0.85, 1.78, 5.2, 2.55, { fontSize: 16, space: 8 });

  slide.addShape(pptx.ShapeType.line, {
    x: 6.45,
    y: 1.25,
    w: 0,
    h: 4.75,
    line: { color: C.line, width: 1.4 }
  });
  slide.addText('Côté étudiant', {
    x: 7.0,
    y: 1.35,
    w: 4.4,
    h: 0.25,
    fontSize: 16,
    bold: true,
    color: C.teal,
    margin: 0
  });
  addBullets(slide, [
    'Voir le devoir publié',
    'Répondre ou déposer un PDF',
    'Envoyer la soumission',
    'Lire score et feedback'
  ], 7.0, 1.78, 5.2, 2.55, { fontSize: 16, space: 8 });

  addPill(slide, 'Publication', 2.15, 5.35, 1.3, C.blue);
  addArrow(slide, 3.6, 5.54, 4.45, 5.54);
  addPill(slide, 'Soumission', 4.55, 5.35, 1.35, C.teal, C.ink);
  addArrow(slide, 6.05, 5.54, 6.9, 5.54);
  addPill(slide, 'Feedback IA', 7.0, 5.35, 1.35, C.gold, C.ink);
  addArrow(slide, 8.5, 5.54, 9.35, 5.54);
  addPill(slide, 'Revue', 9.45, 5.35, 1.05, C.navy);
  addFooter(slide, 6, '1:00');
  addNotes(slide, `
Pour la démonstration, je montre d'abord le compte enseignant.
Il crée un devoir, choisit le mode questionnaire ou PDF, puis publie.
Ensuite je passe au compte étudiant : il voit le devoir, répond ou dépose un fichier, et la plateforme lance l'analyse.
Enfin l'enseignant retrouve le résultat et peut revoir la correction.
`);
}

function slideN8n() {
  const slide = pptx.addSlide();
  addHeader(slide, 'Workflow n8n et IA', '07 | Automatisation');

  slide.addText('n8n orchestre la correction sans mélanger la logique IA avec le backend.', {
    x: 0.65,
    y: 1.18,
    w: 11.2,
    h: 0.34,
    fontSize: 15,
    bold: true,
    color: C.blue,
    margin: 0,
    fit: 'shrink'
  });

  const y = 2.05;
  addFlowNode(slide, '1\nWebhook\nsoumission', 0.72, y, 1.75, C.blue, 1.0);
  addArrow(slide, 2.58, y + 0.5, 3.1, y + 0.5);
  addFlowNode(slide, '2\nNormaliser\npayload', 3.22, y, 1.75, C.teal, 1.0);
  addArrow(slide, 5.08, y + 0.5, 5.6, y + 0.5);
  addFlowNode(slide, '3\nExtraire\ntexte PDF', 5.72, y, 1.75, C.gold, 1.0);
  addArrow(slide, 7.58, y + 0.5, 8.1, y + 0.5);
  addFlowNode(slide, '4\nGemini\nanalyse JSON', 8.22, y, 1.75, C.red, 1.0);
  addArrow(slide, 10.08, y + 0.5, 10.6, y + 0.5);
  addFlowNode(slide, '5\nCallback\nbackend', 10.72, y, 1.75, C.green, 1.0);

  addCard(
    slide,
    'Résultat IA',
    'Score /20\nFeedback en français\nAlertes et action recommandée',
    0.85,
    4.0,
    3.75,
    1.55,
    C.blue
  );
  addCard(
    slide,
    'Pourquoi n8n ?',
    'Webhook\nExtraction PDF\nAppel Gemini\nAlertes et rapports',
    4.8,
    4.0,
    3.75,
    1.55,
    C.teal
  );
  addCard(
    slide,
    'Sécurité',
    'Le callback backend est protégé par le header x-n8n-secret.',
    8.75,
    4.0,
    3.75,
    1.55,
    C.red
  );

  slide.addText('Flux final : soumission -> n8n -> Gemini -> feedback visible dans l’application.', {
    x: 0.9,
    y: 6.18,
    w: 11.3,
    h: 0.3,
    fontSize: 16,
    bold: true,
    color: C.ink,
    align: 'center',
    margin: 0,
    fit: 'shrink'
  });
  addFooter(slide, 7, '1:05');
  addNotes(slide, `
n8n est la couche d'automatisation.
Il reçoit la soumission via un webhook, prépare les données, extrait le contenu si c'est un PDF, puis appelle Gemini.
Gemini renvoie un JSON structuré avec le score, les sous-scores, le feedback en français et les alertes.
Le résultat est ensuite renvoyé au backend avec un secret dans le header x-n8n-secret.
`);
}

function slideTesting() {
  const slide = pptx.addSlide();
  addHeader(slide, 'Tests du projet', '08 | Qualité');
  addCard(slide, 'Frontend', 'Vitest\nComposants React\nLogin / logout\nRoutes protégées', 0.75, 1.55, 3.75, 2.5, C.blue);
  addCard(slide, 'Backend / API', 'Vitest + Supertest\nAuthentification\nRôles\nWebhooks n8n', 4.8, 1.55, 3.75, 2.5, C.navy);
  addCard(slide, 'End-to-end', 'Playwright\nParcours complet :\nenseignant -> étudiant -> feedback', 8.85, 1.55, 3.75, 2.5, C.teal);

  slide.addText('Ce que les tests vérifient', {
    x: 0.8,
    y: 4.75,
    w: 3.8,
    h: 0.25,
    fontSize: 16,
    bold: true,
    color: C.ink,
    margin: 0
  });
  addBullets(slide, [
    'Interface et navigation',
    'Authentification et rôles',
    'API devoirs et soumissions',
    'Callbacks n8n'
  ], 0.8, 5.16, 11.3, 1.0, { fontSize: 14.5, space: 5 });
  addFooter(slide, 8, '1:00');
  addNotes(slide, `
Pour la partie tests, je présente trois niveaux.
Vitest couvre les composants React côté frontend.
Vitest et Supertest couvrent les APIs backend.
Playwright couvre le parcours complet dans le navigateur, ce qui est très utile pour prouver que la démo fonctionne de bout en bout.
`);
}

function slideSecurity() {
  const slide = pptx.addSlide();
  addHeader(slide, 'Sécurité', '09 | Protection');
  addCard(
    slide,
    'Accès',
    'JWT sessions\nbcryptjs passwords\nRoutes protégées\nRôles backend',
    0.75,
    1.55,
    3.75,
    3.85,
    C.blue
  );
  addCard(
    slide,
    'API',
    'Helmet headers\nCORS frontend\nRate limiting\nValidation Zod',
    4.8,
    1.55,
    3.75,
    3.85,
    C.teal
  );
  addCard(
    slide,
    'Données',
    'Sanitization MongoDB\nProtection HPP\nSecret x-n8n-secret\nPDF + taille max',
    8.85,
    1.55,
    3.75,
    3.85,
    C.gold
  );
  slide.addText('Objectif : protéger les comptes, les API, les webhooks et les fichiers PDF.', {
    x: 0.85,
    y: 6.15,
    w: 11.3,
    h: 0.34,
    fontSize: 17,
    bold: true,
    color: C.ink,
    align: 'center',
    margin: 0
  });
  addFooter(slide, 9, '1:05');
  addNotes(slide, `
La sécurité est présentée en deux blocs.
D'abord le contrôle d'accès : JWT, mots de passe hachés, routes protégées et rôles.
Ensuite le durcissement API : headers de sécurité, CORS, limitation de débit, validation, protection contre la pollution de paramètres, secret n8n et validation des PDF.
`);
}

function slideDataModel() {
  const slide = pptx.addSlide();
  addHeader(slide, 'Modèle de données', '10 | Base MySQL');
  addFlowNode(slide, 'users', 1.05, 1.5, 1.25, C.navy);
  addFlowNode(slide, 'students', 1.05, 2.55, 1.25, C.blue);
  addFlowNode(slide, 'assignments', 3.1, 1.5, 2.25, C.teal);
  addFlowNode(slide, 'questions', 3.1, 2.55, 2.25, C.teal);
  addFlowNode(slide, 'submissions', 6.15, 1.5, 2.2, C.gold, 0.62);
  addFlowNode(slide, 'answers', 6.15, 2.55, 2.2, C.gold, 0.62);
  addFlowNode(slide, 'analysis', 9.15, 1.5, 2.0, C.green);
  addFlowNode(slide, 'notifications', 9.15, 2.55, 2.0, C.blue2);

  addArrow(slide, 2.4, 1.81, 3.0, 1.81);
  addArrow(slide, 5.45, 1.81, 6.05, 1.81);
  addArrow(slide, 8.45, 1.81, 9.05, 1.81);
  addArrow(slide, 2.4, 2.86, 3.0, 2.86);
  addArrow(slide, 5.45, 2.86, 6.05, 2.86);
  addArrow(slide, 8.45, 2.86, 9.05, 2.86);

  addCard(slide, 'Pourquoi ce modèle ?', 'Chaque information a sa place.\nLes dashboards restent simples.\nL’historique étudiant est facile à suivre.', 1.05, 4.35, 10.1, 1.5, C.blue);
  addFooter(slide, 10, '0:50');
  addNotes(slide, `
La base MySQL garde les éléments principaux de la plateforme.
Les utilisateurs et étudiants sont séparés des devoirs.
Les devoirs peuvent contenir des questions, les soumissions peuvent contenir des réponses, puis l'analyse IA est stockée dans une table dédiée.
Ce modèle permet de construire facilement les dashboards et l'historique.
`);
}

function slideDemoPlan() {
  const slide = pptx.addSlide();
  addHeader(slide, 'Plan de démonstration en direct', '11 | 10 minutes');
  const rows = [
    ['1', 'Connexion', 'Compte enseignant puis compte étudiant.'],
    ['2', 'Création', 'Créer un devoir questionnaire ou PDF.'],
    ['3', 'Soumission', 'Envoyer une réponse texte/PDF.'],
    ['4', 'Analyse', 'Voir n8n et le retour Gemini.'],
    ['5', 'Résultat', 'Score, feedback, alertes, revue.']
  ];
  const tableData = [
    [
      { text: '#', options: { bold: true, color: C.white, fill: { color: C.navy } } },
      { text: 'Étape', options: { bold: true, color: C.white, fill: { color: C.navy } } },
      { text: 'Ce que je montre', options: { bold: true, color: C.white, fill: { color: C.navy } } }
    ],
    ...rows.map((row) => [
      { text: row[0], options: { bold: true, color: C.blue } },
      { text: row[1], options: { bold: true, color: C.ink } },
      { text: row[2], options: { color: C.ink } }
    ])
  ];
  slide.addTable(tableData, {
    x: 0.85,
    y: 1.45,
    w: 11.65,
    h: 4.35,
    colW: [0.6, 2.2, 8.85],
    border: { type: 'solid', color: C.line, pt: 1 },
    margin: 0.08,
    fontSize: 14,
    valign: 'mid',
    color: C.ink,
    fill: { color: C.white }
  });
  slide.addText('Commande de lancement : npm run dev', {
    x: 0.85,
    y: 6.18,
    w: 5.0,
    h: 0.32,
    fontSize: 16,
    bold: true,
    color: C.blue,
    margin: 0
  });
  slide.addText('Frontend : localhost:5173  |  Backend : localhost:5000  |  n8n : localhost:5678', {
    x: 0.85,
    y: 6.55,
    w: 9.8,
    h: 0.22,
    fontSize: 12,
    color: C.ink,
    margin: 0
  });
  addFooter(slide, 11, '1:00');
  addNotes(slide, `
Cette slide sert de guide pendant la démo.
Je commence par lancer le projet avec npm run dev.
Ensuite je montre rapidement l'enseignant, la création du devoir, l'étudiant qui soumet, puis le résultat de l'analyse et le feedback.
`);
}

function slideConclusion() {
  const slide = pptx.addSlide();
  slide.background = { color: C.navy };
  slide.addShape(pptx.ShapeType.rect, {
    x: 0,
    y: 0,
    w: W,
    h: H,
    fill: { color: C.navy },
    line: { color: C.navy }
  });
  addLogo(slide, 0.75, 0.65, 0.95, 0.95);
  slide.addText('Conclusion', {
    x: 0.75,
    y: 1.8,
    w: 5.2,
    h: 0.55,
    fontFace: 'Aptos Display',
    fontSize: 34,
    bold: true,
    color: C.white,
    margin: 0
  });
  slide.addText('Une plateforme académique complète : devoirs, IA, sécurité et feedback.', {
    x: 0.78,
    y: 2.6,
    w: 8.2,
    h: 0.75,
    fontSize: 24,
    bold: true,
    color: 'DCEBF5',
    margin: 0,
    fit: 'shrink'
  });
  addCard(slide, 'Points forts', 'Full-stack complet\nIA séparée dans n8n\nRôles clairs\nFeedback en français', 0.85, 4.0, 5.2, 2.1, C.teal);
  addCard(slide, 'Perspectives', 'Rapports PDF\nProgression étudiant\nScoring IA amélioré\nNotifications temps réel', 6.5, 4.0, 5.2, 2.1, C.gold);
  slide.addText('Merci pour votre attention', {
    x: 0.78,
    y: 6.65,
    w: 5.5,
    h: 0.32,
    fontSize: 18,
    bold: true,
    color: C.gold,
    margin: 0
  });
  slide.addText('Questions ?', {
    x: 10.2,
    y: 6.63,
    w: 1.7,
    h: 0.35,
    fontSize: 20,
    bold: true,
    color: C.white,
    margin: 0,
    align: 'right'
  });
  addNotes(slide, `
Pour conclure, le projet est intéressant parce qu'il montre une vraie chaîne complète.
Il ne s'arrête pas à une interface : il inclut l'API, la base de données, l'automatisation n8n, l'IA, la sécurité et une stratégie de tests.
Comme perspectives, on peut améliorer les rapports, le suivi de progression et les notifications temps réel.
`);
}

writeVisualAssets();
titleSlide();
slideProblem();
slideSolution();
slideTechnologies();
slideArchitecture();
slideRoles();
slideTeacherStudentFlow();
slideN8n();
slideTesting();
slideSecurity();
slideDataModel();
slideDemoPlan();
slideConclusion();

fs.mkdirSync(outputDir, { recursive: true });
pptx.writeFile({ fileName: outputPath }).then((fileName) => {
  console.log(`Presentation created: ${fileName}`);
});
