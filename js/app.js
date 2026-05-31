(() => {
  'use strict';

  const STORAGE_KEY = 'act_task_compass_state_v1';
  const GAS_URL_KEY = 'act_task_compass_gas_url';
  const TODAY = () => new Date().toISOString().slice(0, 10);
  const NOW = () => new Date().toISOString();
  const SCALES = window.ACT_SCALES || {};

  const CATEGORY_DEFAULTS = [
    { id: 'Strategic', label: '戦略', color: '#1D9E75' },
    { id: 'Technical', label: '技術', color: '#378ADD' },
    { id: 'People', label: 'ピープル', color: '#D4537E' },
    { id: 'Operational', label: 'オペレーション', color: '#888780' },
    { id: 'External', label: '外部対応', color: '#BA7517' }
  ];
  const OWNER_DEFAULTS = ['自分', 'マネージャー', 'リーダー', 'メンバー1', 'メンバー2', 'メンバー3'];
  const TAG_DEFAULTS = ['資料作成', 'データ分析', '内部調整', '外部対応', 'その他'];

  const VALUE_AREAS = [
    '健康・身体', '仕事・キャリア', '学び・成長', '家族関係', '友人・社会関係',
    '生活環境', '自分への優しさ', '創造性', '社会貢献', 'お金・生活基盤'
  ];

  const STRESS_LOCATION_DEFAULTS = [
    { id: 'home', label: '家' },
    { id: 'workplace', label: '職場' },
    { id: 'outing', label: '外出時' },
    { id: 'other', label: 'その他' }
  ];
  const STRESS_AREA_DEFAULTS = [
    { id: 'body', label: '体調' },
    { id: 'mental', label: 'メンタル' },
    { id: 'focus', label: '脳・集中' },
    { id: 'energy', label: 'エネルギー' },
    { id: 'sleep', label: '睡眠' }
  ];
  const STRESS_LABELS = { 5: '非常に良い', 4: '良い', 3: '普通', 2: '悪い', 1: '非常に悪い' };
  const STRESS_COLORS = { 5: 'var(--green)', 4: 'var(--accent)', 3: 'var(--amber)', 2: 'var(--amber)', 1: 'var(--red)' };

  const WORKS = {
    grounding: {
      name: '60秒グラウンディング',
      type: 'ACT',
      duration: '1分',
      summary: '不安や焦りが強い時、五感を使って今ここに戻ります。',
      fields: [
        { key: 'before', label: '開始前のつらさ', type: 'scale10' },
        { key: 'see', label: '見えるものを3つ', type: 'textarea' },
        { key: 'touch', label: '触れている感覚を2つ', type: 'textarea' },
        { key: 'breath', label: '最後に息を6秒吐いて、今できることを1つ', type: 'textarea' },
        { key: 'after', label: '終了後のつらさ', type: 'scale10' }
      ]
    },
    defusion: {
      name: '「という考え」ワーク',
      type: 'ACT',
      duration: '2分',
      summary: '思考を消そうとせず、思考と自分の間に少し距離を作ります。',
      fields: [
        { key: 'thought', label: '巻き込まれている思考', type: 'textarea' },
        { key: 'before', label: '巻き込まれ度', type: 'scale10' },
        { key: 'defused', label: '「...という考えが浮かんでいる」に変換', type: 'textarea' },
        { key: 'action', label: 'その思考があってもできる小さな行動', type: 'textarea' },
        { key: 'after', label: '終了後の巻き込まれ度', type: 'scale10' }
      ]
    },
    values: {
      name: '価値から5分行動を選ぶ',
      type: 'ACT',
      duration: '3分',
      summary: '気分の良し悪しに関係なく、大切な方向へ小さく動く準備をします。',
      fields: [
        { key: 'value_area', label: '大切にしたい領域', type: 'select', options: VALUE_AREAS },
        { key: 'person', label: 'その領域でどんな人でありたいか', type: 'textarea' },
        { key: 'action', label: '今日5分でできる行動', type: 'textarea' },
        { key: 'when', label: 'いつ行うか', type: 'input' }
      ]
    },
    acceptance: {
      name: '感情に場所を作る',
      type: 'ACT',
      duration: '3分',
      summary: '不快な感情を消す前提ではなく、そこにあるものとして扱います。',
      fields: [
        { key: 'emotion', label: '今ある感情', type: 'input' },
        { key: 'body', label: '身体のどこにあるか', type: 'input' },
        { key: 'sensation', label: '形・重さ・温度・動きで表すと', type: 'textarea' },
        { key: 'phrase', label: '置いておくための一文', type: 'textarea' },
        { key: 'action', label: 'この感情があってもできる行動', type: 'textarea' }
      ]
    },
    activation: {
      name: '行動活性化の小さな予定',
      type: 'CBT',
      duration: '3分',
      summary: '気分が上がってから動くのを待たず、低負荷の行動を予定します。',
      fields: [
        { key: 'before', label: '今の気分', type: 'scale5' },
        { key: 'activity', label: '負荷が低い行動', type: 'textarea' },
        { key: 'when', label: '開始時刻またはきっかけ', type: 'input' },
        { key: 'support', label: '少し楽にする工夫', type: 'textarea' }
      ]
    },
    kindness: {
      name: '自分への言葉を変える',
      type: 'セルフコンパッション',
      duration: '3分',
      summary: '自己批判が強い時、親しい人に返す言葉を自分にも向けます。',
      fields: [
        { key: 'critical', label: '自分に向けている厳しい言葉', type: 'textarea' },
        { key: 'friend', label: '親しい人が同じことを言ったら何と返すか', type: 'textarea' },
        { key: 'kind', label: '自分への言葉に置き換えると', type: 'textarea' },
        { key: 'next', label: '次にできる小さな行動', type: 'textarea' }
      ]
    },
    triage: {
      name: 'タスクを減圧する',
      type: 'タスク調整',
      duration: '2分',
      summary: 'キャパシティ超過時に、今日やらないことを明確にします。',
      fields: [
        { key: 'must', label: '今日どうしても必要な1つ', type: 'textarea' },
        { key: 'delay', label: '明日以降へ送るもの', type: 'textarea' },
        { key: 'ask', label: '相談・委任できる相手または内容', type: 'textarea' },
        { key: 'recover', label: '回復のために確保する5分', type: 'textarea' }
      ]
    }
  };

  let state = loadState();
  let route = { view: state.settings.onboarding_completed ? 'home' : 'onboarding', params: {} };
  let scaleAnswers = {};
  let taskFilter = 'all';
  let taskSection = 'manage';
  let taskInlineEditor = null;
  let careMode = 'stress';
  let wbsMode = 'list';
  let selectedStressCell = null;
  let gasUrl = loadGasUrlValue();
  let syncTimer = null;
  let isSyncing = false;
  let syncState = gasUrl ? 'idle' : 'idle';
  let syncMessage = gasUrl ? 'Sheets設定済み' : 'Sheets未設定';
  let gasMessage = '';
  let gasMessageIsError = false;

  function stressKey(locId, areaId) {
    return `${locId}__${areaId}`;
  }

  function defaultStressLatest(locations = STRESS_LOCATION_DEFAULTS, areas = STRESS_AREA_DEFAULTS) {
    return locations.reduce((acc, loc) => {
      areas.forEach(area => {
        acc[stressKey(loc.id, area.id)] = { score: 3, note: '', date: TODAY() };
      });
      return acc;
    }, {});
  }

  function defaultState() {
    return {
      schema_version: 1,
      settings: {
        onboarding_completed: false,
        consent_at: null,
        display_name: '',
        daily_capacity: 8,
        weekly_capacity: 40,
        save_free_text: true
      },
      categories: CATEGORY_DEFAULTS.map(item => ({ ...item })),
      owners: OWNER_DEFAULTS.slice(),
      tags: TAG_DEFAULTS.slice(),
      tasks: [],
      task_next_id: 1,
      checkins: [],
      stress_locations: STRESS_LOCATION_DEFAULTS.map(item => ({ ...item })),
      stress_areas: STRESS_AREA_DEFAULTS.map(item => ({ ...item })),
      stress_latest: defaultStressLatest(),
      stress_logs: [],
      work_sessions: [],
      scale_sessions: []
    };
  }

  function loadState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return defaultState();
      const parsed = JSON.parse(raw);
      const base = defaultState();
      return normalizeState({ ...base, ...parsed, settings: { ...base.settings, ...(parsed.settings || {}) } });
    } catch (error) {
      console.warn(error);
      return defaultState();
    }
  }

  function normalizeState(input) {
    const base = defaultState();
    const next = {
      ...base,
      ...(input || {}),
      settings: { ...base.settings, ...((input && input.settings) || {}) }
    };
    const categorySet = normalizeCategorySet(next.categories);
    next.categories = categorySet.categories;
    next.owners = normalizeStringList(next.owners, OWNER_DEFAULTS);
    next.tags = normalizeStringList(next.tags, TAG_DEFAULTS);
    next.stress_locations = normalizeStressLocations(next.stress_locations);
    next.stress_areas = normalizeStressAreas(next.stress_areas);
    next.stress_latest = normalizeStressLatest(next.stress_latest, next.stress_locations, next.stress_areas);
    next.tasks = Array.isArray(next.tasks) ? next.tasks.map((task, idx) => normalizeTask({
      ...task,
      category: categorySet.aliases.get(String(task.category)) || task.category
    }, idx, next.categories, next.owners)).filter(Boolean) : [];
    const maxTaskId = next.tasks.reduce((max, task) => Math.max(max, Number(task.id) || 0), 0);
    next.task_next_id = Math.max(Number(next.task_next_id) || 1, maxTaskId + 1);
    next.checkins = Array.isArray(next.checkins) ? next.checkins : [];
    next.stress_logs = Array.isArray(next.stress_logs) ? next.stress_logs : [];
    next.work_sessions = Array.isArray(next.work_sessions) ? next.work_sessions : [];
    next.scale_sessions = Array.isArray(next.scale_sessions) ? next.scale_sessions : [];
    return next;
  }

  function normalizeCategories(value) {
    return normalizeCategorySet(value).categories;
  }

  function normalizeCategorySet(value) {
    const src = Array.isArray(value) && value.length ? value : CATEGORY_DEFAULTS;
    const aliases = new Map();
    const used = new Set();
    const categories = src.map((item, idx) => {
      const rawId = item.id || item.key || '';
      const label = String(item.label || item.name || item.key || item.id || `カテゴリ${idx + 1}`);
      const preferred = [rawId, item.key, item.id].map(v => String(v || '')).find(isAsciiCategoryId);
      const fallback = `cat_${idx + 1}`;
      const base = preferred ? asciiCategoryId(preferred, fallback) : fallback;
      let id = base;
      let n = 2;
      while (used.has(id)) id = `${base}_${n++}`;
      used.add(id);
      [item.id, item.key, item.label, item.name, rawId, label].forEach(alias => {
        const key = String(alias || '');
        if (key) aliases.set(key, id);
      });
      return {
        id,
        label,
        color: /^#[0-9a-f]{6}$/i.test(String(item.color || '')) ? item.color : CATEGORY_DEFAULTS[idx % CATEGORY_DEFAULTS.length].color
      };
    });
    return { categories, aliases };
  }

  function normalizeStringList(value, fallback) {
    const src = Array.isArray(value) && value.length ? value : fallback;
    return [...new Set(src.map(v => String(v || '').trim()).filter(Boolean))];
  }

  function normalizeStressLocations(value) {
    const src = Array.isArray(value) && value.length ? value : STRESS_LOCATION_DEFAULTS;
    return src.map((item, idx) => ({
      id: safeId(item.id || item.key || item.label || `stress_loc_${idx + 1}`, `stress_loc_${idx + 1}`),
      label: String(item.label || item.name || item.id || `場所${idx + 1}`)
    }));
  }

  function normalizeStressAreas(value) {
    const src = Array.isArray(value) && value.length ? value : STRESS_AREA_DEFAULTS;
    return src.map((item, idx) => ({
      id: safeId(item.id || item.key || item.label || `stress_area_${idx + 1}`, `stress_area_${idx + 1}`),
      label: String(item.label || item.name || item.id || `部位${idx + 1}`)
    }));
  }

  function normalizeStressLatest(value, locations, areas) {
    const base = defaultStressLatest(locations, areas);
    const src = value && typeof value === 'object' ? value : {};
    locations.forEach(loc => {
      areas.forEach(area => {
        const key = stressKey(loc.id, area.id);
        const item = src[key] || src[`${loc.label}_${area.label}`];
        if (item && typeof item === 'object') {
          base[key] = {
            score: clamp(item.score || 3, 1, 5),
            note: String(item.note || '').slice(0, 500),
            date: item.date || TODAY()
          };
        }
      });
      const oldLocItem = src[loc.id];
      if (oldLocItem && typeof oldLocItem === 'object') {
        areas.forEach(area => {
          base[stressKey(loc.id, area.id)] = {
            score: clamp(oldLocItem.score || 3, 1, 5),
            note: String(oldLocItem.note || '').slice(0, 500),
            date: oldLocItem.date || TODAY()
          };
        });
      }
    });
    const oldAreaScores = ['体調', '気分', '集中', 'エネルギー', '睡眠', 'メンタル', '脳・集中']
      .map(key => Number(src[key]?.score))
      .filter(Boolean);
    if (oldAreaScores.length) {
      const avg = Math.round(oldAreaScores.reduce((a, b) => a + b, 0) / oldAreaScores.length);
      const fallbackLoc = locations.find(loc => loc.id === 'other') || locations[0];
      if (fallbackLoc) {
        areas.forEach(area => {
          base[stressKey(fallbackLoc.id, area.id)] = { score: avg, note: '旧バージョンのストレス項目平均から移行', date: TODAY() };
        });
      }
    }
    return base;
  }

  function normalizeTask(task, idx, categories, owners) {
    if (!task || typeof task !== 'object') return null;
    const categoryIds = categories.map(c => c.id);
    const status = task.status === 'inprogress' ? 'doing' : (['todo', 'doing', 'done'].includes(task.status) ? task.status : 'todo');
    return {
      id: Number(task.id) || idx + 1,
      title: String(task.title || '無題タスク').slice(0, 120),
      category: categoryIds.includes(task.category) ? task.category : categoryIds[0],
      effort: Math.round(Math.max(.1, Number(task.effort) || 1) * 10) / 10,
      start: task.start || task.startDate || task.start_date || '',
      end: task.end || task.endDate || task.end_date || task.deadline || '',
      urgent: Boolean(task.urgent ?? task.urgency),
      important: Boolean(task.important ?? task.importance),
      owners: Array.isArray(task.owners) && task.owners.length ? task.owners.map(String) : (task.owner ? [String(task.owner)] : [owners[0] || '自分']),
      tags: Array.isArray(task.tags) ? task.tags.map(String).filter(Boolean) : [],
      value_area: task.value_area || '',
      next_step: String(task.next_step || '').slice(0, 160),
      status,
      progress: clamp(task.progress, 0, 100),
      created_at: task.created_at || NOW(),
      updated_at: task.updated_at || NOW()
    };
  }

  function safeId(value, fallback) {
    const raw = String(value || '').trim();
    const id = raw.toLowerCase().replace(/\s+/g, '_').replace(/[^\w一-龥ぁ-んァ-ンー]/g, '').slice(0, 40);
    return id || fallback;
  }

  function isAsciiCategoryId(value) {
    return /^[A-Za-z][A-Za-z0-9_-]{0,39}$/.test(String(value || '').trim());
  }

  function asciiCategoryId(value, fallback = `cat_${Date.now().toString(36)}`) {
    const raw = String(value || '').trim();
    const id = raw.replace(/\s+/g, '_').replace(/[^A-Za-z0-9_-]/g, '').slice(0, 40);
    return isAsciiCategoryId(id) ? id : fallback;
  }

  function uniqueCategoryId(label) {
    const base = asciiCategoryId(label, `cat_${Date.now().toString(36)}`);
    let id = base;
    let n = 2;
    while (state.categories.some(category => category.id === id)) id = `${base}_${n++}`;
    return id;
  }

  function saveState(options = {}) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      if (!options.skipSync) scheduleSheetsSync();
      return true;
    } catch (error) {
      toast('端末内への保存に失敗しました。ブラウザの保存設定をご確認ください。');
      return false;
    }
  }

  function escapeHTML(value) {
    return String(value ?? '').replace(/[&<>"']/g, c => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[c]));
  }

  function clamp(n, min, max) {
    return Math.max(min, Math.min(max, Number(n) || 0));
  }

  function byId(id) {
    return document.getElementById(id);
  }

  function fmtDate(dateLike) {
    if (!dateLike) return '';
    const d = new Date(`${dateLike}T00:00:00`);
    if (Number.isNaN(d.getTime())) return '';
    return `${d.getMonth() + 1}/${d.getDate()}(${'日月火水木金土'[d.getDay()]})`;
  }

  function todayLabel() {
    const d = new Date();
    return `${d.getMonth() + 1}月${d.getDate()}日(${'日月火水木金土'[d.getDay()]})`;
  }

  function weekStartISO() {
    const d = new Date();
    const day = d.getDay();
    const diff = day === 0 ? -6 : 1 - day;
    d.setDate(d.getDate() + diff);
    return d.toISOString().slice(0, 10);
  }

  function weekEndISO() {
    const d = new Date(`${weekStartISO()}T00:00:00`);
    d.setDate(d.getDate() + 6);
    return d.toISOString().slice(0, 10);
  }

  function parseDate(s) {
    if (!s) return null;
    const d = new Date(`${s}T00:00:00`);
    return Number.isNaN(d.getTime()) ? null : d;
  }

  function dayDiff(a, b) {
    const da = parseDate(a);
    const db = parseDate(b);
    if (!da || !db) return null;
    return Math.round((da - db) / 86400000);
  }

  function activeTasks() {
    return state.tasks.filter(t => t.status !== 'done');
  }

  function remainingEffort(task) {
    const effort = Number(task.effort) || 0;
    const progress = clamp(task.progress, 0, 100);
    return Math.max(0, effort * (1 - progress / 100));
  }

  function doneEffort(task) {
    const effort = Number(task.effort) || 0;
    const progress = clamp(task.progress, 0, 100);
    return Math.max(0, effort * (progress / 100));
  }

  function taskIsToday(task) {
    const today = TODAY();
    if (task.status === 'done') return false;
    if (task.start && task.end) return task.start <= today && today <= task.end;
    if (task.end) return task.end <= today;
    if (task.start) return task.start <= today;
    return true;
  }

  function taskIsThisWeek(task) {
    const start = weekStartISO();
    const end = weekEndISO();
    if (task.status === 'done') return false;
    if (task.end) return task.end >= start && task.end <= end;
    if (task.start) return task.start >= start && task.start <= end;
    return true;
  }

  function latestCheckin() {
    return [...state.checkins].sort((a, b) => b.date.localeCompare(a.date))[0] || null;
  }

  function todayCheckin() {
    return state.checkins.find(x => x.date === TODAY()) || null;
  }

  function avgStress() {
    const vals = Object.values(state.stress_latest).map(item => Number(item?.score)).filter(Boolean);
    return vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : 3;
  }

  function stressCareCount() {
    return Object.values(state.stress_latest).filter(item => Number(item?.score) <= 2).length;
  }

  function latestScale(scaleName) {
    return [...state.scale_sessions].filter(s => s.scale_name === scaleName).sort((a, b) => b.created_at.localeCompare(a.created_at))[0] || null;
  }

  function stats() {
    const todayRemaining = activeTasks().filter(taskIsToday).reduce((sum, t) => sum + remainingEffort(t), 0);
    const weekRemaining = activeTasks().filter(taskIsThisWeek).reduce((sum, t) => sum + remainingEffort(t), 0);
    const overdue = activeTasks().filter(t => t.end && dayDiff(t.end, TODAY()) < 0).length;
    const q1 = activeTasks().filter(t => t.urgent && t.important).length;
    const dailyCap = Number(state.settings.daily_capacity) || 8;
    const weeklyCap = Number(state.settings.weekly_capacity) || 40;
    return {
      todayRemaining,
      weekRemaining,
      overdue,
      q1,
      dailyCap,
      weeklyCap,
      todayUtil: dailyCap > 0 ? todayRemaining / dailyCap : 0,
      weekUtil: weeklyCap > 0 ? weekRemaining / weeklyCap : 0,
      activeCount: activeTasks().length,
      stressAvg: avgStress()
    };
  }

  function recommendation() {
    const s = stats();
    const checkin = todayCheckin() || latestCheckin();
    const who = latestScale('WHO-5');
    if (!todayCheckin()) {
      return { work: null, title: 'まず今日の状態を30秒で記録', body: '判断せず、今の状態だけを残します。', action: 'checkin' };
    }
    if (who?.scores?.caution_flag) {
      return { work: 'kindness', title: '今日は負荷を下げる前提で動く', body: 'WHO-5で注意フラグがあります。セルフケアに加えて、つらさが続く場合は専門家への相談も検討してください。', action: 'work' };
    }
    if (s.stressAvg <= 2.2 || Number(checkin?.anxiety) >= 4) {
      return { work: 'grounding', title: '先に神経系を落ち着かせる', body: '不安・緊張またはストレススコアが低めです。60秒だけ今ここに戻ります。', action: 'work' };
    }
    if (s.todayUtil > 1 || s.weekUtil > 1 || s.overdue > 0) {
      return { work: 'triage', title: 'タスクを減圧する', body: 'キャパシティ超過または期限超過があります。今日やらないことを決めます。', action: 'work' };
    }
    if (Number(checkin?.mood) <= 2) {
      return { work: 'activation', title: '低負荷の行動を予定する', body: '気分が低い時は、気分を待たずに小さな行動を予定します。', action: 'work' };
    }
    if (Number(checkin?.fusion) >= 4) {
      return { work: 'defusion', title: '思考と距離を取る', body: '思考への巻き込まれが強めです。「という考え」へ言い換えます。', action: 'work' };
    }
    return { work: 'values', title: '価値に沿う5分行動を選ぶ', body: '今日の状態を抱えたまま、大切な方向へ小さく進みます。', action: 'work' };
  }

  function toast(message, ms = 2200) {
    const host = byId('toastHost');
    if (!host) return;
    const el = document.createElement('div');
    el.className = 'toast';
    el.textContent = message;
    host.appendChild(el);
    setTimeout(() => {
      el.style.opacity = '0';
      setTimeout(() => el.remove(), 180);
    }, ms);
  }

  function setRoute(view, params = {}) {
    route = { view, params };
    render();
    window.scrollTo({ top: 0, behavior: 'instant' });
  }

  function topbar(title, backTo = null) {
    return `
      <div class="topbar">
        ${backTo ? `<button class="icon-btn" type="button" data-nav="${backTo}" aria-label="戻る"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m15 18-6-6 6-6"/></svg></button>` : ''}
        <h1>${escapeHTML(title)}</h1>
        <div class="date">${todayLabel()}</div>
      </div>`;
  }

  function render() {
    document.body.classList.toggle('no-nav', route.view === 'onboarding');
    document.querySelectorAll('.nav-btn').forEach(btn => {
      const active = btn.dataset.view === primaryView(route.view);
      btn.setAttribute('aria-current', active ? 'page' : 'false');
    });

    const root = byId('app');
    if (!root) return;
    const views = {
      onboarding: renderOnboarding,
      home: renderHome,
      checkin: renderCheckin,
      tasks: renderTasks,
      care: renderCare,
      work: renderWork,
      scales: renderScales,
      scale: renderScaleRun,
      settings: renderSettings,
      data: renderData
    };
    root.innerHTML = (views[route.view] || renderHome)();
  }

  function primaryView(view) {
    if (view === 'checkin') return 'home';
    if (view === 'work') return 'care';
    if (view === 'scale') return 'scales';
    if (view === 'data') return 'settings';
    return view;
  }

  function renderOnboarding() {
    return `
      <div class="splash">
        <div class="splash-mark" aria-hidden="true"><svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="24"/><path d="M32 14v36M18 32h28M32 14l7 18-7 18-7-18Z"/></svg></div>
        <div>
          <p class="eyebrow">ACT Compass</p>
          <h1>タスクとこころを同じ画面で扱う</h1>
          <p class="muted">気分を良くすることだけを目標にせず、状態を観察し、負荷を調整し、大切な方向へ小さく戻るための個人用ツールです。</p>
        </div>
        <div class="notice warn">
          <strong>医療行為ではありません。</strong><br>
          このツールはセルフケア、記録、振り返りの補助です。診断・治療・カウンセリングの代わりにはなりません。自分を傷つけたい気持ちがある、差し迫った危険がある場合は、119/110または地域の緊急窓口へ連絡してください。
        </div>
        <label class="card row" style="cursor:pointer">
          <input id="consentCheck" type="checkbox" style="width:22px;height:22px;accent-color:var(--accent)">
          <span>上記の前提を理解して、個人利用を開始します。</span>
        </label>
        <button class="btn primary block" type="button" data-action="finish-onboarding" disabled>開始する</button>
        <p class="tiny">データは端末内のlocalStorageに保存されます。共有端末での利用には注意してください。</p>
      </div>`;
  }

  function renderHome() {
    const s = stats();
    const rec = recommendation();
    const check = todayCheckin();
    const work = rec.work ? WORKS[rec.work] : null;
    const careCount = stressCareCount();
    const nextTasks = activeTasks()
      .sort((a, b) => Number(b.urgent && b.important) - Number(a.urgent && a.important) || (a.end || '9999').localeCompare(b.end || '9999'))
      .slice(0, 3);
    return `
      ${topbar('今日')}
      <section class="focus-panel">
        <p class="eyebrow">今日の入口</p>
        <h1>${check ? '状態を見て、負荷を整える。' : 'まず現在地を30秒で確認。'}</h1>
        <p class="muted">${check ? '記録済みです。タスクかケアのどちらを先に扱うかだけ決めます。' : '良い/悪いの判定ではなく、今日の扱い方を決めるための確認です。'}</p>
        <div class="row wrap">
          <button class="btn ${check ? '' : 'primary'}" type="button" data-nav="checkin">${check ? '記録を更新' : '今日の記録'}</button>
          <button class="btn" type="button" data-nav="tasks">タスクを整理</button>
          <button class="btn" type="button" data-nav="care">ケアを見る</button>
        </div>
      </section>

      <div class="summary-strip">
        ${metricCard('今日の負荷', `${Math.round(s.todayUtil * 100)}%`, `${s.todayRemaining.toFixed(1)}h / ${s.dailyCap.toFixed(1)}h`, s.todayUtil, utilizationTone(s.todayUtil))}
        ${metricCard('今週の負荷', `${Math.round(s.weekUtil * 100)}%`, `${s.weekRemaining.toFixed(1)}h / ${s.weeklyCap.toFixed(1)}h`, s.weekUtil, utilizationTone(s.weekUtil))}
        ${metricCard('先に整えるサイン', `${careCount}件`, 'ストレス2以下の場所×部位', Math.min(1, careCount / 5), careCount ? 'red' : 'green')}
      </div>

      <div class="card quiet">
        <p class="eyebrow">次にやること</p>
        <h3>${escapeHTML(rec.title)}</h3>
        <p class="muted">${escapeHTML(rec.body)}</p>
        ${rec.action === 'checkin'
          ? '<button class="btn primary block" type="button" data-nav="checkin">記録する</button>'
          : `<button class="btn primary block" type="button" data-action="open-work" data-work="${rec.work}">${escapeHTML(work.name)}を開く</button>`}
      </div>

      ${s.overdue || s.todayUtil > 1 ? `<div class="notice warn"><strong>負荷を減らす判断が必要です</strong><br>期限超過 ${s.overdue}件、今日の負荷 ${Math.round(s.todayUtil * 100)}%。今日は「追加」より「延期・委任・縮小」を先に見てください。</div>` : ''}

      <h2>次に見るタスク</h2>
      <div class="compact-list">
        ${nextTasks.length ? nextTasks.map(compactTaskRow).join('') : '<div class="empty">未完了タスクはありません</div>'}
      </div>
    `;
  }

  function metricCard(label, value, sub, ratio, tone = 'green') {
    const color = tone === 'red' ? 'var(--red)' : tone === 'amber' ? 'var(--amber)' : 'var(--accent)';
    return `
      <div class="metric">
        <div class="label">${escapeHTML(label)}</div>
        <div class="value">${escapeHTML(value)}</div>
        <div class="tiny">${escapeHTML(sub)}</div>
        <div class="bar" style="margin-top:10px"><span style="width:${Math.round(clamp(ratio, 0, 1.2) / 1.2 * 100)}%;background:${color}"></span></div>
      </div>`;
  }

  function utilizationTone(ratio) {
    if (ratio > 1) return 'red';
    if (ratio > .85) return 'amber';
    return 'green';
  }

  function compactTaskRow(task) {
    const cat = categoryOf(task.category);
    const due = task.end ? dayDiff(task.end, TODAY()) : null;
    const dueText = due == null ? '日程未定' : due < 0 ? `${Math.abs(due)}日超過` : due === 0 ? '今日まで' : `${due}日後`;
    return `
      <button class="compact-row" type="button" data-nav="tasks">
        <span class="dot" style="background:${escapeHTML(cat.color)}"></span>
        <span class="main">${escapeHTML(task.title)}</span>
        <span class="sub">${escapeHTML(dueText)} / ${remainingEffort(task).toFixed(1)}h</span>
      </button>`;
  }

  function renderCheckin() {
    const existing = todayCheckin() || {};
    return `
      ${topbar('今日の記録', 'home')}
      <form id="checkinForm" class="stack">
        <div class="card">
          <h3>状態スコア</h3>
          ${scaleField('mood', '気分', existing.mood, 1, 5, '1 低い', '5 高い')}
          ${scaleField('body', '体調', existing.body, 1, 5, '1 悪い', '5 良い')}
          ${scaleField('anxiety', '不安・緊張', existing.anxiety, 1, 5, '1 低い', '5 高い')}
          ${scaleField('fusion', '思考への巻き込まれ', existing.fusion, 1, 5, '1 低い', '5 高い')}
          ${scaleField('avoidance', '避けたい気持ち', existing.avoidance, 1, 5, '1 低い', '5 高い')}
        </div>
        <div class="card">
          <h3>今日の方向</h3>
          <div class="field">
            <label for="checkValue">大切にしたい領域</label>
            <select class="select" id="checkValue" name="value_area">
              <option value="">未選択</option>
              ${VALUE_AREAS.map(v => `<option value="${escapeHTML(v)}" ${existing.value_area === v ? 'selected' : ''}>${escapeHTML(v)}</option>`).join('')}
            </select>
          </div>
          <div class="field">
            <label for="checkAction">今日5分でできる行動</label>
            <textarea class="textarea" id="checkAction" name="committed_action" maxlength="500">${escapeHTML(existing.committed_action || '')}</textarea>
          </div>
          <div class="field">
            <label for="checkThought">今、強い思考や心配</label>
            <textarea class="textarea" id="checkThought" name="thought" maxlength="500">${escapeHTML(existing.thought || '')}</textarea>
          </div>
        </div>
        <button class="btn primary block" type="submit">記録を保存</button>
      </form>`;
  }

  function scaleField(name, label, current, min, max, left, right) {
    const buttons = [];
    for (let i = min; i <= max; i += 1) {
      buttons.push(`<button class="scale-btn" type="button" data-action="set-scale-field" data-field="${name}" data-value="${i}" aria-pressed="${Number(current) === i}">${i}</button>`);
    }
    return `
      <div class="field" data-scale-group="${name}">
        <label>${escapeHTML(label)}</label>
        <input type="hidden" name="${name}" value="${current ?? ''}">
        <div class="scale-row">${buttons.join('')}</div>
        <div class="scale-labels"><span>${escapeHTML(left)}</span><span>${escapeHTML(right)}</span></div>
      </div>`;
  }

  function renderTasks() {
    return `
      ${topbar('タスク')}
      <div class="task-shell">
        <div class="segmented no-print task-section-tabs" style="margin-bottom:12px">
          <button type="button" data-action="task-section" data-section="manage" aria-pressed="${taskSection === 'manage'}">管理</button>
          <button type="button" data-action="task-section" data-section="matrix" aria-pressed="${taskSection === 'matrix'}">4象限</button>
          <button type="button" data-action="task-section" data-section="wbs" aria-pressed="${taskSection === 'wbs'}">WBS</button>
          <button type="button" data-action="task-section" data-section="masters" aria-pressed="${taskSection === 'masters'}">設定</button>
        </div>
        ${taskSection === 'matrix' ? renderTaskMatrix() : taskSection === 'wbs' ? renderWBSPanel() : taskSection === 'masters' ? renderTaskMasterSettings() : renderTaskInputAndList()}
      </div>`;
  }

  function renderTaskInputAndList() {
    const visible = filteredTasks();
    const dailyCap = Math.max(.1, Number(state.settings.daily_capacity) || 8);
    const weeklyCap = Math.max(.1, Number(state.settings.weekly_capacity) || 40);
    const todayRem = activeTasks().filter(taskIsToday).reduce((sum, task) => sum + remainingEffort(task), 0);
    const todayDone = activeTasks().filter(taskIsToday).reduce((sum, task) => sum + doneEffort(task), 0);
    const weekRem = activeTasks().filter(taskIsThisWeek).reduce((sum, task) => sum + remainingEffort(task), 0);
    const weekDone = activeTasks().filter(taskIsThisWeek).reduce((sum, task) => sum + doneEffort(task), 0);
    return `
      <section class="task-command">
        <div>
          <p class="eyebrow">Capacity & WBS</p>
          <h2>タスクを作る、並べる、減らす</h2>
          <p class="muted">前ツールの入力項目と編集機能をここに集約しました。</p>
        </div>
        <form id="taskCapacityForm" class="task-capacity-form no-print">
          <label>日次<input class="input" name="daily_capacity" type="number" min="0.1" max="24" step="0.1" value="${state.settings.daily_capacity}"></label>
          <label>週次<input class="input" name="weekly_capacity" type="number" min="0.1" max="168" step="0.1" value="${state.settings.weekly_capacity}"></label>
          <button class="btn small" type="submit">保存</button>
        </form>
      </section>
      <div class="summary-strip">
        ${metricCard('今日の残り', `${todayRem.toFixed(1)}h`, `完了 ${todayDone.toFixed(1)}h / 上限 ${dailyCap.toFixed(1)}h`, todayRem / dailyCap, utilizationTone(todayRem / dailyCap))}
        ${metricCard('今週の残り', `${weekRem.toFixed(1)}h`, `完了 ${weekDone.toFixed(1)}h / 上限 ${weeklyCap.toFixed(1)}h`, weekRem / weeklyCap, utilizationTone(weekRem / weeklyCap))}
        ${metricCard('未完了', `${activeTasks().length}件`, `表示中 ${visible.length}件`, Math.min(1, activeTasks().length / 12), activeTasks().length ? 'amber' : 'green')}
      </div>
      ${renderCategoryEffort()}
      <details class="card task-entry no-print" open>
        <summary><strong>新しいタスクを追加</strong><span class="tiny">前ツール形式</span></summary>
        <form id="taskForm" style="margin-top:12px">
          ${taskEditFields({}, 'new')}
          <button class="btn primary block" type="submit">追加する</button>
        </form>
      </details>
      <div class="segmented no-print" style="margin-bottom:12px">
        <button type="button" data-action="task-filter" data-filter="all" aria-pressed="${taskFilter === 'all'}">すべて</button>
        <button type="button" data-action="task-filter" data-filter="self" aria-pressed="${taskFilter === 'self'}">自分</button>
        <button type="button" data-action="task-filter" data-filter="del" aria-pressed="${taskFilter === 'del'}">委任</button>
        <button type="button" data-action="task-filter" data-filter="done" aria-pressed="${taskFilter === 'done'}">完了</button>
      </div>
      <div class="task-list">${visible.length ? visible.map(taskCard).join('') : '<div class="empty">表示するタスクはありません</div>'}</div>`;
  }

  function renderCategoryEffort() {
    const rows = state.categories.map(cat => {
      const total = activeTasks().filter(task => task.category === cat.id).reduce((sum, task) => sum + remainingEffort(task), 0);
      return { cat, total };
    }).filter(row => row.total > 0);
    if (!rows.length) return '';
    const max = Math.max(...rows.map(row => row.total), .1);
    return `<section class="card task-effort-summary">
      <div class="row-between">
        <h3>カテゴリ別工数</h3>
        <span class="tiny">未完了の残工数</span>
      </div>
      <div class="task-effort-bars">
        ${rows.map(({ cat, total }) => `<div class="effort-row">
          <span class="effort-name"><i style="background:${escapeHTML(cat.color)}"></i>${escapeHTML(cat.label)}</span>
          <div class="bar"><span style="width:${Math.round(total / max * 100)}%;background:${escapeHTML(cat.color)}"></span></div>
          <strong>${total.toFixed(1)}h</strong>
        </div>`).join('')}
      </div>
    </section>`;
  }

  function renderTaskMasterSettings() {
    return `
      <div class="notice">
        タスクで使う「カテゴリ」「担当」「項目」を管理します。追加・編集・削除・並び替えができます。
      </div>
      ${renderCategoryMaster()}
      ${renderOwnerMaster()}
      ${renderTagMaster()}
      <div class="card no-print">
        <h3>既定値をリセット</h3>
        <p class="muted">カテゴリ・担当・項目を前ツールの初期状態に戻します。タスクや記録は削除されません。</p>
        <button class="btn danger block" type="button" data-action="reset-task-masters">マスタを初期化</button>
      </div>`;
  }

  function renderCategoryMaster() {
    return `<section class="card master-card">
      <div class="row-between">
        <h3>カテゴリ</h3>
        <span class="tiny">表示名・色・順序</span>
      </div>
      <div class="master-list">
        ${state.categories.map((cat, idx) => `<form id="categoryEditForm-${escapeHTML(cat.id)}" class="master-row" data-id="${escapeHTML(cat.id)}">
          <button class="swatch-btn" type="button" data-action="focus-color" data-target="catColor-${escapeHTML(cat.id)}" style="background:${escapeHTML(cat.color)}" aria-label="色を変更"></button>
          <input class="input color-input" id="catColor-${escapeHTML(cat.id)}" name="color" type="color" value="${escapeHTML(cat.color)}" aria-label="カテゴリ色">
          <input class="input" name="label" required maxlength="24" value="${escapeHTML(cat.label)}" aria-label="カテゴリ名">
          <div class="row master-actions">
            <button class="btn small" type="button" data-action="move-category" data-id="${escapeHTML(cat.id)}" data-dir="-1" ${idx === 0 ? 'disabled' : ''}>↑</button>
            <button class="btn small" type="button" data-action="move-category" data-id="${escapeHTML(cat.id)}" data-dir="1" ${idx === state.categories.length - 1 ? 'disabled' : ''}>↓</button>
            <button class="btn small" type="submit">保存</button>
            <button class="btn small danger" type="button" data-action="delete-category" data-id="${escapeHTML(cat.id)}">削除</button>
          </div>
        </form>`).join('')}
      </div>
      <form id="categoryForm" class="master-add no-print">
        <input class="input" name="label" required maxlength="24" placeholder="新しいカテゴリ名">
        <input class="input color-input" name="color" type="color" value="#1D9E75" aria-label="新しいカテゴリ色">
        <button class="btn primary" type="submit">追加</button>
      </form>
    </section>`;
  }

  function renderOwnerMaster() {
    return `<section class="card master-card">
      <div class="row-between">
        <h3>担当</h3>
        <span class="tiny">名称・順序</span>
      </div>
      <div class="master-list">
        ${state.owners.map((owner, idx) => `<form id="ownerEditForm-${idx}" class="master-row simple" data-value="${escapeHTML(owner)}">
          <input class="input" name="name" required maxlength="24" value="${escapeHTML(owner)}" aria-label="担当名">
          <div class="row master-actions">
            <button class="btn small" type="button" data-action="move-owner" data-value="${escapeHTML(owner)}" data-dir="-1" ${idx === 0 ? 'disabled' : ''}>↑</button>
            <button class="btn small" type="button" data-action="move-owner" data-value="${escapeHTML(owner)}" data-dir="1" ${idx === state.owners.length - 1 ? 'disabled' : ''}>↓</button>
            <button class="btn small" type="submit">保存</button>
            <button class="btn small danger" type="button" data-action="delete-owner" data-value="${escapeHTML(owner)}">削除</button>
          </div>
        </form>`).join('')}
      </div>
      <form id="ownerForm" class="master-add simple no-print">
        <input class="input" name="name" required maxlength="24" placeholder="新しい担当者名">
        <button class="btn primary" type="submit">追加</button>
      </form>
    </section>`;
  }

  function renderTagMaster() {
    return `<section class="card master-card">
      <div class="row-between">
        <h3>項目</h3>
        <span class="tiny">タグ・順序</span>
      </div>
      <div class="master-list">
        ${state.tags.map((tag, idx) => `<form id="tagEditForm-${idx}" class="master-row simple" data-value="${escapeHTML(tag)}">
          <input class="input" name="name" required maxlength="24" value="${escapeHTML(tag)}" aria-label="項目名">
          <div class="row master-actions">
            <button class="btn small" type="button" data-action="move-tag" data-value="${escapeHTML(tag)}" data-dir="-1" ${idx === 0 ? 'disabled' : ''}>↑</button>
            <button class="btn small" type="button" data-action="move-tag" data-value="${escapeHTML(tag)}" data-dir="1" ${idx === state.tags.length - 1 ? 'disabled' : ''}>↓</button>
            <button class="btn small" type="submit">保存</button>
            <button class="btn small danger" type="button" data-action="delete-tag" data-value="${escapeHTML(tag)}">削除</button>
          </div>
        </form>`).join('')}
      </div>
      <form id="tagForm" class="master-add simple no-print">
        <input class="input" name="name" required maxlength="24" placeholder="新しい項目名">
        <button class="btn primary" type="submit">追加</button>
      </form>
    </section>`;
  }

  function renderWBSPanel() {
    return `
      <div class="segmented no-print" style="margin-bottom:12px">
        <button type="button" data-action="wbs-mode" data-mode="list" aria-pressed="${wbsMode === 'list'}">一覧</button>
        <button type="button" data-action="wbs-mode" data-mode="gantt" aria-pressed="${wbsMode === 'gantt'}">ガント</button>
      </div>
      ${renderWBS()}`;
  }

  function renderTaskMatrix() {
    const groups = [
      { key: 'q2', label: '計画して実行', sub: '重要・非緊急', tone: 'blue', match: task => !task.urgent && task.important },
      { key: 'q1', label: '今すぐ対応', sub: '重要・緊急', tone: 'red', match: task => task.urgent && task.important },
      { key: 'q4', label: '通常どおり', sub: '非重要・非緊急', tone: 'gray', match: task => !task.urgent && !task.important },
      { key: 'q3', label: '協力依頼', sub: '非重要・緊急', tone: 'amber', match: task => task.urgent && !task.important }
    ];
    const active = activeTasks();
    return `
      <div class="notice">
        迷ったら「今すぐ対応」よりも「計画して実行」を先に保護します。緊急度だけで一日を埋めないための整理です。
      </div>
      <div class="matrix-axis top">重要度 高</div>
      <div class="priority-matrix">
        ${groups.map(group => {
          const tasks = active.filter(group.match);
          return `<section class="matrix-cell ${group.tone}">
            <div class="row-between">
              <div><strong>${escapeHTML(group.label)}</strong><div class="tiny">${escapeHTML(group.sub)}</div></div>
              <span class="badge">${tasks.length}件</span>
            </div>
            <div class="matrix-task-list">
              ${tasks.slice(0, 4).map(task => `<div class="matrix-task"><span>${escapeHTML(task.title)}</span><small>${remainingEffort(task).toFixed(1)}h</small></div>`).join('') || '<div class="tiny">該当なし</div>'}
            </div>
          </section>`;
        }).join('')}
      </div>
      <div class="matrix-axis bottom"><span>緊急度 低</span><span>緊急度 高</span></div>`;
  }

  function filteredTasks() {
    if (taskFilter === 'self') return activeTasks().filter(task => (task.owners || []).includes('自分'));
    if (taskFilter === 'del') return activeTasks().filter(task => !(task.owners || []).includes('自分'));
    if (taskFilter === 'done') return state.tasks.filter(t => t.status === 'done');
    return activeTasks();
  }

  function categoryOf(id) {
    return state.categories.find(c => c.id === id) || state.categories[0];
  }

  function taskEditFields(task = {}, prefix = 'task') {
    const taskOwners = Array.isArray(task.owners) && task.owners.length ? task.owners : ['自分'];
    const taskTags = Array.isArray(task.tags) ? task.tags : [];
    const idp = `${prefix}_`;
    return `
      <div class="field">
        <label for="${idp}title">タスク名</label>
        <input class="input" id="${idp}title" name="title" required maxlength="120" value="${escapeHTML(task.title || '')}" placeholder="タスク名を入力">
      </div>
      <div class="grid-2">
        <div class="field">
          <label for="${idp}category">カテゴリ</label>
          <select class="select" id="${idp}category" name="category">${state.categories.map(c => `<option value="${escapeHTML(c.id)}" ${task.category === c.id ? 'selected' : ''}>${escapeHTML(c.label)}</option>`).join('')}</select>
        </div>
        <div class="field">
          <label for="${idp}effort">工数(h)</label>
          <input class="input" id="${idp}effort" name="effort" type="number" min="0.1" max="80" step="0.1" value="${Number(task.effort || 1).toFixed(1)}">
        </div>
      </div>
      <div class="field">
        <label>担当（複数選択可）</label>
        <div class="row wrap">
          ${state.owners.map((owner, idx) => `<label class="chip"><input type="checkbox" name="owners" value="${escapeHTML(owner)}" ${(task.id ? taskOwners.includes(owner) : idx === 0) ? 'checked' : ''} style="margin-right:6px">${escapeHTML(owner)}</label>`).join('')}
        </div>
      </div>
      <div class="field">
        <label>項目（複数選択可）</label>
        <div class="row wrap">
          ${state.tags.map(tag => `<label class="chip"><input type="checkbox" name="tags" value="${escapeHTML(tag)}" ${taskTags.includes(tag) ? 'checked' : ''} style="margin-right:6px">${escapeHTML(tag)}</label>`).join('')}
        </div>
      </div>
      <div class="grid-2">
        <div class="field">
          <label for="${idp}start">開始日</label>
          <input class="input" id="${idp}start" name="start" type="date" value="${escapeHTML(task.start || '')}">
        </div>
        <div class="field">
          <label for="${idp}end">終了日</label>
          <input class="input" id="${idp}end" name="end" type="date" value="${escapeHTML(task.end || '')}">
        </div>
      </div>
      <div class="grid-2">
        <label class="chip"><input type="checkbox" name="urgent" ${task.urgent ? 'checked' : ''} style="margin-right:6px">緊急</label>
        <label class="chip"><input type="checkbox" name="important" ${task.important ? 'checked' : ''} style="margin-right:6px">重要</label>
      </div>
      <div class="grid-2" style="margin-top:12px">
        <div class="field">
          <label for="${idp}status">ステータス</label>
          <select class="select" id="${idp}status" name="status">
            <option value="todo" ${task.status === 'todo' || !task.status ? 'selected' : ''}>未着手</option>
            <option value="doing" ${task.status === 'doing' ? 'selected' : ''}>進行中</option>
            <option value="done" ${task.status === 'done' ? 'selected' : ''}>完了</option>
          </select>
        </div>
        <div class="field">
          <label for="${idp}progress">進捗率</label>
          <input class="input" id="${idp}progress" name="progress" type="range" min="0" max="100" step="5" value="${clamp(task.progress, 0, 100)}">
        </div>
      </div>
      <div class="field">
        <label for="${idp}value">価値領域</label>
        <select class="select" id="${idp}value" name="value_area"><option value="">未選択</option>${VALUE_AREAS.map(v => `<option value="${escapeHTML(v)}" ${task.value_area === v ? 'selected' : ''}>${escapeHTML(v)}</option>`).join('')}</select>
      </div>
      <div class="field">
        <label for="${idp}step">次の一手</label>
        <input class="input" id="${idp}step" name="next_step" maxlength="160" value="${escapeHTML(task.next_step || '')}" placeholder="例：資料の見出しだけ作る">
      </div>`;
  }

  function taskCard(task) {
    const cat = categoryOf(task.category);
    const idx = state.tasks.findIndex(item => item.id === task.id);
    const due = task.end ? dayDiff(task.end, TODAY()) : null;
    const dueBadge = due == null ? '' : due < 0 ? `<span class="badge red">${Math.abs(due)}日超過</span>` : due === 0 ? '<span class="badge red">今日まで</span>' : due <= 3 ? `<span class="badge">${due}日後</span>` : `<span class="badge">${due}日後</span>`;
    const period = task.start || task.end ? `${fmtDate(task.start) || '未定'} - ${fmtDate(task.end) || '未定'}` : '';
    const progress = clamp(task.progress, 0, 100);
    const progressTone = progress >= 100 ? 'var(--text-soft)' : progress >= 60 ? 'var(--accent)' : progress >= 30 ? 'var(--amber)' : 'var(--blue)';
    const statusLabel = { todo: '未着手', doing: '進行中', done: '完了' }[task.status] || '未着手';
    return `
      <article class="task-item legacy-task" data-task-id="${task.id}">
        <div class="task-order no-print">
          <button class="btn small" type="button" data-action="move-task" data-id="${task.id}" data-dir="-1" ${idx <= 0 ? 'disabled' : ''} aria-label="上へ">↑</button>
          <button class="btn small" type="button" data-action="move-task" data-id="${task.id}" data-dir="1" ${idx === state.tasks.length - 1 ? 'disabled' : ''} aria-label="下へ">↓</button>
        </div>
        <div class="legacy-task-body">
          <div class="row-between">
            <div class="task-title" style="${task.status === 'done' ? 'text-decoration:line-through;opacity:.55' : ''}">${escapeHTML(task.title)}</div>
            <span class="badge" style="background:${escapeHTML(cat.color)}22;color:${escapeHTML(cat.color)}">${escapeHTML(cat.label)}</span>
          </div>
          <div class="task-meta">
            <span class="badge">${escapeHTML(statusLabel)}</span>
            ${task.urgent ? '<span class="badge red">緊急</span>' : ''}
            ${task.important ? '<span class="badge blue">重要</span>' : ''}
            ${task.value_area ? `<span class="badge green">${escapeHTML(task.value_area)}</span>` : ''}
            ${dueBadge}
            <span class="badge">残 ${remainingEffort(task).toFixed(1)}h / ${Number(task.effort).toFixed(1)}h${progress > 0 ? ` / 完 ${doneEffort(task).toFixed(1)}h` : ''}</span>
            ${(task.owners || []).map(owner => `<span class="badge">担当:${escapeHTML(owner)}</span>`).join('')}
            ${(task.tags || []).map(tag => `<span class="badge">項目:${escapeHTML(tag)}</span>`).join('')}
          </div>
          ${period ? `<div class="tiny task-period">${escapeHTML(period)}</div>` : ''}
          ${task.next_step ? `<p class="tiny">次の一手：${escapeHTML(task.next_step)}</p>` : ''}
          <div class="row">
            <div class="bar" style="flex:1"><span style="width:${progress}%;background:${progressTone}"></span></div>
            <span class="tiny" style="min-width:42px;text-align:right;color:${progressTone}">${progress}%</span>
          </div>
        </div>
        <div class="task-actions no-print">
          <select class="select" data-action="task-status" data-id="${task.id}" aria-label="ステータス">
            <option value="todo" ${task.status === 'todo' ? 'selected' : ''}>未着手</option>
            <option value="doing" ${task.status === 'doing' ? 'selected' : ''}>進行中</option>
            <option value="done" ${task.status === 'done' ? 'selected' : ''}>完了</option>
          </select>
          <button class="btn small" type="button" data-action="task-panel" data-id="${task.id}" data-panel="progress">進捗</button>
          <button class="btn small" type="button" data-action="task-panel" data-id="${task.id}" data-panel="effort">工数</button>
          <button class="btn small" type="button" data-action="task-panel" data-id="${task.id}" data-panel="dates">期間</button>
          <button class="btn small" type="button" data-action="task-panel" data-id="${task.id}" data-panel="flags">フラグ</button>
          <button class="btn small" type="button" data-action="task-panel" data-id="${task.id}" data-panel="full">全編集</button>
          <button class="btn small danger" type="button" data-action="delete-task" data-id="${task.id}">削除</button>
        </div>
        ${renderTaskInlineEditor(task)}
      </article>`;
  }

  function renderTaskInlineEditor(task) {
    if (!taskInlineEditor || taskInlineEditor.id !== task.id) return '';
    const panel = taskInlineEditor.panel;
    if (panel === 'progress') {
      return `<form id="taskProgressForm-${task.id}" class="task-inline-edit no-print" data-task-id="${task.id}">
        <label>進捗率 <strong>${clamp(task.progress, 0, 100)}%</strong></label>
        <input class="input" name="progress" type="range" min="0" max="100" step="5" value="${clamp(task.progress, 0, 100)}">
        <button class="btn primary" type="submit">進捗を保存</button>
      </form>`;
    }
    if (panel === 'effort') {
      return `<form id="taskEffortForm-${task.id}" class="task-inline-edit no-print" data-task-id="${task.id}">
        <label for="taskEffort-${task.id}">工数(h)</label>
        <input class="input" id="taskEffort-${task.id}" name="effort" type="number" min="0.1" max="80" step="0.1" value="${Number(task.effort || 1).toFixed(1)}">
        <button class="btn primary" type="submit">工数を保存</button>
      </form>`;
    }
    if (panel === 'dates') {
      return `<form id="taskDatesForm-${task.id}" class="task-inline-edit no-print" data-task-id="${task.id}">
        <div class="grid-2">
          <div class="field"><label for="taskStart-${task.id}">開始日</label><input class="input" id="taskStart-${task.id}" name="start" type="date" value="${escapeHTML(task.start || '')}"></div>
          <div class="field"><label for="taskEnd-${task.id}">終了日</label><input class="input" id="taskEnd-${task.id}" name="end" type="date" value="${escapeHTML(task.end || '')}"></div>
        </div>
        <button class="btn primary" type="submit">期間を保存</button>
      </form>`;
    }
    if (panel === 'flags') {
      return `<form id="taskFlagsForm-${task.id}" class="task-inline-edit no-print" data-task-id="${task.id}">
        <div class="grid-2">
          <label class="chip"><input type="checkbox" name="urgent" ${task.urgent ? 'checked' : ''} style="margin-right:6px">緊急</label>
          <label class="chip"><input type="checkbox" name="important" ${task.important ? 'checked' : ''} style="margin-right:6px">重要</label>
        </div>
        <button class="btn primary" type="submit">フラグを保存</button>
      </form>`;
    }
    return `<form id="taskEditForm-${task.id}" class="task-inline-edit no-print" data-task-id="${task.id}">
      ${taskEditFields(task, `edit_${task.id}`)}
      <button class="btn primary block" type="submit">変更を保存</button>
    </form>`;
  }

  function renderWBS() {
    return wbsMode === 'gantt' ? renderWBSGantt() : renderWBSList();
  }

  function renderWBSList() {
    if (!state.tasks.length) return '<div class="empty">タスクを追加すると、ここにWBSが表示されます</div>';
    let wbsNo = 1;
    return `<div class="stack">${state.categories.map(category => {
      const rows = state.tasks.filter(task => task.category === category.id);
      if (!rows.length) return '';
      const total = rows.reduce((sum, task) => sum + Number(task.effort || 0), 0);
      const avg = Math.round(rows.reduce((sum, task) => sum + Number(task.progress || 0), 0) / rows.length);
      let childNo = 1;
      return `<section class="wbs-group">
        <div class="wbs-group-head" style="border-left-color:${escapeHTML(category.color)}">
          <strong>${wbsNo}. ${escapeHTML(category.label)}</strong>
          <span class="tiny">${rows.length}件 / ${total.toFixed(1)}h / 平均${avg}%</span>
        </div>
        <div class="stack">
          ${rows.map(task => wbsTaskRow(task, `${wbsNo}.${childNo++}`, category)).join('')}
        </div>
      </section>${(() => { wbsNo += 1; return ''; })()}`;
    }).join('')}</div>`;
  }

  function wbsTaskRow(task, no, category) {
    const period = task.start || task.end ? `${fmtDate(task.start) || '未定'} - ${fmtDate(task.end) || '未定'}` : '日程未定';
    const statusLabel = { todo: '未着手', doing: '進行中', done: '完了' }[task.status] || '未着手';
    const q = task.urgent && task.important ? 'Q1 今すぐ対応'
      : !task.urgent && task.important ? 'Q2 計画して実行'
      : task.urgent ? 'Q3 協力依頼'
      : 'Q4 通常どおり';
    return `<article class="wbs-row">
      <div class="row-between">
        <strong>${escapeHTML(no)} ${escapeHTML(task.title)}</strong>
        <span class="badge" style="background:${escapeHTML(category.color)}22;color:${escapeHTML(category.color)}">${escapeHTML(statusLabel)}</span>
      </div>
      <div class="task-meta">
        <span class="badge">${escapeHTML(period)}</span>
        <span class="badge">${Number(task.effort).toFixed(1)}h</span>
        <span class="badge">${escapeHTML(q)}</span>
        ${(task.owners || []).map(owner => `<span class="badge">担当:${escapeHTML(owner)}</span>`).join('')}
        ${(task.tags || []).map(tag => `<span class="badge">項目:${escapeHTML(tag)}</span>`).join('')}
      </div>
      <div class="row" style="margin-top:8px">
        <div class="bar" style="flex:1"><span style="width:${clamp(task.progress, 0, 100)}%;background:${escapeHTML(category.color)}"></span></div>
        <span class="tiny" style="min-width:42px;text-align:right">${clamp(task.progress, 0, 100)}%</span>
      </div>
    </article>`;
  }

  function renderWBSGantt() {
    if (!state.tasks.length) return '<div class="empty">タスクを追加すると、ここにガントが表示されます</div>';
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const pastDays = 7;
    const futureDays = 28;
    const totalDays = pastDays + futureDays + 1;
    const days = Array.from({ length: totalDays }, (_, i) => {
      const offset = i - pastDays;
      const d = new Date(today);
      d.setDate(d.getDate() + offset);
      return { offset, date: d, month: d.getMonth() + 1, day: d.getDate(), wday: '日月火水木金土'[d.getDay()] };
    });
    const monthHeader = days.map((d, idx) => `<div class="gantt-day ${d.offset === 0 ? 'today' : ''}">${idx === 0 || d.day === 1 ? `${d.month}月` : ''}</div>`).join('');
    const dayHeader = days.map(d => `<div class="gantt-day ${d.offset === 0 ? 'today' : ''}">${d.offset === 0 ? '今' : d.day}</div>`).join('');
    const wdayHeader = days.map(d => `<div class="gantt-day ${d.offset === 0 ? 'today' : ''}">${d.wday}</div>`).join('');
    let groupNo = 1;
    const rows = state.categories.map(category => {
      const tasks = state.tasks.filter(task => task.category === category.id);
      if (!tasks.length) return '';
      const total = tasks.reduce((sum, task) => sum + Number(task.effort || 0), 0);
      const avg = Math.round(tasks.reduce((sum, task) => sum + Number(task.progress || 0), 0) / tasks.length);
      const categoryRow = `
        <div class="gantt-cat-label" style="border-left-color:${escapeHTML(category.color)}">
          <strong>${groupNo}. ${escapeHTML(category.label)}</strong>
          <span>${tasks.length}件 / ${total.toFixed(1)}h / 平均${avg}%</span>
        </div>
        <div class="gantt-cat-track">${days.map(d => `<span class="${d.offset === 0 ? 'today' : ''}"></span>`).join('')}</div>`;
      let childNo = 1;
      const taskRows = tasks.map(task => ganttRow(task, `${groupNo}.${childNo++}`, category, today, pastDays, futureDays, days)).join('');
      groupNo += 1;
      return categoryRow + taskRows;
    }).join('');
    return `<div class="gantt-scroll">
      <div class="gantt-grid gantt-grid-old" style="--gantt-days:${totalDays}">
        <div class="gantt-title">月</div><div class="gantt-days">${monthHeader}</div>
        <div class="gantt-title">日</div><div class="gantt-days">${dayHeader}</div>
        <div class="gantt-title">曜</div><div class="gantt-days">${wdayHeader}</div>
        ${rows}
      </div>
      <div class="wbs-scroll-hint no-print">← 7日前から28日後まで横スクロールできます →</div>
    </div>`;
  }

  function ganttRow(task, no, category, today, pastDays, futureDays, days) {
    const startDate = parseDate(task.start || task.end) || today;
    const endDate = parseDate(task.end || task.start) || startDate;
    const rawStart = Math.round((startDate - today) / 86400000);
    const rawEnd = Math.round((endDate - today) / 86400000);
    const start = clamp(rawStart + pastDays + 1, 1, pastDays + futureDays + 1);
    const end = clamp(rawEnd + pastDays + 1, 1, pastDays + futureDays + 1);
    const span = Math.max(1, end - start + 1);
    const statusLabel = { todo: '未着手', doing: '進行中', done: '完了' }[task.status] || '未着手';
    const due = task.end ? dayDiff(task.end, TODAY()) : null;
    const dueClass = due == null ? '' : due < 0 ? 'overdue' : due <= 3 ? 'soon' : '';
    const ownerText = (task.owners || []).join(' / ');
    return `
      <div class="gantt-task-label">
        <strong>${escapeHTML(no)} ${escapeHTML(task.title)}</strong>
        <span>${escapeHTML(statusLabel)} / ${Number(task.effort).toFixed(1)}h / ${clamp(task.progress, 0, 100)}%${ownerText ? ` / ${escapeHTML(ownerText)}` : ''}</span>
      </div>
      <div class="gantt-track">
        ${days.map(d => `<span class="gantt-bg-cell ${d.offset === 0 ? 'today' : ''}"></span>`).join('')}
        <div class="gantt-marker start" style="grid-column:${start};border-color:${escapeHTML(category.color)}"></div>
        <div class="gantt-bar ${dueClass}" style="grid-column:${start} / span ${span};background:${escapeHTML(category.color)}">
          <span style="width:${clamp(task.progress, 0, 100)}%"></span>
        </div>
        <div class="gantt-marker end ${dueClass}" style="grid-column:${end};"></div>
      </div>`;
  }

  function renderCare() {
    return `
      ${topbar('ケア')}
      <div class="segmented" style="margin-bottom:12px">
        <button type="button" data-action="care-mode" data-mode="stress" aria-pressed="${careMode === 'stress'}">ストレス</button>
        <button type="button" data-action="care-mode" data-mode="works" aria-pressed="${careMode === 'works'}">ワーク</button>
        <button type="button" data-action="care-mode" data-mode="log" aria-pressed="${careMode === 'log'}">履歴</button>
      </div>
      ${careMode === 'stress' ? renderStressPanel() : careMode === 'log' ? renderCareLog() : renderWorksList()}`;
  }

  function renderWorksList() {
    return `
      <div class="stack">
        ${Object.entries(WORKS).map(([key, work]) => `
          <button class="card" type="button" data-action="open-work" data-work="${key}" style="text-align:left">
            <div class="row-between"><h3>${escapeHTML(work.name)}</h3><span class="badge">${escapeHTML(work.duration)}</span></div>
            <p class="muted">${escapeHTML(work.summary)}</p>
            <span class="tiny">${escapeHTML(work.type)}</span>
          </button>
        `).join('')}
      </div>`;
  }

  function renderStressPanel() {
    const selected = selectedStressCell || {
      locId: state.stress_locations[0]?.id,
      areaId: state.stress_areas[0]?.id
    };
    const selectedLoc = state.stress_locations.find(loc => loc.id === selected.locId) || state.stress_locations[0];
    const selectedArea = state.stress_areas.find(area => area.id === selected.areaId) || state.stress_areas[0];
    const persistedData = state.stress_latest[stressKey(selectedLoc?.id, selectedArea?.id)] || { score: 3, note: '' };
    const selectedData = {
      ...persistedData,
      score: selected.score || persistedData.score || 3
    };
    return `
      <div class="card">
        <div class="row-between">
          <div>
            <h3>ストレスマトリクス</h3>
            <p class="muted">セルを選び、下の入力ドックで記録します。5=非常に良い、1=非常に悪い。2以下はケア優先サインです。</p>
          </div>
          <span class="badge ${stressCareCount() ? 'red' : 'green'}">ケア優先 ${stressCareCount()}件</span>
        </div>
        <div class="stress-dock no-print" id="stressCellEditor" role="region" aria-label="ストレス入力">
          <div class="stress-dock-head">
            <div>
              <strong>${escapeHTML(selectedLoc?.label || '')} × ${escapeHTML(selectedArea?.label || '')}</strong>
              <span>${selectedData.score} / ${STRESS_LABELS[selectedData.score]}</span>
            </div>
            <button class="btn small primary" type="button" data-action="stress-save">保存</button>
          </div>
          <div class="score-choice-row compact">
            ${[5, 4, 3, 2, 1].map(score => `<button class="score-choice ${Number(selectedData.score) === score ? 'active' : ''}" type="button" data-action="stress-score" data-score="${score}">
              <strong>${score}</strong><span>${STRESS_LABELS[score]}</span>
            </button>`).join('')}
          </div>
          <details class="stress-note-toggle">
            <summary>メモ（任意）</summary>
            <textarea class="textarea" id="stressCellNote" maxlength="500">${escapeHTML(selectedData.note || '')}</textarea>
          </details>
        </div>
        <div class="stress-matrix-mobile">
          ${state.stress_locations.map(loc => {
            const scores = state.stress_areas.map(area => Number(state.stress_latest[stressKey(loc.id, area.id)]?.score || 3));
            const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
            return `<section class="stress-loc-card">
              <div class="row-between">
                <strong>${escapeHTML(loc.label)}</strong>
                <span class="tiny">平均 ${avg.toFixed(1)} / ${STRESS_LABELS[Math.round(avg)]}</span>
              </div>
              <div class="stress-loc-grid">
                ${state.stress_areas.map(area => {
                  const key = stressKey(loc.id, area.id);
                  const data = state.stress_latest[key] || { score: 3 };
                  const active = selectedLoc?.id === loc.id && selectedArea?.id === area.id;
                  return `<button class="stress-matrix-cell ${active ? 'active' : ''}" type="button" data-action="stress-select" data-loc="${escapeHTML(loc.id)}" data-area="${escapeHTML(area.id)}">
                    <strong style="color:${STRESS_COLORS[data.score] || 'var(--text)'}">${data.score}</strong>
                    <span>${escapeHTML(area.label)}</span>
                  </button>`;
                }).join('')}
              </div>
            </section>`;
          }).join('')}
        </div>
      </div>
    `;
  }

  function renderCareLog() {
    const rows = [...state.work_sessions].sort((a, b) => b.created_at.localeCompare(a.created_at)).slice(0, 20);
    const stress = [...state.stress_logs].sort((a, b) => b.created_at.localeCompare(a.created_at)).slice(0, 10);
    return `
      <h2>ワーク履歴</h2>
      <div class="stack">${rows.length ? rows.map(w => `<div class="card"><strong>${escapeHTML(WORKS[w.work_key]?.name || w.work_key)}</strong><div class="tiny">${escapeHTML(w.date)}</div>${w.summary ? `<p class="muted">${escapeHTML(w.summary)}</p>` : ''}</div>`).join('') : '<div class="empty">ワーク履歴はありません</div>'}</div>
      <h2>ストレス履歴</h2>
      <div class="stack">${stress.length ? stress.map(log => `<div class="card"><strong>${escapeHTML(log.date)}</strong><div class="tiny">平均 ${log.average.toFixed(1)}</div>${stressLogSummary(log)}</div>`).join('') : '<div class="empty">ストレス履歴はありません</div>'}</div>`;
  }

  function stressLogSummary(log) {
    const scores = log.scores || {};
    const chips = Object.entries(scores).map(([key, score]) => {
      const labels = stressKeyLabels(key);
      return `<span class="badge">${escapeHTML(labels.label)}:${score}</span>`;
    }).join('');
    const note = log.note ? `<p class="muted">${escapeHTML(log.note)}</p>` : '';
    return `<div class="task-meta" style="margin-top:8px">${chips}</div>${note}`;
  }

  function stressKeyLabels(key) {
    if (String(key).includes('__')) {
      const [locId, areaId] = String(key).split('__');
      const loc = state.stress_locations.find(x => x.id === locId) || { label: locId };
      const area = state.stress_areas.find(x => x.id === areaId) || { label: areaId };
      return { loc, area, label: `${loc.label} × ${area.label}` };
    }
    const raw = String(key);
    const rawParts = raw.split('_');
    if (rawParts.length >= 2) {
      const locLabel = rawParts[0];
      const areaLabel = rawParts.slice(1).join('_');
      const loc = state.stress_locations.find(x => x.id === locLabel || x.label === locLabel) || { label: locLabel };
      const area = state.stress_areas.find(x => x.id === areaLabel || x.label === areaLabel) || { label: areaLabel };
      return { loc, area, label: `${loc.label} × ${area.label}` };
    }
    const loc = state.stress_locations.find(x => x.id === raw || x.label === raw) || { label: raw };
    return { loc, area: null, label: loc.label };
  }

  function renderWork() {
    const key = route.params.key;
    const work = WORKS[key];
    if (!work) return `${topbar('ワーク', 'care')}<div class="empty">ワークが見つかりません</div>`;
    return `
      ${topbar(work.name, 'care')}
      <div class="notice"><strong>${escapeHTML(work.duration)} / ${escapeHTML(work.type)}</strong><br>${escapeHTML(work.summary)}</div>
      <form id="workForm" data-work="${escapeHTML(key)}" class="stack" style="margin-top:12px">
        <div class="card">
          ${work.fields.map(fieldHTML).join('')}
        </div>
        <button class="btn primary block" type="submit">保存して閉じる</button>
      </form>`;
  }

  function fieldHTML(field) {
    if (field.type === 'textarea') return `<div class="field"><label for="w_${field.key}">${escapeHTML(field.label)}</label><textarea class="textarea" id="w_${field.key}" name="${field.key}" maxlength="800"></textarea></div>`;
    if (field.type === 'input') return `<div class="field"><label for="w_${field.key}">${escapeHTML(field.label)}</label><input class="input" id="w_${field.key}" name="${field.key}" maxlength="200"></div>`;
    if (field.type === 'select') return `<div class="field"><label for="w_${field.key}">${escapeHTML(field.label)}</label><select class="select" id="w_${field.key}" name="${field.key}">${field.options.map(o => `<option value="${escapeHTML(o)}">${escapeHTML(o)}</option>`).join('')}</select></div>`;
    if (field.type === 'scale10') return scaleField(field.key, field.label, '', 1, 10, '1 低い', '10 高い');
    if (field.type === 'scale5') return scaleField(field.key, field.label, '', 1, 5, '1 低い', '5 高い');
    return '';
  }

  function renderScales() {
    return `
      ${topbar('尺度')}
      <div class="notice warn">
        尺度はセルフチェック用です。スコアは診断ではなく、変化を観察するための目安として扱ってください。
      </div>
      <div class="stack" style="margin-top:12px">
        ${Object.entries(SCALES).map(([key, scale]) => {
          const latest = latestScale(key);
          const meta = latest ? `<span class="badge green">前回 ${escapeHTML(latest.date)}</span>` : `<span class="badge">未実施</span>`;
          return `<button class="card" type="button" data-action="open-scale" data-scale="${escapeHTML(key)}" style="text-align:left">
            <div class="row-between"><h3>${escapeHTML(scale.name)}</h3>${meta}</div>
            <p class="muted">${escapeHTML(scale.purpose || '')}</p>
            <span class="tiny">${escapeHTML(scale.duration || '')} / ${scale.items.length}項目</span>
          </button>`;
        }).join('')}
      </div>`;
  }

  function renderScaleRun() {
    const key = route.params.key;
    const scale = SCALES[key];
    if (!scale) return `${topbar('尺度', 'scales')}<div class="empty">尺度が見つかりません</div>`;
    const answered = Object.keys(scaleAnswers).length;
    return `
      ${topbar(scale.name, 'scales')}
      <div class="notice">
        <strong>${answered}/${scale.items.length}項目</strong><br>${escapeHTML(scale.instruction || scale.purpose || '')}
      </div>
      <form id="scaleForm" data-scale="${escapeHTML(key)}" class="stack" style="margin-top:12px">
        ${scale.items.map((item, index) => `
          <div class="card">
            <div class="row-between"><strong>${index + 1}. ${escapeHTML(item.text)}</strong><span class="tiny">${index + 1}/${scale.items.length}</span></div>
            <div class="scale-row" style="margin-top:12px">
              ${numberRange(scale.min, scale.max).map(value => `<button class="scale-btn" type="button" data-action="scale-answer" data-item="${escapeHTML(item.id)}" data-value="${value}" aria-pressed="${Number(scaleAnswers[item.id]) === value}" title="${escapeHTML(scale.labels[value - scale.min] || String(value))}">${value}</button>`).join('')}
            </div>
            <div class="scale-labels"><span>${escapeHTML(scale.minLabel || scale.labels[0] || '')}</span><span>${escapeHTML(scale.maxLabel || scale.labels[scale.labels.length - 1] || '')}</span></div>
          </div>
        `).join('')}
        <button class="btn primary block" type="submit">スコアを保存</button>
      </form>`;
  }

  function numberRange(min, max) {
    return Array.from({ length: max - min + 1 }, (_, i) => min + i);
  }

  function renderSettings() {
    return `
      ${topbar('設定')}
      <form id="settingsForm" class="stack">
        <div class="card">
          <h3>基本設定</h3>
          <div class="field">
            <label for="displayName">表示名</label>
            <input class="input" id="displayName" name="display_name" maxlength="30" value="${escapeHTML(state.settings.display_name)}">
          </div>
          <div class="grid-2">
            <div class="field">
              <label for="dailyCap">日次キャパシティ(h)</label>
              <input class="input" id="dailyCap" name="daily_capacity" type="number" min="0.1" max="24" step="0.1" value="${state.settings.daily_capacity}">
            </div>
            <div class="field">
              <label for="weeklyCap">週次キャパシティ(h)</label>
              <input class="input" id="weeklyCap" name="weekly_capacity" type="number" min="0.1" max="168" step="0.1" value="${state.settings.weekly_capacity}">
            </div>
          </div>
          <label class="chip" style="justify-content:flex-start"><input type="checkbox" name="save_free_text" ${state.settings.save_free_text ? 'checked' : ''} style="margin-right:8px">自由記述を保存する</label>
        </div>
        <button class="btn primary block" type="submit">設定を保存</button>
      </form>

      <h2>タスク設定</h2>
      <div class="card">
        <h3>カテゴリ・担当・項目</h3>
        <p class="muted">タスクで使うマスタは、タスク画面の「設定」に集約しました。編集・削除・並び替え・初期化ができます。</p>
        <button class="btn block" type="button" data-action="open-task-settings">タスク設定を開く</button>
      </div>

      <h2>ストレス場所</h2>
      <div class="stack">
        ${state.stress_locations.map(loc => `<div class="card row-between"><span>${escapeHTML(loc.label)}</span><button class="btn small danger" type="button" data-action="delete-stress-location" data-id="${escapeHTML(loc.id)}">削除</button></div>`).join('')}
      </div>
      <form id="stressLocationForm" class="card" style="margin-top:12px">
        <h3>場所を追加</h3>
        <div class="field"><label for="stressLocationLabel">場所名</label><input class="input" id="stressLocationLabel" name="label" required maxlength="24" placeholder="例：実家"></div>
        <button class="btn block" type="submit">追加</button>
      </form>

      <h2>データ</h2>
      <div class="card stack">
        <button class="btn block" type="button" data-action="export-json">JSONで書き出す</button>
        <button class="btn block" type="button" data-nav="data">読み込み・削除を開く</button>
      </div>

      <div class="notice warn">
        つらさが強い、生活への支障が大きい、自分を傷つけたい気持ちがある場合は、このアプリだけで抱えず、医療機関・専門家・地域の相談窓口に相談してください。
      </div>`;
  }

  function renderData() {
    return `
      ${topbar('データ管理', 'settings')}
      <div class="card">
        <div class="row-between gas-head">
          <div>
            <h3>Google スプレッドシート連携</h3>
            <p class="muted">GAS Web App の URL を設定すると、保存時に自動同期し、手動で読み込み・送信もできます。</p>
          </div>
          <span class="sync-pill ${escapeHTML(syncState)}"><span id="syncDot" class="sync-dot ${escapeHTML(syncState)}"></span><span id="syncText">${escapeHTML(syncMessage)}</span></span>
        </div>
        <form id="gasForm" class="gas-form no-print">
          <div class="field">
            <label for="gasUrlInput">GAS Web App URL</label>
            <input class="input" id="gasUrlInput" name="gas_url" inputmode="url" value="${escapeHTML(gasUrl)}" placeholder="https://script.google.com/macros/s/.../exec">
          </div>
          <div class="row wrap">
            <button class="btn primary" type="submit">URLを保存</button>
            <button class="btn" type="button" data-action="force-sync-sheets">今すぐ Sheets へ保存</button>
            <button class="btn" type="button" data-action="reload-sheets">Sheets から再読み込み</button>
            <button class="btn danger" type="button" data-action="clear-gas-url">クリア</button>
          </div>
        </form>
        <p id="gasStatusMsg" class="tiny ${gasMessageIsError ? 'danger-text' : ''}">${escapeHTML(gasMessage)}</p>
      </div>
      <div class="card">
        <h3>JSONを読み込む</h3>
        <form id="importForm">
          <div class="field">
            <label for="importText">JSON</label>
            <textarea class="textarea" id="importText" name="json" style="min-height:160px" placeholder='{ "schema_version": 1, ... }'></textarea>
          </div>
          <button class="btn block" type="submit">読み込む</button>
        </form>
      </div>
      <div class="card">
        <h3 style="color:var(--red)">端末内データを削除</h3>
        <p class="muted">削除後は元に戻せません。必要なら先にJSONで書き出してください。</p>
        <button class="btn danger block" type="button" data-action="delete-all">すべて削除</button>
      </div>`;
  }

  function handleSubmit(event) {
    const form = event.target;
    if (!(form instanceof HTMLFormElement)) return;
    event.preventDefault();
    if (form.id === 'checkinForm') saveCheckin(form);
    if (form.id === 'taskCapacityForm') saveTaskCapacity(form);
    if (form.id === 'taskForm') saveTask(form);
    if (form.id.startsWith('taskEditForm-')) saveTaskEdit(form);
    if (form.id.startsWith('taskProgressForm-')) saveTaskProgress(form);
    if (form.id.startsWith('taskEffortForm-')) saveTaskEffort(form);
    if (form.id.startsWith('taskDatesForm-')) saveTaskDates(form);
    if (form.id.startsWith('taskFlagsForm-')) saveTaskFlags(form);
    if (form.id === 'stressForm') saveStress(form);
    if (form.id === 'workForm') saveWork(form);
    if (form.id === 'scaleForm') saveScale(form);
    if (form.id === 'settingsForm') saveSettings(form);
    if (form.id === 'categoryForm') saveCategory(form);
    if (form.id.startsWith('categoryEditForm-')) saveCategoryEdit(form);
    if (form.id === 'ownerForm') saveOwner(form);
    if (form.id.startsWith('ownerEditForm-')) saveOwnerEdit(form);
    if (form.id === 'tagForm') saveTag(form);
    if (form.id.startsWith('tagEditForm-')) saveTagEdit(form);
    if (form.id === 'stressLocationForm') saveStressLocation(form);
    if (form.id === 'gasForm') saveGasUrl(form);
    if (form.id === 'importForm') importJSON(form);
  }

  function formData(form) {
    return Object.fromEntries(new FormData(form).entries());
  }

  function saveCheckin(form) {
    const data = formData(form);
    const existingIndex = state.checkins.findIndex(x => x.date === TODAY());
    const freeText = state.settings.save_free_text;
    const checkin = {
      id: existingIndex >= 0 ? state.checkins[existingIndex].id : `check_${Date.now()}`,
      date: TODAY(),
      created_at: existingIndex >= 0 ? state.checkins[existingIndex].created_at : NOW(),
      updated_at: NOW(),
      mood: data.mood ? Number(data.mood) : null,
      body: data.body ? Number(data.body) : null,
      anxiety: data.anxiety ? Number(data.anxiety) : null,
      fusion: data.fusion ? Number(data.fusion) : null,
      avoidance: data.avoidance ? Number(data.avoidance) : null,
      value_area: data.value_area || '',
      committed_action: freeText ? (data.committed_action || '').slice(0, 500) : '',
      thought: freeText ? (data.thought || '').slice(0, 500) : ''
    };
    if (existingIndex >= 0) state.checkins[existingIndex] = checkin;
    else state.checkins.push(checkin);
    saveState();
    toast('今日の記録を保存しました');
    setRoute('home');
  }

  function saveTaskCapacity(form) {
    const data = formData(form);
    state.settings.daily_capacity = Math.round(Math.max(.1, Number(data.daily_capacity) || 8) * 10) / 10;
    state.settings.weekly_capacity = Math.round(Math.max(.1, Number(data.weekly_capacity) || 40) * 10) / 10;
    saveState();
    toast('キャパシティを保存しました');
    taskSection = 'manage';
    setRoute('tasks');
  }

  function saveTask(form) {
    const payload = readTaskPayload(form, {});
    if (!payload) return;
    state.tasks.push({
      ...payload,
      id: state.task_next_id++,
      created_at: NOW(),
      updated_at: NOW()
    });
    saveState();
    toast('タスクを追加しました');
    taskInlineEditor = null;
    taskSection = 'manage';
    setRoute('tasks');
  }

  function saveTaskEdit(form) {
    const task = state.tasks.find(item => item.id === Number(form.dataset.taskId));
    if (!task) return;
    const payload = readTaskPayload(form, task);
    if (!payload) return;
    Object.assign(task, payload, { updated_at: NOW() });
    saveState();
    toast('タスクを更新しました');
    taskInlineEditor = null;
    taskSection = 'manage';
    setRoute('tasks');
  }

  function saveTaskProgress(form) {
    const task = state.tasks.find(item => item.id === Number(form.dataset.taskId));
    if (!task) return;
    const progress = clamp(formData(form).progress, 0, 100);
    task.progress = progress;
    if (progress >= 100) task.status = 'done';
    task.updated_at = NOW();
    saveState();
    toast('進捗を保存しました');
    taskInlineEditor = null;
    setRoute('tasks');
  }

  function saveTaskEffort(form) {
    const task = state.tasks.find(item => item.id === Number(form.dataset.taskId));
    if (!task) return;
    const effort = Math.round(Math.max(.1, Number(formData(form).effort) || 1) * 10) / 10;
    task.effort = effort;
    task.updated_at = NOW();
    saveState();
    toast('工数を保存しました');
    taskInlineEditor = null;
    setRoute('tasks');
  }

  function saveTaskDates(form) {
    const task = state.tasks.find(item => item.id === Number(form.dataset.taskId));
    if (!task) return;
    const data = formData(form);
    if (data.start && data.end && data.start > data.end) {
      toast('開始日が終了日より後です');
      return;
    }
    task.start = data.start || '';
    task.end = data.end || '';
    task.updated_at = NOW();
    saveState();
    toast('期間を保存しました');
    taskInlineEditor = null;
    setRoute('tasks');
  }

  function saveTaskFlags(form) {
    const task = state.tasks.find(item => item.id === Number(form.dataset.taskId));
    if (!task) return;
    const data = formData(form);
    task.urgent = Boolean(data.urgent);
    task.important = Boolean(data.important);
    task.updated_at = NOW();
    saveState();
    toast('フラグを保存しました');
    taskInlineEditor = null;
    setRoute('tasks');
  }

  function readTaskPayload(form, existing) {
    const fd = new FormData(form);
    const data = Object.fromEntries(fd.entries());
    if (!String(data.title || '').trim()) {
      toast('タスク名を入力してください');
      return null;
    }
    if (data.start && data.end && data.start > data.end) {
      toast('開始日が終了日より後です');
      return null;
    }
    const effort = Math.round(Math.max(.1, Number(data.effort) || 1) * 10) / 10;
    const owners = fd.getAll('owners').map(String).filter(Boolean);
    const tags = fd.getAll('tags').map(String).filter(Boolean);
    const status = ['todo', 'doing', 'done'].includes(data.status) ? data.status : 'todo';
    return {
      title: String(data.title || '').trim(),
      category: data.category || state.categories[0].id,
      effort,
      start: data.start || '',
      end: data.end || '',
      urgent: Boolean(data.urgent),
      important: Boolean(data.important),
      owners: owners.length ? owners : [state.owners[0] || '自分'],
      tags,
      value_area: data.value_area || '',
      next_step: state.settings.save_free_text ? (data.next_step || '').slice(0, 160) : '',
      status,
      progress: clamp(data.progress, 0, 100),
      created_at: existing.created_at || NOW()
    };
  }

  function saveStress(form) {
    const data = formData(form);
    const scores = {};
    const notes = {};
    state.stress_locations.forEach(loc => {
      const score = clamp(data[`stress_${loc.id}`] || 3, 1, 5);
      const note = state.settings.save_free_text ? String(data[`stress_note_${loc.id}`] || '').slice(0, 500) : '';
      state.stress_areas.forEach(area => {
        const key = stressKey(loc.id, area.id);
        scores[key] = score;
        notes[key] = note;
        state.stress_latest[key] = { score, note, date: TODAY() };
      });
    });
    const scoreValues = Object.values(scores);
    const average = scoreValues.reduce((a, b) => a + b, 0) / Math.max(1, scoreValues.length);
    const note = Object.entries(notes).filter(([, value]) => value).map(([key, value]) => {
      return `${stressKeyLabels(key).label}: ${value}`;
    }).join(' / ');
    state.stress_logs.push({ id: `stress_${Date.now()}`, date: TODAY(), created_at: NOW(), scores, notes, average, note });
    saveState();
    toast('ストレス状態を保存しました');
    careMode = average <= 2.2 ? 'works' : 'stress';
    setRoute('care');
  }

  function currentStressSelection() {
    const fallbackLoc = state.stress_locations[0];
    const fallbackArea = state.stress_areas[0];
    const selected = selectedStressCell || { locId: fallbackLoc?.id, areaId: fallbackArea?.id };
    const loc = state.stress_locations.find(item => item.id === selected.locId) || fallbackLoc;
    const area = state.stress_areas.find(item => item.id === selected.areaId) || fallbackArea;
    return { loc, area, key: stressKey(loc?.id, area?.id), score: selected.score };
  }

  function selectStressCell(locId, areaId) {
    selectedStressCell = { locId, areaId };
    render();
  }

  function setSelectedStressScore(target) {
    const score = clamp(target.dataset.score, 1, 5);
    const current = currentStressSelection();
    if (!current.loc || !current.area) return;
    selectedStressCell = { locId: current.loc.id, areaId: current.area.id, score };
    document.querySelectorAll('.score-choice').forEach(btn => {
      btn.classList.toggle('active', Number(btn.dataset.score) === score);
    });
  }

  function saveSelectedStressCell() {
    const current = currentStressSelection();
    if (!current.loc || !current.area) return;
    const previous = state.stress_latest[current.key] || { score: 3, note: '' };
    const score = clamp(current.score || previous.score || 3, 1, 5);
    const noteInput = byId('stressCellNote');
    const note = state.settings.save_free_text ? String(noteInput?.value || '').slice(0, 500) : '';
    state.stress_latest[current.key] = { score, note, date: TODAY() };
    state.stress_logs.unshift({
      id: `stress_${Date.now()}`,
      date: TODAY(),
      created_at: NOW(),
      scores: { [current.key]: score },
      notes: { [current.key]: note },
      average: score,
      note: note ? `${current.loc.label} × ${current.area.label}: ${note}` : `${current.loc.label} × ${current.area.label}`
    });
    selectedStressCell = { locId: current.loc.id, areaId: current.area.id };
    saveState();
    toast('ストレス状態を保存しました');
    render();
  }

  function saveWork(form) {
    const key = form.dataset.work;
    const work = WORKS[key];
    const data = formData(form);
    const freeText = state.settings.save_free_text;
    const payload = {};
    Object.entries(data).forEach(([k, v]) => {
      payload[k] = freeText || /^before$|^after$/.test(k) ? String(v).slice(0, 800) : '';
    });
    const summary = payload.action || payload.activity || payload.next || payload.must || '';
    state.work_sessions.push({
      id: `work_${Date.now()}`,
      work_key: key,
      work_type: work?.type || '',
      date: TODAY(),
      created_at: NOW(),
      inputs: payload,
      summary: String(summary).slice(0, 160)
    });
    if (key === 'values' && payload.action) {
      state.tasks.push({
        id: state.task_next_id++,
        title: payload.action.slice(0, 120),
        category: state.categories[0]?.id || CATEGORY_DEFAULTS[0].id,
        effort: .2,
        start: TODAY(),
        end: TODAY(),
        urgent: false,
        important: false,
        value_area: payload.value_area || '',
        next_step: payload.when || '',
        status: 'todo',
        progress: 0,
        created_at: NOW(),
        updated_at: NOW()
      });
    }
    saveState();
    toast('ワークを保存しました');
    setRoute('care');
  }

  function saveScale(form) {
    const key = form.dataset.scale;
    const scale = SCALES[key];
    if (!scale) return;
    const complete = scale.items.every(item => Number.isFinite(scaleAnswers[item.id]));
    if (!complete) {
      toast('未回答の項目があります');
      return;
    }
    const scores = scale.score(scaleAnswers);
    if (!scores) {
      toast('回答値を確認してください');
      return;
    }
    state.scale_sessions.push({
      id: `scale_${Date.now()}`,
      scale_name: key,
      date: TODAY(),
      created_at: NOW(),
      responses: { ...scaleAnswers },
      scores
    });
    scaleAnswers = {};
    saveState();
    toast('スコアを保存しました');
    setRoute('scales');
  }

  function saveSettings(form) {
    const data = formData(form);
    state.settings.display_name = String(data.display_name || '').slice(0, 30);
    state.settings.daily_capacity = Math.round(Math.max(.1, Number(data.daily_capacity) || 8) * 10) / 10;
    state.settings.weekly_capacity = Math.round(Math.max(.1, Number(data.weekly_capacity) || 40) * 10) / 10;
    state.settings.save_free_text = Boolean(data.save_free_text);
    saveState();
    toast('設定を保存しました');
    setRoute('settings');
  }

  function saveCategory(form) {
    const data = formData(form);
    const label = String(data.label || '').trim();
    if (!label) return;
    const id = uniqueCategoryId(label);
    state.categories.push({ id, label, color: data.color || '#227a5a' });
    saveState();
    toast('カテゴリを追加しました');
    taskSection = route.view === 'tasks' ? 'masters' : taskSection;
    setRoute(route.view === 'tasks' ? 'tasks' : 'settings');
  }

  function saveCategoryEdit(form) {
    const category = state.categories.find(item => item.id === form.dataset.id);
    if (!category) return;
    const data = formData(form);
    const label = String(data.label || '').trim();
    if (!label) {
      toast('カテゴリ名を入力してください');
      return;
    }
    category.label = label;
    if (/^#[0-9a-f]{6}$/i.test(String(data.color || ''))) category.color = data.color;
    saveState();
    toast('カテゴリを保存しました');
    taskSection = route.view === 'tasks' ? 'masters' : taskSection;
    setRoute(route.view === 'tasks' ? 'tasks' : 'settings');
  }

  function saveOwner(form) {
    const name = String(formData(form).name || '').trim();
    if (!name) return;
    if (!state.owners.includes(name)) state.owners.push(name);
    saveState();
    toast('担当を追加しました');
    taskSection = route.view === 'tasks' ? 'masters' : taskSection;
    setRoute(route.view === 'tasks' ? 'tasks' : 'settings');
  }

  function saveOwnerEdit(form) {
    const oldName = form.dataset.value;
    const nextName = String(formData(form).name || '').trim();
    if (!nextName) {
      toast('担当名を入力してください');
      return;
    }
    if (state.owners.some(name => name === nextName && name !== oldName)) {
      toast('同名の担当があります');
      return;
    }
    const idx = state.owners.indexOf(oldName);
    if (idx < 0) return;
    state.owners[idx] = nextName;
    state.tasks.forEach(task => {
      task.owners = (task.owners || []).map(name => name === oldName ? nextName : name);
    });
    saveState();
    toast('担当を保存しました');
    taskSection = route.view === 'tasks' ? 'masters' : taskSection;
    setRoute(route.view === 'tasks' ? 'tasks' : 'settings');
  }

  function saveTag(form) {
    const name = String(formData(form).name || '').trim();
    if (!name) return;
    if (!state.tags.includes(name)) state.tags.push(name);
    saveState();
    toast('項目を追加しました');
    taskSection = route.view === 'tasks' ? 'masters' : taskSection;
    setRoute(route.view === 'tasks' ? 'tasks' : 'settings');
  }

  function saveTagEdit(form) {
    const oldName = form.dataset.value;
    const nextName = String(formData(form).name || '').trim();
    if (!nextName) {
      toast('項目名を入力してください');
      return;
    }
    if (state.tags.some(name => name === nextName && name !== oldName)) {
      toast('同名の項目があります');
      return;
    }
    const idx = state.tags.indexOf(oldName);
    if (idx < 0) return;
    state.tags[idx] = nextName;
    state.tasks.forEach(task => {
      task.tags = (task.tags || []).map(name => name === oldName ? nextName : name);
    });
    saveState();
    toast('項目を保存しました');
    taskSection = route.view === 'tasks' ? 'masters' : taskSection;
    setRoute(route.view === 'tasks' ? 'tasks' : 'settings');
  }

  function saveStressLocation(form) {
    const label = String(formData(form).label || '').trim();
    if (!label) return;
    const baseId = `stress_${safeId(label, Date.now().toString(36))}`;
    let id = baseId;
    let n = 2;
    while (state.stress_locations.some(loc => loc.id === id)) id = `${baseId}_${n++}`;
    state.stress_locations.push({ id, label });
    state.stress_areas.forEach(area => {
      state.stress_latest[stressKey(id, area.id)] = { score: 3, note: '', date: TODAY() };
    });
    saveState();
    toast('ストレス場所を追加しました');
    setRoute('settings');
  }

  function exportJSON() {
    download(`act-task-compass-${TODAY()}.json`, JSON.stringify(state, null, 2), 'application/json');
  }

  function importJSON(form) {
    try {
      const imported = JSON.parse(formData(form).json || '');
      state = normalizeImportedData(imported);
      saveState();
      toast('データを読み込みました');
      setRoute('home');
    } catch (error) {
      toast('JSONを読み込めませんでした');
    }
  }

  function loadGasUrlValue() {
    try {
      const stored = localStorage.getItem(GAS_URL_KEY) || localStorage.getItem('csm_gas_url') || '';
      return normalizeGasUrl(stored) || '';
    } catch {
      return '';
    }
  }

  function normalizeGasUrl(url) {
    const raw = String(url || '').trim();
    if (!raw) return '';
    const clean = raw.split('#')[0].split('?')[0].trim();
    const valid = /^https:\/\/script\.google\.com\/macros\/s\/[^/]+\/(exec|dev)$/.test(clean);
    if (!valid) return null;
    return clean.replace(/\/dev$/, '/exec');
  }

  function saveGasUrl(form) {
    const raw = String(formData(form).gas_url || '').trim();
    const normalized = normalizeGasUrl(raw);
    if (normalized === null) {
      setGasStatus('URL が正しくありません。GAS Web App の /macros/s/.../exec URL を入力してください。', true);
      return;
    }
    gasUrl = normalized;
    try {
      if (gasUrl) localStorage.setItem(GAS_URL_KEY, gasUrl);
      else localStorage.removeItem(GAS_URL_KEY);
    } catch {}
    setSyncStatus('idle', gasUrl ? 'Sheets設定済み' : 'Sheets未設定');
    setGasStatus(gasUrl ? 'URLを保存しました。今すぐ Sheets へ保存できます。' : 'URLをクリアしました。', false);
    render();
  }

  function clearGasUrl() {
    gasUrl = '';
    try { localStorage.removeItem(GAS_URL_KEY); } catch {}
    setSyncStatus('idle', 'Sheets未設定');
    setGasStatus('Sheets連携を解除しました。', false);
    render();
  }

  function makeGasUrlWithQuery(params) {
    if (!gasUrl) return '';
    const qs = new URLSearchParams(params || {});
    return `${gasUrl}${gasUrl.includes('?') ? '&' : '?'}${qs.toString()}`;
  }

  function setSyncStatus(nextState, message) {
    syncState = nextState;
    syncMessage = message || ({ idle: gasUrl ? 'Sheets設定済み' : 'Sheets未設定', loading: '読み込み中...', syncing: '同期中...', synced: '同期済み', error: '同期失敗' }[nextState] || nextState);
    const dot = byId('syncDot');
    const text = byId('syncText');
    if (dot) dot.className = `sync-dot ${nextState}`;
    if (text) text.textContent = syncMessage;
  }

  function setGasStatus(message, isError = false) {
    gasMessage = message;
    gasMessageIsError = Boolean(isError);
    const el = byId('gasStatusMsg');
    if (el) {
      el.textContent = message;
      el.classList.toggle('danger-text', gasMessageIsError);
    }
  }

  function scheduleSheetsSync() {
    if (!gasUrl) return;
    if (syncTimer) clearTimeout(syncTimer);
    setSyncStatus('syncing', '同期待機中...');
    syncTimer = setTimeout(() => syncToSheets(true), 1500);
  }

  function buildSheetsPayload() {
    return {
      ...state,
      schema_version: state.schema_version || 1,
      synced_at: NOW()
    };
  }

  function pingGasByImage() {
    if (!gasUrl) return;
    try {
      const img = new Image();
      img.style.display = 'none';
      img.onload = img.onerror = () => setTimeout(() => img.remove(), 500);
      document.body.appendChild(img);
      img.src = makeGasUrlWithQuery({ action: 'ping', ts: Date.now() });
    } catch {}
  }

  function submitToGasByHiddenForm(payload) {
    return new Promise((resolve, reject) => {
      try {
        const frameName = 'act_compass_gas_post_frame';
        let frame = byId(frameName);
        if (!frame) {
          frame = document.createElement('iframe');
          frame.name = frameName;
          frame.id = frameName;
          frame.style.display = 'none';
          frame.setAttribute('aria-hidden', 'true');
          document.body.appendChild(frame);
        }
        const form = document.createElement('form');
        form.method = 'POST';
        form.action = gasUrl;
        form.target = frameName;
        form.style.display = 'none';
        form.acceptCharset = 'UTF-8';
        const input = document.createElement('input');
        input.type = 'hidden';
        input.name = 'payload';
        input.value = payload;
        form.appendChild(input);
        const clientTs = document.createElement('input');
        clientTs.type = 'hidden';
        clientTs.name = 'clientTs';
        clientTs.value = NOW();
        form.appendChild(clientTs);
        document.body.appendChild(form);
        form.submit();
        setTimeout(() => {
          form.remove();
          resolve(true);
        }, 1200);
      } catch (error) {
        reject(error);
      }
    });
  }

  async function syncToSheets(silent = false) {
    if (!gasUrl || isSyncing) return false;
    isSyncing = true;
    if (!silent) setSyncStatus('syncing');
    try {
      pingGasByImage();
      await submitToGasByHiddenForm(JSON.stringify(buildSheetsPayload()));
      setSyncStatus('synced', '送信完了');
      if (!silent) setGasStatus('スプレッドシートへ送信しました。', false);
      return true;
    } catch (error) {
      console.warn('Sheets sync failed:', error);
      setSyncStatus('error', '送信失敗');
      if (!silent) setGasStatus('スプレッドシートへの送信に失敗しました。URL・デプロイ設定を確認してください。', true);
      return false;
    } finally {
      isSyncing = false;
    }
  }

  function loadFromSheetsByJsonp() {
    return new Promise(resolve => {
      if (!gasUrl) {
        resolve({ data: null, reason: 'gasUrl未設定' });
        return;
      }
      const callbackName = `actCompassSheetLoad_${Date.now()}_${Math.random().toString(36).slice(2)}`;
      const script = document.createElement('script');
      let done = false;
      const cleanup = () => {
        if (done) return;
        done = true;
        try { delete window[callbackName]; } catch { window[callbackName] = undefined; }
        script.remove();
      };
      window[callbackName] = data => {
        cleanup();
        if (!data) {
          resolve({ data: null, reason: 'コールバック応答が空です' });
          return;
        }
        if (data.error || data.success === false) {
          resolve({ data: null, reason: data.error || JSON.stringify(data).slice(0, 200) });
          return;
        }
        resolve({ data, reason: '' });
      };
      script.onerror = () => {
        cleanup();
        resolve({ data: null, reason: 'JSONPスクリプトのロードに失敗しました' });
      };
      script.src = makeGasUrlWithQuery({ action: 'load', callback: callbackName, ts: Date.now() });
      document.body.appendChild(script);
      setTimeout(() => {
        if (!done) {
          cleanup();
          resolve({ data: null, reason: 'JSONPタイムアウト' });
        }
      }, 10000);
    });
  }

  async function reloadFromSheets() {
    if (!gasUrl) {
      setGasStatus('先に GAS URL を設定してください。', true);
      render();
      return;
    }
    setSyncStatus('loading');
    setGasStatus('スプレッドシートから読み込んでいます...', false);
    const result = await loadFromSheetsByJsonp();
    if (!result.data) {
      setSyncStatus('error', '読み込み失敗');
      setGasStatus(`読み込みに失敗しました。URL・デプロイ設定を確認してください。${result.reason ? ` 理由: ${result.reason}` : ''}`, true);
      render();
      return;
    }
    try {
      state = normalizeImportedData(result.data);
      saveState({ skipSync: true });
      taskInlineEditor = null;
      selectedStressCell = null;
      setSyncStatus('synced', '読み込み完了');
      setGasStatus('スプレッドシートからデータを読み込みました。', false);
      setRoute('home');
    } catch (error) {
      setSyncStatus('error', '読み込み失敗');
      setGasStatus('読み込んだJSONを統合版データとして解釈できませんでした。', true);
      render();
    }
  }

  async function forceSyncToSheets() {
    if (!gasUrl) {
      setGasStatus('先に GAS URL を設定してください。', true);
      render();
      return;
    }
    await syncToSheets(false);
    render();
  }

  async function loadFromSheetsOnStartup() {
    if (!gasUrl) return;
    setSyncStatus('loading');
    const result = await loadFromSheetsByJsonp();
    if (!result.data) {
      setSyncStatus('idle', 'Sheets設定済み');
      return;
    }
    try {
      state = normalizeImportedData(result.data);
      saveState({ skipSync: true });
      setSyncStatus('synced', '同期済み');
      render();
    } catch {
      setSyncStatus('error', '読み込み失敗');
      render();
    }
  }

  function normalizeImportedData(imported) {
    if (!imported || typeof imported !== 'object') throw new Error('invalid json');
    if (imported.schema_version && (Array.isArray(imported.checkins) || Array.isArray(imported.stress_locations))) {
      return normalizeState(imported);
    }
    if (Array.isArray(imported.daily_logs) || Array.isArray(imported.scale_sessions) || Array.isArray(imported.work_sessions)) {
      return convertActToolState(imported);
    }
    if (Array.isArray(imported.tasks) || imported.smxData || imported.masters) {
      return convertTaskToolState(imported);
    }
    throw new Error('unsupported json');
  }

  function convertActToolState(data) {
    const next = defaultState();
    next.settings.onboarding_completed = true;
    next.settings.consent_at = NOW();
    next.settings.display_name = data.settings?.display_name || '';
    next.settings.save_free_text = data.settings?.save_free_text !== false;
    next.checkins = (Array.isArray(data.daily_logs) ? data.daily_logs : []).map((log, idx) => ({
      id: log.id || `act_check_${idx + 1}`,
      date: log.date || TODAY(),
      created_at: log.created_at || NOW(),
      updated_at: log.updated_at || log.created_at || NOW(),
      mood: log.mood_score ?? null,
      body: log.physical_score ?? null,
      anxiety: log.anxiety_score ?? null,
      fusion: log.fusion_score ?? null,
      avoidance: log.avoidance_score ?? null,
      value_area: Array.isArray(log.selected_values) ? (log.selected_values[0] || '') : '',
      committed_action: log.committed_action || '',
      thought: log.main_thought || ''
    }));
    next.work_sessions = (Array.isArray(data.work_sessions) ? data.work_sessions : []).map((work, idx) => ({
      id: work.id || `act_work_${idx + 1}`,
      work_key: work.work_type || work.work_key || 'imported',
      work_type: 'ACT',
      date: work.date || TODAY(),
      created_at: work.created_at || NOW(),
      inputs: work.inputs || {},
      summary: work.next_action || work.insight || ''
    }));
    next.scale_sessions = (Array.isArray(data.scale_sessions) ? data.scale_sessions : []).map((scale, idx) => ({
      id: scale.id || `act_scale_${idx + 1}`,
      scale_name: scale.scale_name,
      date: scale.date || TODAY(),
      created_at: scale.created_at || NOW(),
      responses: scale.responses || {},
      scores: scale.scores || {}
    })).filter(x => x.scale_name);
    return normalizeState(next);
  }

  function convertTaskToolState(data) {
    const next = defaultState();
    next.settings.onboarding_completed = true;
    next.settings.consent_at = NOW();
    if (data.settings?.daily !== undefined) next.settings.daily_capacity = Number(data.settings.daily) || 8;
    if (data.settings?.weekly !== undefined) next.settings.weekly_capacity = Number(data.settings.weekly) || 40;

    const masters = data.masters || data.catalogs || data.settings?.catalogs || {};
    const categorySet = normalizeCategorySet(masters.categories || CATEGORY_DEFAULTS);
    next.categories = categorySet.categories;
    next.owners = normalizeStringList(masters.owners, OWNER_DEFAULTS);
    next.tags = normalizeStringList(masters.tags, TAG_DEFAULTS);
    const categoryMap = categorySet.aliases;
    next.tasks = (Array.isArray(data.tasks) ? data.tasks : []).map((task, idx) => normalizeTask({
      ...task,
      category: categoryMap.get(String(task.category)) || task.category,
      urgent: task.urgent ?? task.urgency,
      important: task.important ?? task.importance,
      status: task.status === 'inprogress' ? 'doing' : task.status,
      start: task.start || task.startDate || task.start_date,
      end: task.end || task.endDate || task.end_date || task.deadline
    }, idx, next.categories, next.owners)).filter(Boolean);
    next.task_next_id = Math.max(1, ...next.tasks.map(t => Number(t.id) || 0)) + 1;

    const stress = convertTaskToolStress(data.smxData, data.slog);
    next.stress_locations = stress.locations;
    next.stress_areas = stress.areas;
    next.stress_latest = stress.latest;
    next.stress_logs = stress.logs;
    return normalizeState(next);
  }

  function convertTaskToolStress(smxData, slog) {
    const locationMap = new Map(STRESS_LOCATION_DEFAULTS.map(loc => [loc.label, loc]));
    locationMap.set('移動中', { id: 'outing', label: '外出時' });
    const areaMap = new Map(STRESS_AREA_DEFAULTS.map(area => [area.label, area]));
    const locations = STRESS_LOCATION_DEFAULTS.map(loc => ({ ...loc }));
    const areas = STRESS_AREA_DEFAULTS.map(area => ({ ...area }));
    const ensureLocation = label => {
      const loc = ensureImportedStressLocation(locationMap, label);
      if (!locations.some(item => item.id === loc.id)) locations.push(loc);
      return loc;
    };
    const ensureArea = label => {
      const area = ensureImportedStressArea(areaMap, label);
      if (!areas.some(item => item.id === area.id)) areas.push(area);
      return area;
    };
    const latest = defaultStressLatest(locations, areas);
    Object.entries(smxData || {}).forEach(([key, value]) => {
      const [locLabel, areaLabel = 'その他'] = splitImportedStressKey(key);
      const loc = ensureLocation(locLabel);
      const area = ensureArea(areaLabel);
      const score = clamp(value?.score || 3, 1, 5);
      latest[stressKey(loc.id, area.id)] = {
        score,
        note: String(value?.note || '').slice(0, 500),
        date: value?.date || value?.ts || TODAY()
      };
    });
    const logs = (Array.isArray(slog) ? slog : []).map((entry, idx) => {
      const loc = ensureLocation(entry.loc || 'その他');
      const area = ensureArea(entry.area || 'その他');
      const score = clamp(entry.score || 3, 1, 5);
      const key = stressKey(loc.id, area.id);
      const note = String(entry.note || '').slice(0, 500);
      return {
        id: entry.id ? `task_stress_${entry.id}` : `task_stress_${idx + 1}`,
        date: TODAY(),
        created_at: NOW(),
        scores: { [key]: score },
        notes: { [key]: note },
        average: score,
        note: note ? `${loc.label} × ${area.label}: ${note}` : `${loc.label} × ${area.label}`
      };
    });
    return { locations, areas, latest, logs };
  }

  function splitImportedStressKey(key) {
    const parts = String(key || '').split('_');
    if (parts.length >= 2) return [parts[0], parts.slice(1).join('_')];
    return [String(key || 'その他'), 'その他'];
  }

  function ensureImportedStressLocation(locationMap, label) {
    const normalizedLabel = label === '移動中' ? '外出時' : String(label || 'その他');
    if (locationMap.has(normalizedLabel)) return locationMap.get(normalizedLabel);
    const loc = { id: `stress_${safeId(normalizedLabel, Date.now().toString(36))}`, label: normalizedLabel };
    locationMap.set(normalizedLabel, loc);
    return loc;
  }

  function ensureImportedStressArea(areaMap, label) {
    const alias = { 気分: 'メンタル', 集中: '脳・集中' };
    const normalizedLabel = alias[label] || String(label || 'その他');
    if (areaMap.has(normalizedLabel)) return areaMap.get(normalizedLabel);
    const area = { id: `area_${safeId(normalizedLabel, Date.now().toString(36))}`, label: normalizedLabel };
    areaMap.set(normalizedLabel, area);
    return area;
  }

  function download(filename, content, type) {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  function handleClick(event) {
    const consent = byId('consentCheck');
    if (consent) {
      const start = document.querySelector('[data-action="finish-onboarding"]');
      if (start) start.disabled = !consent.checked;
    }

    const target = event.target.closest('[data-nav],[data-view],[data-action]');
    if (!target) return;

    if (target.dataset.view) {
      setRoute(target.dataset.view);
      return;
    }

    if (target.dataset.nav) {
      setRoute(target.dataset.nav);
      return;
    }

    const action = target.dataset.action;
    if (action === 'finish-onboarding') {
      if (!byId('consentCheck')?.checked) return;
      state.settings.onboarding_completed = true;
      state.settings.consent_at = NOW();
      saveState();
      setRoute('home');
    }
    if (action === 'set-scale-field') setScaleField(target);
    if (action === 'task-filter') {
      taskFilter = target.dataset.filter || 'all';
      render();
    }
    if (action === 'task-section') {
      taskSection = target.dataset.section || 'manage';
      taskInlineEditor = null;
      render();
    }
    if (action === 'open-task-settings') {
      taskSection = 'masters';
      taskInlineEditor = null;
      setRoute('tasks');
    }
    if (action === 'task-panel') {
      const id = Number(target.dataset.id);
      const panel = target.dataset.panel || 'full';
      taskInlineEditor = taskInlineEditor?.id === id && taskInlineEditor?.panel === panel ? null : { id, panel };
      render();
    }
    if (action === 'move-task') moveTask(Number(target.dataset.id), Number(target.dataset.dir));
    if (action === 'wbs-mode') {
      wbsMode = target.dataset.mode || 'list';
      render();
    }
    if (action === 'delete-task') {
      const id = Number(target.dataset.id);
      state.tasks = state.tasks.filter(t => t.id !== id);
      if (taskInlineEditor?.id === id) taskInlineEditor = null;
      saveState();
      render();
    }
    if (action === 'care-mode') {
      careMode = target.dataset.mode || 'stress';
      render();
    }
    if (action === 'stress-select') selectStressCell(target.dataset.loc, target.dataset.area);
    if (action === 'stress-score') setSelectedStressScore(target);
    if (action === 'stress-save') saveSelectedStressCell();
    if (action === 'open-work') setRoute('work', { key: target.dataset.work });
    if (action === 'open-scale') {
      scaleAnswers = {};
      setRoute('scale', { key: target.dataset.scale });
    }
    if (action === 'scale-answer') {
      scaleAnswers[target.dataset.item] = Number(target.dataset.value);
      render();
    }
    if (action === 'export-json') exportJSON();
    if (action === 'clear-gas-url') clearGasUrl();
    if (action === 'reload-sheets') reloadFromSheets();
    if (action === 'force-sync-sheets') forceSyncToSheets();
    if (action === 'focus-color') byId(target.dataset.target)?.click();
    if (action === 'move-category') moveCategory(target.dataset.id, Number(target.dataset.dir));
    if (action === 'move-owner') moveOwner(target.dataset.value, Number(target.dataset.dir));
    if (action === 'move-tag') moveTag(target.dataset.value, Number(target.dataset.dir));
    if (action === 'reset-task-masters') resetTaskMasters();
    if (action === 'delete-category') deleteCategory(target.dataset.id);
    if (action === 'delete-owner') deleteOwner(target.dataset.value);
    if (action === 'delete-tag') deleteTag(target.dataset.value);
    if (action === 'delete-stress-location') deleteStressLocation(target.dataset.id);
    if (action === 'delete-all') deleteAll();
  }

  function handleChange(event) {
    const el = event.target;
    if (!(el instanceof HTMLElement)) return;
    if (el.dataset.action === 'task-status') {
      const task = state.tasks.find(t => t.id === Number(el.dataset.id));
      if (task) {
        task.status = el.value;
        if (el.value === 'done') task.progress = 100;
        task.updated_at = NOW();
        saveState();
        render();
      }
    }
    if (el.dataset.action === 'task-progress') {
      const task = state.tasks.find(t => t.id === Number(el.dataset.id));
      if (task) {
        task.progress = clamp(el.value, 0, 100);
        if (task.progress >= 100) task.status = 'done';
        task.updated_at = NOW();
        saveState();
        render();
      }
    }
  }

  function setScaleField(btn) {
    const group = btn.closest('[data-scale-group]');
    if (!group) return;
    const field = btn.dataset.field;
    const input = group.querySelector('input[type="hidden"]');
    if (input) input.value = btn.dataset.value;
    group.querySelectorAll('.scale-btn').forEach(b => b.setAttribute('aria-pressed', b === btn ? 'true' : 'false'));
  }

  function moveTask(id, dir) {
    const idx = state.tasks.findIndex(task => task.id === id);
    const nextIdx = idx + dir;
    if (idx < 0 || nextIdx < 0 || nextIdx >= state.tasks.length) return;
    const [task] = state.tasks.splice(idx, 1);
    state.tasks.splice(nextIdx, 0, task);
    saveState();
    render();
  }

  function moveCategory(id, dir) {
    const idx = state.categories.findIndex(category => category.id === id);
    const nextIdx = idx + dir;
    if (idx < 0 || nextIdx < 0 || nextIdx >= state.categories.length) return;
    const [item] = state.categories.splice(idx, 1);
    state.categories.splice(nextIdx, 0, item);
    saveState();
    taskSection = 'masters';
    setRoute('tasks');
  }

  function moveOwner(name, dir) {
    const idx = state.owners.indexOf(name);
    const nextIdx = idx + dir;
    if (idx < 0 || nextIdx < 0 || nextIdx >= state.owners.length) return;
    const [item] = state.owners.splice(idx, 1);
    state.owners.splice(nextIdx, 0, item);
    saveState();
    taskSection = 'masters';
    setRoute('tasks');
  }

  function moveTag(name, dir) {
    const idx = state.tags.indexOf(name);
    const nextIdx = idx + dir;
    if (idx < 0 || nextIdx < 0 || nextIdx >= state.tags.length) return;
    const [item] = state.tags.splice(idx, 1);
    state.tags.splice(nextIdx, 0, item);
    saveState();
    taskSection = 'masters';
    setRoute('tasks');
  }

  function resetTaskMasters() {
    if (!confirm('カテゴリ・担当・項目を初期状態に戻します。タスクや記録は削除されません。よろしいですか？')) return;
    state.categories = CATEGORY_DEFAULTS.map(item => ({ ...item }));
    state.owners = OWNER_DEFAULTS.slice();
    state.tags = TAG_DEFAULTS.slice();
    state.tasks.forEach(task => {
      if (!state.categories.some(category => category.id === task.category)) task.category = state.categories[0].id;
      task.owners = (task.owners || []).filter(name => state.owners.includes(name));
      if (!task.owners.length) task.owners = [state.owners[0] || '自分'];
      task.tags = (task.tags || []).filter(name => state.tags.includes(name));
    });
    saveState();
    toast('マスタを初期化しました');
    taskSection = 'masters';
    setRoute('tasks');
  }

  function deleteCategory(id) {
    if (state.categories.length <= 1) {
      toast('カテゴリは1つ以上必要です');
      return;
    }
    const inUse = state.tasks.some(t => t.category === id);
    if (inUse && !confirm('このカテゴリを使っているタスクがあります。カテゴリだけ削除しますか？')) return;
    state.categories = state.categories.filter(c => c.id !== id);
    state.tasks.forEach(t => {
      if (t.category === id) t.category = state.categories[0].id;
    });
    saveState();
    taskSection = route.view === 'tasks' ? 'masters' : taskSection;
    setRoute(route.view === 'tasks' ? 'tasks' : 'settings');
  }

  function deleteOwner(name) {
    if (state.owners.length <= 1) {
      toast('担当は1つ以上必要です');
      return;
    }
    state.owners = state.owners.filter(owner => owner !== name);
    state.tasks.forEach(task => {
      task.owners = (task.owners || []).filter(owner => owner !== name);
      if (!task.owners.length) task.owners = [state.owners[0] || '自分'];
    });
    saveState();
    taskSection = route.view === 'tasks' ? 'masters' : taskSection;
    setRoute(route.view === 'tasks' ? 'tasks' : 'settings');
  }

  function deleteTag(name) {
    state.tags = state.tags.filter(tag => tag !== name);
    state.tasks.forEach(task => {
      task.tags = (task.tags || []).filter(tag => tag !== name);
    });
    saveState();
    taskSection = route.view === 'tasks' ? 'masters' : taskSection;
    setRoute(route.view === 'tasks' ? 'tasks' : 'settings');
  }

  function deleteStressLocation(id) {
    if (state.stress_locations.length <= 1) {
      toast('ストレス場所は1つ以上必要です');
      return;
    }
    state.stress_locations = state.stress_locations.filter(loc => loc.id !== id);
    Object.keys(state.stress_latest).forEach(key => {
      if (key === id || key.startsWith(`${id}__`)) delete state.stress_latest[key];
    });
    if (selectedStressCell?.locId === id) selectedStressCell = null;
    saveState();
    setRoute('settings');
  }

  function deleteAll() {
    if (!confirm('端末内の全データを削除します。よろしいですか？')) return;
    if (!confirm('元に戻せません。本当に削除しますか？')) return;
    localStorage.removeItem(STORAGE_KEY);
    state = defaultState();
    state.settings.onboarding_completed = true;
    state.settings.consent_at = NOW();
    saveState();
    setRoute('home');
  }

  document.addEventListener('click', handleClick);
  document.addEventListener('change', handleChange);
  document.addEventListener('submit', handleSubmit);
  document.addEventListener('DOMContentLoaded', () => {
    render();
    loadFromSheetsOnStartup();
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('sw.js').catch(() => {});
    }
  });

  window.ACTTaskCompassAPI = {
    defaultState,
    stats,
    recommendation,
    remainingEffort,
    taskIsToday,
    taskIsThisWeek,
    WORKS,
    STRESS_LOCATION_DEFAULTS,
    STRESS_AREA_DEFAULTS,
    stressKey,
    normalizeImportedData
  };
})();
