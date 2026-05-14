// ===== theme toggle (light/dark) with radial reveal =====
const THEME_KEY = 'resume.theme';
function applyTheme(theme) {
  document.body.classList.toggle('theme-dark', theme === 'dark');
  try { localStorage.setItem(THEME_KEY, theme); } catch (e) {}
}
(function () {
  let saved = 'light';
  try { saved = localStorage.getItem(THEME_KEY) || 'light'; } catch (e) {}
  applyTheme(saved);
})();

function animateThemeFlip(originX, originY, nextTheme) {
  const overlay = document.createElement('div');
  overlay.className = 'theme-reveal';
  const size = 20;
  overlay.style.width = size + 'px';
  overlay.style.height = size + 'px';
  overlay.style.left = (originX - size / 2) + 'px';
  overlay.style.top  = (originY - size / 2) + 'px';
  overlay.style.background = nextTheme === 'dark' ? '#0F0E0C' : '#FBF7EE';
  document.body.appendChild(overlay);

  const w = window.innerWidth, h = window.innerHeight;
  const dx = Math.max(originX, w - originX);
  const dy = Math.max(originY, h - originY);
  const radius = Math.sqrt(dx * dx + dy * dy);
  const scale = (radius * 2) / size + 4;

  const anim = overlay.animate(
    [
      { transform: 'scale(0)', opacity: 1 },
      { transform: `scale(${scale})`, opacity: 1 }
    ],
    { duration: 620, easing: 'cubic-bezier(.65,0,.35,1)', fill: 'forwards' }
  );
  setTimeout(() => applyTheme(nextTheme), 320);
  anim.onfinish = () => {
    overlay.animate(
      [{ opacity: 1 }, { opacity: 0 }],
      { duration: 220, easing: 'ease-out', fill: 'forwards' }
    ).onfinish = () => overlay.remove();
  };
}

document.addEventListener('DOMContentLoaded', () => {
  const themeBtn = document.getElementById('themeToggle');
  if (!themeBtn) return;
  themeBtn.addEventListener('click', () => {
    const isDark = document.body.classList.contains('theme-dark');
    const next = isDark ? 'light' : 'dark';
    const r = themeBtn.getBoundingClientRect();
    animateThemeFlip(r.left + r.width / 2, r.top + r.height / 2, next);
  });
});

// ===== scroll progress =====
const progress = document.getElementById('progress');
function updateProgress() {
  const h = document.documentElement;
  const scrolled = h.scrollTop / (h.scrollHeight - h.clientHeight);
  progress.style.width = Math.max(0, Math.min(1, scrolled)) * 100 + '%';
}
window.addEventListener('scroll', updateProgress, { passive: true });
updateProgress();

// ===== reveal on scroll =====
const io = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('in');
      io.unobserve(e.target);
    }
  });
}, { threshold: 0.15 });
document.querySelectorAll('.reveal').forEach(el => io.observe(el));

// ===== inject [fig.] markers for CV "scientific paper" mode =====
// Real DOM element (not CSS ::before content) — reliable across renderers
// and easy to style/animate. CSS in styles.css hides it when not in CV mode.
document.querySelectorAll('.eyebrow').forEach(el => {
  if (el.querySelector(':scope > .eyebrow-fig')) return;
  const fig = document.createElement('span');
  fig.className = 'eyebrow-fig';
  fig.setAttribute('aria-hidden', 'true');
  fig.textContent = '[ fig. ]';
  el.prepend(fig);
});

// ===== magnet shapes — soft cursor follow =====
const magnets = document.querySelectorAll('.magnet');
const heroEl = document.querySelector('.hero');
let mx = 0, my = 0, cx = 0, cy = 0;
window.addEventListener('mousemove', (e) => {
  const r = heroEl.getBoundingClientRect();
  if (e.clientY < r.bottom + 100) {
    mx = (e.clientX - window.innerWidth / 2);
    my = (e.clientY - r.top - r.height / 2);
  }
});
function tickMagnet() {
  cx += (mx - cx) * 0.06;
  cy += (my - cy) * 0.06;
  magnets.forEach(el => {
    const k = parseFloat(el.dataset.mag || '0.05');
    el.style.transform = `translate(${cx * k}px, ${cy * k}px)`;
  });
  requestAnimationFrame(tickMagnet);
}
tickMagnet();

