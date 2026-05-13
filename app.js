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

// ===== projects: tabs =====
const PROJECTS = [
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

const projDetail = document.getElementById('projDetail');
function renderProject(i) {
  const p = PROJECTS[i];
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
renderProject(0);

document.querySelectorAll('.proj-tab').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.proj-tab').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    renderProject(parseInt(btn.dataset.idx, 10));
  });
});
