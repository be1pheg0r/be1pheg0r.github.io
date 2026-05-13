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

// ===== chat =====
const RESUME_CONTEXT = `
Резюме Станислава Тупицина — кандидата на Python-разработчика (NLP / LLM-агенты), Екатеринбург.
Контакты: +7 904 975 60 17, stastupicin05@gmail.com, Telegram @isoptional, github.com/be1pheg0r.

Стек:
- ЯП: Python 3
- LLM / агенты: LangGraph, LangChain, function calling, tool use, prompt engineering, RAG, мультиагентные пайплайны
- NLP: sentence-transformers, HuggingFace Transformers, spaCy, токенизация BPE/WordPiece/SentencePiece, PyMorphy, GigaChat, OpenRouter (Kimi K2, Mistral и др.)
- Поиск / RAG: Milvus, ChromaDB, BM25, FlashRAG, гибридный поиск, реранкинг
- ML: PyTorch, Scikit-Learn, LightGBM, CatBoost, XGBoost, Optuna, стекинг, ONNX
- Backend: FastAPI, Pydantic, aiogram, Docker, async I/O
- БД: PostgreSQL, SQL, Milvus, ChromaDB
- Инфра: Git, Linux, Kaggle, HuggingFace Hub
- Языки: русский (родной), английский B2, французский базовый

Опыт: Python-разработчик в Сбербанке, ноябрь 2025 — апрель 2026 (6 мес).
- Интегрировал LLM-пайплайн на базе GigaChat в продуктовую систему автоматизации работы с внутренней документацией; время анализа документа специалистом сократилось на 22%.
- Разрабатывал внутренние ML-сервисы на Python (FastAPI + Pydantic). Рефакторинг легаси-роутинга: замена LLM-классификатора на оптимизированный BM25-роутер (BM25 + Optuna, F1 ≈ 0.95) — снизил ошибку на 40% и ускорил роутинг в 20 раз.
- Иерархический NER-пайплайн для русскоязычных юридических документов: spaCy + множество маленьких ONNX-классификаторов поверх токенов PyMorphy; покрывал три уровня сущностей.

Образование: УрФУ, ИРИТ-РТФ, Алгоритмы искусственного интеллекта (09.03.01), 2023–2027, очная.

Проекты:
1. Детектор галлюцинаций для GigaChat (IT Purple Hack 2026, кейс Сбера). Стек: Python, PyTorch, HF Transformers, LightGBM, CatBoost, XGBoost, LogisticRegression. Стекинг 4 моделей. Доставал скрытые состояния LLM. Результат: weighted AP ≈ 0.67 на закрытом лидерборде.
2. Мультиагентная классификация объявлений (IT Purple Hack 2026, кейс Avito). Стек: Python, LangGraph, Milvus, OpenRouter (Kimi K2). Граф агентов, RAG на Milvus, tool calling.
3. Графовая мультиагентная генерация BPMN-диаграмм. Стек: Python, LangGraph, Mistral API. 78% валидных BPMN. Open Source.
4. Сегментация текстовых интервью (хакатон Газпром). Стек: Python, spaCy, sentence-transformers, LangGraph. Топ-3, F1 = 0.81.

Достижения:
- Автор исследования «Методология и валидация разметки снимков ОКТ с использованием U-Net3+» (eLIBRARY, 2024).
- Топ-3 на лидерборде хакатона Газпрома.
`.trim();

const convo = document.getElementById('convo');
const composeForm = document.getElementById('composeForm');
const composeInput = document.getElementById('composeInput');
const history = [];

function addMsg(role, text, opts = {}) {
  const div = document.createElement('div');
  div.className = 'msg ' + (role === 'user' ? 'user' : 'bot') + (opts.thinking ? ' thinking' : '');
  div.textContent = text;
  convo.appendChild(div);
  convo.scrollTop = convo.scrollHeight;
  return div;
}

async function ask(question) {
  addMsg('user', question);
  history.push({ role: 'user', content: question });
  const thinking = addMsg('bot', 'думаю...', { thinking: true });

  const systemPrompt = `Ты — небольшой ассистент-агент, который отвечает на вопросы про резюме Станислава Тупицина (он же Стас). Отвечай дружелюбно, коротко (2–4 предложения), от ЕГО лица в первом лице ("я"), на русском. Не выдумывай фактов — отвечай ТОЛЬКО на основе данных ниже. Если спрашивают о чём-то не из резюме — мягко скажи, что лучше уточнить лично.

ДАННЫЕ:
${RESUME_CONTEXT}`;

  const messages = [
    ...history.map(h => ({ role: h.role, content: h.content }))
  ];

  try {
    const text = await window.claude.complete({
      messages: [
        { role: 'user', content: systemPrompt + '\n\n---\n\nВопрос: ' + question }
      ]
    });
    thinking.classList.remove('thinking');
    thinking.textContent = text;
    history.push({ role: 'assistant', content: text });
  } catch (err) {
    thinking.classList.remove('thinking');
    thinking.textContent = 'Что-то пошло не так. Напиши Стасу напрямую: @isoptional 🌝';
    console.error(err);
  }
}

composeForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const v = composeInput.value.trim();
  if (!v) return;
  composeInput.value = '';
  ask(v);
});

document.querySelectorAll('.quick button').forEach(b => {
  b.addEventListener('click', () => ask(b.dataset.q));
});

// ===== smooth nav scrolling already handled by scroll-behavior; close compose on enter =====