// ===== projects: per-mode data =====
const PROJECTS_PY = [
  {
    ctx: 'IT Purple Hack 2026 · кейс Сбера',
    title: 'Детектор галлюцинаций для GigaChat',
    stack: ['Python', 'PyTorch', 'HF Transformers', 'LightGBM', 'CatBoost', 'XGBoost', 'LogisticRegression'],
    bullets: [
      'Стекинг 4 моделей (LightGBM + CatBoost + XGBoost → LogReg как мета-модель) поверх фич, извлечённых из ответов GigaChat.',
      'Главная сложность — работа с внутренностями torch-модели: доставал скрытые состояния и распределения вероятностей по слоям LLM.',
      'Агрегировал эти сигналы в признаки для классификатора галлюцинаций.'
    ],
    result: 'weighted AP ≈ 0.67 на закрытом лидерборде'
  },
  {
    ctx: 'IT Purple Hack 2026 · кейс Avito',
    title: 'Мультиагентная классификация объявлений',
    stack: ['Python', 'LangGraph', 'Milvus', 'OpenRouter', 'Kimi K2'],
    bullets: [
      'Граф агентов на LangGraph: классификация объявлений по разделам ремонта и автоматическое решение о разбиении одного объявления на несколько подкатегорий.',
      'RAG-слой на Milvus с эмбеддингами карточек категорий.',
      'LLM-вызовы через OpenRouter (Kimi K2) с tool calling и валидацией структурированного вывода.'
    ],
    result: 'мультиагентный граф с tool calling и структурированным выводом'
  },
  {
    ctx: 'pet / open source',
    title: 'Графовая мультиагентная система генерации BPMN-диаграмм',
    stack: ['Python', 'LangGraph', 'Mistral API', 'LLM agents'],
    bullets: [
      'Конвейер из специализированных агентов: парсинг → планирование → генерация → валидация.',
      'Из текстового описания процесса собирает валидный BPMN.',
      'Полный Open Source.'
    ],
    result: '78% валидных BPMN-диаграмм на тестовом наборе'
  },
  {
    ctx: 'хакатон Газпром',
    title: 'Сегментация текстовых интервью',
    stack: ['Python', 'NLP', 'spaCy', 'sentence-transformers', 'LangGraph'],
    bullets: [
      'Разбиение длинных текстовых интервью на семантические сегменты.',
      'Эмбеддинги sentence-transformers + spaCy-морфология.',
      'Граф агентов на LangGraph для пост-обработки сегментов.'
    ],
    result: 'Топ-3 · F1 = 0.81 на публичном датасете'
  }
];

const PROJECTS_CV = [
  {
    ctx: 'pet / Kaggle · 2024',
    title: 'Идентификация охотоморских китов по видеопотоку',
    stack: ['Python', 'PyTorch', 'YOLO11m-seg', 'Swin-B', 'MegaDescriptor', 'ArcFace', 'Triplet Loss', 'DDP (dual T4)'],
    bullets: [
      'Полный пайплайн детекция → сегментация → ReID: YOLO11m-seg выделяет особей, Swin-B / MegaDescriptor с ArcFace + Triplet извлекают эмбеддинги.',
      'Реализовал DDP-обучение на двух T4; разбирал распределение классов и устранял утечки между train/val.',
      '66 классов, 2400+ изображений; zero-shot baseline Rank-1 = 0.56.'
    ],
    result: 'Rank-1 = 0.737 на закрытой валидации'
  },
  {
    ctx: 'eLIBRARY, 2024 · публикация',
    title: 'Сегментация патологий на снимках ОКТ (U-Net3+)',
    stack: ['Python', 'PyTorch', 'U-Net3+', 'albumentations', 'OpenCV'],
    bullets: [
      'Сегментация патологических областей на снимках оптической когерентной томографии.',
      'Кастомная разметка и валидация датасета; устойчивые аугментации под низкоконтрастные снимки.',
      'Работа легла в основу публикации на eLIBRARY.'
    ],
    result: 'Dice = 0.83 на тестовой выборке'
  },
  {
    ctx: 'pet / end-to-end',
    title: 'Распознавание рукописного текста на бланках',
    stack: ['Python', 'PyTorch', 'OpenCV', 'CRNN', 'PyQt5'],
    bullets: [
      'End-to-end фреймворк распознавания рукописного текста на бланках.',
      'GUI-прототип на PyQt5 с выгрузкой результатов в Excel.',
      'Препроцессинг строк через OpenCV, CRNN-модель в основе.'
    ],
    result: 'CER = 4.2% на тестовой выборке'
  },
  {
    ctx: 'pet / биосигналы',
    title: 'Классификация РАС по сигналам ЭКГ / EEG',
    stack: ['Python', 'PyTorch', 'Scikit-Learn', 'SciPy', 'signal processing'],
    bullets: [
      'Классификация расстройств аутистического спектра по биосигналам.',
      'Препроцессинг и извлечение признаков из ЭКГ/EEG (фильтры, спектры).',
      'Сравнение DL и классических моделей на одной фичевой базе.'
    ],
    result: 'ROC-AUC = 0.79 (+11 пп над бейслайном)'
  }
];

