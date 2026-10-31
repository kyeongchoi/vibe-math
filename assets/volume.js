/* ============================================================
   바이브 수학 — 권 페이지 공통 스크립트
   ------------------------------------------------------------
   각 권의 index.html 은
     <html data-volume="g1-1">            ← 어느 권인지
     <script id="vm-data" type="application/json">[ … ]</script>   ← 앱 활동 데이터
   만 가지고 있고, 나머지(통계·단원 지도·갤러리·권 전환)는 여기서 그립니다.

   편(Ⅰ, Ⅱ, Ⅲ …)은 데이터의 part 값("Ⅰ. 수와 연산")에서 자동으로 뽑으므로
   편이 3개든 4개든 따로 설정할 것이 없습니다.
   ============================================================ */
(() => {
  const SITE = window.VM_SITE || {};
  const VOLS = window.VM_VOLUMES || [];
  const U = window.VM_UTIL || {};
  const V = VOLS.find((v) => v.id === document.documentElement.dataset.volume) || null;
  const A = JSON.parse(document.getElementById('vm-data').textContent);

  // ---------- 편 목록: 데이터에서 자동 추출 ----------
  // "Ⅰ. 수와 연산" → key 'Ⅰ', name '수와 연산', 색은 --p1 … --p4 순환
  const PARTS = [...new Set(A.map((a) => a.part))].map((full, i) => {
    const m = full.match(/^(.+?)\.\s*(.+)$/);
    return { full, key: m ? m[1].trim() : full, name: m ? m[2].trim() : full, color: `var(--p${(i % 4) + 1})` };
  });
  const partOf = (a) => PARTS.find((p) => p.full === a.part);
  // ---------- 활동 유형: 고정된 순서(책의 분류)로 보이되, 데이터에 다른 유형이 있으면 뒤에 덧붙임 ----------
  const TYPE_ORDER = ['조작 · 시각 실험', '개념 판별 · 퀴즈', '수리소 (오류 진단)', '게임 · 챌린지'];
  const TYPES = [...TYPE_ORDER.filter((t) => A.some((a) => a.type === t)), ...new Set(A.filter((a) => !TYPE_ORDER.includes(a.type)).map((a) => a.type))];
  const typeKey = (a) => `t${TYPES.indexOf(a.type) + 1}`;   // 카드·태그 색(--t1 … --t4)
  const img = (a) => 'img/' + a.id.replace('.', '-') + '.jpg';
  const el = (tag, props = {}, ...kids) => {
    const n = Object.assign(document.createElement(tag), props);
    kids.forEach((k) => k != null && n.append(k));
    return n;
  };
  const fill = (key, text) => document.querySelectorAll(`[data-v="${key}"]`).forEach((n) => { n.textContent = text; });

  // ---------- 권 정보로 제목·저자·푸터 채우기 ----------
  if (V) {
    const label = U.label(V);
    document.title = `${SITE.series} ${label}`;
    fill('short', U.short(V).replace(' ', ' · '));
    fill('eyebrow', `중학교 ${V.grade}학년 · ${V.vol}권`);
    fill('grade', `만지고 움직이며 배우는 중학교 ${V.grade}학년 수학`);
    fill('foot-title', `${SITE.series} · ${label}`);
    fill('foot-author', V.published ? `저자: ${SITE.author} · ${U.date(V.published)}` : `저자: ${SITE.author}`);
  }
  if (SITE.email) {
    document.querySelectorAll('[data-v="email"]').forEach((a) => { a.textContent = SITE.email; a.href = `mailto:${SITE.email}`; });
  }

  // ---------- 권 전환 (상단 선택 상자 + 하단 이전/다음) ----------
  const sw = document.getElementById('volSwitch');
  if (sw && VOLS.length) {
    VOLS.forEach((v) => {
      const o = new Option(U.short(v) + (v.status === 'live' ? '' : ' (준비 중)'), v.id);
      o.disabled = v.status !== 'live';
      o.selected = V ? v.id === V.id : false;
      sw.append(o);
    });
    sw.addEventListener('change', () => { if (sw.value) location.href = `../${sw.value}/index.html`; });
  }
  const vn = document.getElementById('volNav');
  if (vn && V) {
    const i = VOLS.indexOf(V);
    const link = (v, pre) => {
      if (!v) return el('span');
      const text = `${pre} ${U.label(v)}`;
      return v.status === 'live'
        ? el('a', { href: `../${v.id}/index.html`, textContent: text })
        : el('span', { className: 'off', textContent: `${text} (준비 중)` });
    };
    vn.append(
      el('div', { className: 'wrap' },
        link(VOLS[i - 1], '← 이전 권:'),
        el('a', { className: 'home', href: '../index.html', textContent: '시리즈 전체 보기' }),
        link(VOLS[i + 1], '다음 권: '),
      ),
    );
  }

  // ---------- 머리 숫자 ----------
  const chapters = [...new Set(A.map((a) => a.chapter))];
  const sections = [...new Set(A.map((a) => a.section))];
  const nums = { total: A.length, chapters: chapters.length, sections: sections.length, star: A.filter((a) => a.featured).length };
  document.querySelectorAll('[data-n]').forEach((n) => { n.textContent = nums[n.dataset.n]; });

  // ---------- 상단 펼침 화면 3장 (series.js 의 fan, 없으면 추천 활동 앞 3개) ----------
  const fan = document.getElementById('fan');
  if (fan) {
    const ids = (V && V.fan && V.fan.length) ? V.fan.map((f) => f.id) : A.filter((a) => a.featured).slice(0, 3).map((a) => a.id);
    ids.forEach((id) => {
      const a = A.find((x) => x.id === id);
      if (!a) return;
      fan.append(el('figure', {}, el('img', { src: img(a), alt: '' }), el('figcaption', { textContent: a.name })));
    });
  }

  // ---------- 최근에 연 활동: 이 브라우저의 localStorage 에 권별로 최대 RECENT_MAX 개 기억 ----------
  // 저장 형식: vm:recent:g1-1 → [{"id":"1.6","name":"에라토스테네스의 체","t":1700000000000}, …]  (최근 것이 앞)
  const RECENT_MAX = 8;
  const VID = (V && V.id) || document.documentElement.dataset.volume || 'volume';
  const KEY = `vm:recent:${VID}`;
  const store = {
    load() {
      try {
        let list = JSON.parse(localStorage.getItem(KEY)) || [];
        // 예전 형식(vm:last:…, 하나만 기억)이 남아 있으면 목록 앞에 합치고 지운다
        const old = JSON.parse(localStorage.getItem(`vm:last:${VID}`));
        if (old && old.id) { list = [old, ...list.filter((x) => x.id !== old.id)]; localStorage.removeItem(`vm:last:${VID}`); localStorage.setItem(KEY, JSON.stringify(list)); }
        return list.filter((x) => x && A.some((a) => a.id === x.id)).slice(0, RECENT_MAX);
      } catch { return []; }
    },
    save(list) { try { if (list.length) localStorage.setItem(KEY, JSON.stringify(list)); else localStorage.removeItem(KEY); } catch { /* 비공개 창 등 */ } },
  };
  let recent = store.load();
  const touch = (a) => { recent = [{ id: a.id, name: a.name, t: Date.now() }, ...recent.filter((x) => x.id !== a.id)].slice(0, RECENT_MAX); store.save(recent); };
  const forget = (id) => { recent = recent.filter((x) => x.id !== id); store.save(recent); };
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const center = (node, smooth = true) => node && node.scrollIntoView({ block: 'center', behavior: smooth && !reduceMotion ? 'smooth' : 'instant' });
  const ago = (t) => {
    const m = Math.floor((Date.now() - t) / 60000);
    if (m < 1) return '방금 전';
    if (m < 60) return `${m}분 전`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}시간 전`;
    const d = Math.floor(h / 24);
    if (d < 30) return `${d}일 전`;
    const x = new Date(t);
    return `${x.getFullYear()}년 ${x.getMonth() + 1}월 ${x.getDate()}일`;
  };

  // ---------- 상태 ----------
  const state = { q: '', part: '', chap: '', section: '', star: false, type: '' };
  const q = document.getElementById('q');
  const chap = document.getElementById('chap');
  const typeSel = document.getElementById('typeSel');
  const starOnly = document.getElementById('starOnly');
  const clear = document.getElementById('clear');
  const count = document.getElementById('count');
  const gallery = document.getElementById('gallery');
  const partSeg = document.getElementById('partSeg');

  // ---------- 단원 지도 ----------
  const partsEl = document.getElementById('parts');
  PARTS.forEach((p) => {
    const acts = A.filter((a) => partOf(a) === p);
    const col = el('div', { className: 'part' });
    col.style.setProperty('--pc', p.color);
    col.append(el('div', { className: 'eyebrow', textContent: `제${p.key}편 · ${acts.length}개 활동` }), el('h3', { textContent: p.name }));
    [...new Set(acts.map((a) => a.chapter))].forEach((c) => {
      const ca = acts.filter((a) => a.chapter === c);
      const box = el('div', { className: 'chap' }, el('h4', {}, c, el('span', { textContent: ca.length })));
      [...new Set(ca.map((a) => a.section))].forEach((s) => {
        const n = ca.filter((a) => a.section === s).length;
        const b = el('button', { type: 'button', className: 'sec' }, el('span', { className: 't', textContent: s }), el('span', { className: 'n', textContent: n }));
        b.addEventListener('click', () => {
          Object.assign(state, { q: '', part: '', chap: '', section: s, star: false, type: '' });
          syncControls();
          render();
          document.getElementById('activities').scrollIntoView({ behavior: 'smooth' });
        });
        box.append(b);
      });
      col.append(box);
    });
    partsEl.append(col);
  });
  // 편 수에 따라 단원 지도 열 수를 맞춤 (3편이면 3열, 4편이면 4열 …)
  if (PARTS.length) partsEl.style.setProperty('--cols', PARTS.length);
  fill('parts-summary', `${PARTS.length}개 편, ${chapters.length}개 장의 구성`);

  // ---------- 필터 조작 ----------
  const segBtns = [{ key: '', name: '전체' }, ...PARTS].map((p) => {
    const b = el('button', { type: 'button', textContent: p.key ? `${p.key}. ${p.name}` : p.name });
    b.addEventListener('click', () => { state.part = p.key; state.chap = ''; state.section = ''; syncControls(); render(); });
    partSeg.append(b);
    return [p.key, b];
  });
  function syncControls() {
    q.value = state.q;
    starOnly.checked = state.star;
    segBtns.forEach(([k, b]) => b.setAttribute('aria-pressed', String(k === state.part)));
    const list = chapters.filter((c) => !state.part || partOf(A.find((a) => a.chapter === c)).key === state.part);
    chap.replaceChildren(new Option('모든 장', ''), ...list.map((c) => new Option(c, c)));
    chap.value = state.chap;
    if (typeSel) {
      const n = (t) => A.filter((a) => a.type === t).length;
      typeSel.replaceChildren(new Option('모든 활동 유형', ''), ...TYPES.map((t) => new Option(`${t} (${n(t)})`, t)));
      typeSel.value = state.type;
    }
  }
  q.addEventListener('input', () => { state.q = q.value; render(); });
  chap.addEventListener('change', () => { state.chap = chap.value; state.section = ''; render(); });
  starOnly.addEventListener('change', () => { state.star = starOnly.checked; render(); });
  if (typeSel) typeSel.addEventListener('change', () => { state.type = typeSel.value; render(); });
  clear.addEventListener('click', () => { Object.assign(state, { q: '', part: '', chap: '', section: '', star: false, type: '' }); syncControls(); render(); });

  // ---------- 활동 카드 ----------
  function card(a) {
    const p = partOf(a);
    const inner = [
      el('div', { className: 'shot' }, el('img', { src: img(a), alt: `${a.name} 앱 화면`, loading: 'lazy', width: 360, height: 511 })),
      el('div', { className: 'body' },
        el('div', { className: 'meta' }, `그림 ${a.id}`, el('span', { textContent: `· ${a.book_page}쪽` }), a.featured ? el('span', { className: 'star', textContent: '★ 추천' }) : null),
        el('h4', { textContent: a.name }),
        el('p', { textContent: a.description }),
        el('div', { className: 'foot' }, el('span', { className: 'tag' }, el('i'), a.type), a.app_url ? el('span', { className: 'open', textContent: '앱 열기 ↗' }) : null)),
    ];
    const c = a.app_url
      ? el('a', { className: 'card', href: a.app_url, target: '_blank', rel: 'noopener' }, ...inner)
      : el('div', { className: 'card' }, ...inner);
    c.style.setProperty('--pc', p.color);
    c.dataset.id = a.id;
    c.dataset.type = typeKey(a);
    markCard(c);
    // 누르면: 앱은 새 탭에서 열리고, 이 탭에서는 그 카드를 '마지막으로 연 활동'으로 표시해 화면 가운데로 가져온다
    c.addEventListener('click', () => {
      touch(a);
      markCards();
      renderRecent();
      center(c);
    });
    return c;
  }
  // 갤러리 카드 표시: 가장 최근 것은 .last(테두리 + 리본), 나머지 기억된 것은 .recent(작은 표)
  function markCard(c) {
    const i = recent.findIndex((x) => x.id === c.dataset.id);
    c.classList.toggle('last', i === 0);
    c.classList.toggle('recent', i > 0);
  }
  function markCards() { gallery.querySelectorAll('.card').forEach(markCard); }

  // ---------- '최근에 연 활동' 가로 카드 줄 (갤러리 위) ----------
  const recentBox = document.getElementById('recent');
  const cardOf = (id) => gallery.querySelector(`.card[data-id="${CSS.escape(id)}"]`);
  // 갤러리에서 해당 카드를 화면 가운데로 (필터에 가려져 있으면 필터를 풀고 다시 그린다)
  function goTo(id, smooth = true) {
    let c = cardOf(id);
    if (!c) {
      Object.assign(state, { q: '', part: '', chap: '', section: '', star: false, type: '' });
      syncControls();
      render();
      c = cardOf(id);
    }
    if (!c) return;
    center(c, smooth);
    c.classList.remove('focus'); void c.offsetWidth; c.classList.add('focus');  // 한 번 깜빡여 눈에 띄게
    c.addEventListener('animationend', () => c.classList.remove('focus'), { once: true });
  }
  function miniCard(r) {
    const a = A.find((x) => x.id === r.id);
    const m = el('div', { className: 'mini', role: 'button', tabIndex: 0, title: '갤러리에서 이 활동 보기' },
      el('div', { className: 'mshot' }, el('img', { src: img(a), alt: '', loading: 'lazy', width: 360, height: 511 })),
      el('div', { className: 'mbody' },
        el('div', { className: 'meta' }, el('span', { textContent: `그림 ${a.id}` }), el('span', { className: 't', textContent: ago(r.t) })),
        el('h4', { textContent: a.name }),
        el('div', { className: 'mfoot' },
          a.app_url ? el('a', { className: 'open', href: a.app_url, target: '_blank', rel: 'noopener', textContent: '앱 열기 ↗' }) : el('span'),
          el('button', { type: 'button', className: 'x', textContent: '×', title: '목록에서 지우기', ariaLabel: `${a.name} 목록에서 지우기` }))));
    m.style.setProperty('--pc', partOf(a).color);
    m.addEventListener('click', (e) => {
      if (e.target.closest('a.open')) { setTimeout(() => { touch(a); markCards(); renderRecent(); }, 0); return; } // 새 탭이 열린 뒤 맨 앞으로
      if (e.target.closest('button.x')) { forget(a.id); markCards(); renderRecent(); return; }
      goTo(a.id);
    });
    m.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); goTo(a.id); } });
    return m;
  }
  function renderRecent() {
    if (!recentBox) return;
    if (!recent.length) { recentBox.hidden = true; recentBox.replaceChildren(); return; }
    recentBox.replaceChildren(
      el('div', { className: 'recent-h' },
        el('span', { className: 'ic', textContent: '↩' }),
        el('b', { textContent: '최근에 연 활동' }),
        el('span', { className: 'n', textContent: `${recent.length}개 · 이 브라우저가 최대 ${RECENT_MAX}개까지 기억합니다` }),
        el('span', { className: 'sp' }),
        el('button', { type: 'button', className: 'forget', textContent: '모두 지우기', onclick: () => { recent = []; store.save(recent); markCards(); renderRecent(); } })),
      el('div', { className: 'recent-row', role: 'list' }, ...recent.map(miniCard)),
    );
    recentBox.hidden = false;
  }

  // ---------- 갤러리 ----------
  function render() {
    const term = state.q.trim().toLowerCase();
    const rows = A.filter((a) =>
      (!state.part || partOf(a).key === state.part) &&
      (!state.chap || a.chapter === state.chap) &&
      (!state.section || a.section === state.section) &&
      (!state.star || a.featured) &&
      (!state.type || a.type === state.type) &&
      (!term || (a.name + ' ' + a.description + ' ' + a.section).toLowerCase().includes(term)));
    const filtered = state.q || state.part || state.chap || state.section || state.star || state.type;
    clear.hidden = !filtered;
    clear.textContent = state.section ? `소단원: ${state.section} ×` : '필터 지우기';
    count.textContent = `${rows.length} / ${A.length}개`;
    if (!rows.length) {
      gallery.replaceChildren(el('p', { className: 'empty', textContent: A.length ? '조건에 맞는 활동이 없습니다. 검색어나 필터를 바꿔 보세요.' : '이 권의 활동은 아직 준비 중입니다.' }));
      return;
    }
    const groups = [];
    rows.forEach((a) => {
      const g = groups[groups.length - 1];
      if (g && g.section === a.section) g.items.push(a); else groups.push({ section: a.section, chapter: a.chapter, part: partOf(a), items: [a] });
    });
    gallery.replaceChildren(...groups.map((g) => {
      const box = el('div', { className: 'group' },
        el('div', { className: 'group-h' }, el('span', { className: 'eyebrow', textContent: g.chapter }), el('h3', { textContent: g.section }), el('span', { className: 'n', textContent: `${g.items.length}개` })),
        el('div', { className: 'cards' }, ...g.items.map(card)));
      box.style.setProperty('--pc', g.part.color);
      return box;
    }));
  }

  syncControls();
  render();
  renderRecent();
  const target = document.getElementById(location.hash.slice(1));
  // 새로 들어온 방문('navigate')에서만 '최근에 연 활동' 줄을 화면 가운데로 가져온다.
  // 새로고침·뒤로가기('reload', 'back_forward')는 브라우저가 보던 위치를 되돌려 주므로 그대로 둔다.
  const navType = ((performance.getEntriesByType && performance.getEntriesByType('navigation')[0]) || {}).type || 'navigate';
  if (target) {
    target.scrollIntoView();
  } else if (recent.length && recentBox && navType === 'navigate') {
    // 웹 폰트가 늦게 와서 높이가 조금 바뀌면 한 번 더 맞추되, 그 사이 사용자가 움직였으면 건드리지 않는다.
    center(recentBox, false);
    let touched = false;
    ['wheel', 'touchstart', 'keydown'].forEach((ev) => addEventListener(ev, () => { touched = true; }, { once: true, passive: true }));
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => { if (!touched) center(recentBox, false); });
  }
})();