// ===== mode switcher =====
const MODE_KEY = 'resume.mode';
let currentMode = 'py';
try { currentMode = localStorage.getItem(MODE_KEY) || 'py'; } catch (e) {}

// Build/rebuild switcher buttons. Pre-existing elements get their computed
// styles locked by the runtime, so we recreate them on every mode change.
const SWITCHER_BUTTONS = [
  { mode: 'py', name: 'Python-разработчик', sub: 'ИИ-агенты · NLP' },
  { mode: 'cv', name: 'CV-разработчик',     sub: 'Computer Vision' },
];
function rebuildSwitcher(activeMode) {
  const sw = document.getElementById('modeSwitcher');
  if (!sw) return;
  sw.innerHTML = '';
  for (const d of SWITCHER_BUTTONS) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.setAttribute('role', 'tab');
    btn.dataset.mode = d.mode;
    const isActive = d.mode === activeMode;
    btn.className = 'ms-btn' + (isActive ? ' active' : '');
    btn.setAttribute('aria-selected', isActive ? 'true' : 'false');
    const name = document.createElement('span');
    name.className = 'ms-name';
    name.textContent = d.name;
    const sub = document.createElement('span');
    sub.className = 'ms-sub';
    sub.textContent = d.sub;
    btn.appendChild(name);
    btn.appendChild(sub);
    btn.addEventListener('click', () => setMode(d.mode));
    sw.appendChild(btn);
  }
}

const projTabs = document.getElementById('projTabs');
const projDetail = document.getElementById('projDetail');
let currentProjIdx = 0;

function renderProject(list, i) {
  const p = list[i];
  projDetail.innerHTML = `
    <div class="ctx">${p.ctx}</div>
    <div class="title">${p.title}</div>
    <div class="stack">${p.stack.map(s => `<span class="chip">${s}</span>`).join('')}</div>
    <div class="bullets">
      ${p.bullets.map(b => `<div class="bullet"><span class="dot"></span><span>${b}</span></div>`).join('')}
    </div>
    <div class="result"><span class="arrow">→</span> ${p.result}</div>
    <div class="corner-pink"></div>
  `;
}

function renderTabs(list) {
  projTabs.innerHTML = list.map((p, i) => `
    <button class="proj-tab${i === currentProjIdx ? ' active' : ''}" data-idx="${i}">
      <span class="idx">${String(i + 1).padStart(2, '0')}</span>
      <span class="name">${p.title}</span>
    </button>
  `).join('');
  projTabs.querySelectorAll('.proj-tab').forEach(btn => {
    btn.addEventListener('click', () => {
      currentProjIdx = parseInt(btn.dataset.idx, 10);
      projTabs.querySelectorAll('.proj-tab').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      renderProject(list, currentProjIdx);
    });
  });
}

function projectsForMode(mode) { return mode === 'cv' ? PROJECTS_CV : PROJECTS_PY; }

function renderProjectsForMode(mode) {
  currentProjIdx = 0;
  const list = projectsForMode(mode);
  renderTabs(list);
  renderProject(list, 0);
}

function applyMode(mode, animated) {
  document.body.classList.toggle('mode-cv', mode === 'cv');
  // rebuild the switcher buttons fresh so their styles reflect the new mode
  rebuildSwitcher(mode);
  // swap PDF links to the mode-specific google doc
  const pdfUrl = mode === 'cv'
    ? 'https://docs.google.com/document/d/1s2C6HoEELEKPNrnBQSbZiOWZbdox5t8iQZG_b_PQDOM/edit?usp=sharing'
    : 'https://docs.google.com/document/d/1Hkcu4VGTxPP-pWNmAM_5wQBuD5kC50n-/edit?usp=sharing&ouid=101720441758992709932&rtpof=true&sd=true';
  document.querySelectorAll('[data-pdf-link]').forEach(a => { a.href = pdfUrl; });

  renderProjectsForMode(mode);
  currentMode = mode;
  try { localStorage.setItem(MODE_KEY, mode); } catch (e) {}
}

// initial apply (no anim)
applyMode(currentMode, false);

async function setMode(next) {
  if (next === currentMode) return;
  applyMode(next, true);
}
