const fs = require('fs');
const path = require('path');
const { marked } = require('marked');
const BASE = path.resolve(__dirname);
marked.setOptions({ gfm: true, breaks: false });

function parseFile(filepath) {
  const md = fs.readFileSync(filepath, 'utf-8');
  const sections = md.split(/(?=^# )/gm);
  const result = [];
  for (const section of sections) {
    if (!section.trim()) continue;
    const titleMatch = section.match(/^# (.+)/m);
    if (!titleMatch) continue;
    const contentLength = section.replace(/^# .+/m, '').trim().length;
    result.push({ title: titleMatch[1].trim(), md: section, contentLength });
  }
  return result;
}

function buildChapters(rawList, prefix, merge) {
  const chapters = [];
  let id = 0;
  for (let i = 0; i < rawList.length; i++) {
    const rc = rawList[i];
    if (merge && rc.contentLength < 150 && i + 1 < rawList.length) {
      rawList[i + 1].md = rc.md + '\n\n' + rawList[i + 1].md;
      continue;
    }
    const h2s = [];
    const h2Re = /^## (.+)/gm;
    let m;
    while ((m = h2Re.exec(rc.md)) !== null) h2s.push({ title: m[1].trim(), anchor: prefix + '-h2-' + id + '-' + h2s.length });
    let html = marked.parse(rc.md);
    let h2i = 0;
    html = html.replace(/<h2>/g, () => '<h2 id="' + prefix + '-h2-' + id + '-' + h2i++ + '">');
    chapters.push({ id: prefix + '-' + id++, title: rc.title, html, h2s });
  }
  return chapters;
}

const overviewRaw = parseFile(`${BASE}/overview.md`);
const designBasicsRaw = [
  ...parseFile(`${BASE}/part1-디자인기초-상.md`),
  ...parseFile(`${BASE}/part2-디자인기초-하.md`),
];
const overviewChapters = buildChapters(overviewRaw, 'ov', false);
const designChapters = buildChapters(designBasicsRaw, 'db', true);
const toolsChapters = buildChapters(parseFile(`${BASE}/tools.md`), 'tl', false);
const refsChapters = buildChapters(parseFile(`${BASE}/references.md`), 'rf', false);
const practicalChapters = buildChapters(parseFile(`${BASE}/practical.md`), 'pr', false);

const weeklyData = [
  { week: 1, title: 'OT & 디자인 기초', content: `
## 1주차 — OT & 디자인 기초

### 강의 목표
1. CRAP 원칙(대비, 반복, 정렬, 근접)을 이해하고 실제 디자인에서 찾아낼 수 있습니다.
2. 색상 조합과 폰트 선택의 기본 기준을 학습합니다.
3. 이미지 다루기 기초(누끼, 해상도)를 실습합니다.

### 시간 배분

| 시간 | 내용 |
|------|------|
| 0:00~0:10 | 아이스브레이킹 — 가장 못 만든 디자인 공유 |
| 0:10~0:30 | Ch.0: 왜 디자인인가? (Before/After 퀴즈) |
| 0:30~0:50 | Ch.1~2: CRAP 원칙 + 위계/구도 |
| 0:50~1:10 | Ch.3~4: 색상 + 타이포그래피 (폰트 조합 실습) |
| 1:10~1:20 | Ch.5: 이미지 다루기 (누끼 따기 데모) |
| 1:20~1:30 | Q&A + 다음 시간 예고 |

### 과제
- 눈누(noonnu.cc)에서 무료 폰트 7종 다운받아 설치하기
- CRAP 원칙으로 인스타그램 포스터 1개 분석해보기

### 참고 자료
- 가이드: SPEC 디자인 개요 > 디자인 기초
- YouTube: "17년차 디자인 업계인이 풀어주는 암묵적 룰"
` },
];
for (let w = 2; w <= 16; w++) {
  weeklyData.push({ week: w, title: '준비 중', content: `## ${w}주차 — 준비 중\n\n> 해당 주차의 챌린지는 준비 중입니다.\n` });
}
const weeklyChapters = weeklyData.map(w => {
  const wid = 'wk-' + w.week;
  let html = marked.parse(w.content);
  const h2s = [];
  const h2Re = /^## (.+)/gm;
  let m2;
  while ((m2 = h2Re.exec(w.content)) !== null) h2s.push({ title: m2[1].trim(), anchor: 'wk-h2-' + w.week + '-' + h2s.length });
  let idx = 0;
  html = html.replace(/<h2>/g, () => '<h2 id="wk-h2-' + w.week + '-' + idx++ + '">');
  return { id: wid, title: w.week + '주차: ' + w.title, html, h2s, week: w.week };
});

const allChapters = [...overviewChapters, ...designChapters, ...toolsChapters, ...refsChapters, ...practicalChapters, ...weeklyChapters];

const short = t => t.replace(/^Chapter \d+[\.:]\s*/, '').replace(/^Part \d+[\.:]\s*/, '').replace(/^비전공자를 위한 /, '').replace(/^디자인 기초 Part 2 — /, '').substring(0, 30);

function sidebarSection(label, chapters, defaultOpen) {
  let s = `<div class="nav-section${defaultOpen ? ' open' : ''}">\n`;
  s += `  <button class="nav-section-toggle" onclick="toggleSection(this)"><span>${label}</span><svg class="chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 9l6 6 6-6"/></svg></button>\n`;
  s += '  <div class="nav-section-items">\n';
  chapters.forEach(ch => {
    s += `    <button class="nav-item" data-target="${ch.id}" onclick="go('${ch.id}',this)">${short(ch.title)}</button>\n`;
  });
  s += '  </div>\n</div>\n';
  return s;
}

let sidebar = '<div class="nav-divider">가이드</div>\n';
sidebar += sidebarSection('1. SPEC 디자인 개요', overviewChapters, true);
sidebar += sidebarSection('디자인 기초', designChapters, false);
sidebar += sidebarSection('2. 툴 소개', toolsChapters, false);
sidebar += sidebarSection('3. 레퍼런스 사이트 모음', refsChapters, false);
sidebar += sidebarSection('4. 활용 가이드', practicalChapters, false);
sidebar += '\n<div class="nav-divider">주차별 챌린지</div>\n';
let ws = '<div class="nav-section open">\n';
ws += '  <button class="nav-section-toggle" onclick="toggleSection(this)"><span>챌린지</span><svg class="chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 9l6 6 6-6"/></svg></button>\n';
ws += '  <div class="nav-section-items">\n';
weeklyChapters.forEach(w => {
  const dim = w.week > 1 ? ' dim' : '';
  ws += `    <button class="nav-item${dim}" data-target="${w.id}" onclick="go('${w.id}',this)">${w.week}주차 — ${weeklyData.find(d => d.week === w.week).title}</button>\n`;
});
ws += '  </div>\n</div>\n';
sidebar += ws;

const contentHtml = allChapters.map((c, i) =>
  `<article id="${c.id}" class="chapter${i === 0 ? ' active' : ''}">${c.html}</article>`
).join('\n');

const htmlTemplate = fs.readFileSync(`${BASE}/site/index.html`, 'utf-8');

const html = `<!DOCTYPE html>
<html lang="ko" data-theme="dark">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>SPEC Design Guide</title>
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css">
<style>
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
[data-theme="dark"]{--bg:#202020;--bg-sidebar:#1a1a1a;--bg-card:#2a2a2a;--bg-hover:rgba(255,108,15,0.08);--bg-code:#161616;--text:#c8c8c8;--text-bright:#FCFCF8;--text-dim:#8a8a8a;--text-dimmer:#666;--primary:#FF6C0F;--primary-variant:#FF9900;--secondary:#4C4780;--secondary-light:rgba(76,71,128,0.15);--border:rgba(255,255,255,0.08);--border-strong:rgba(255,255,255,0.15);--quote-bg:rgba(255,108,15,0.06);--table-head:#333;--table-stripe:rgba(255,255,255,0.02);--shadow:rgba(0,0,0,0.3)}
[data-theme="light"]{--bg:#FCFCF8;--bg-sidebar:#f5f4f0;--bg-card:#fff;--bg-hover:rgba(255,108,15,0.06);--bg-code:#f5f4f0;--text:#3a3a3a;--text-bright:#202020;--text-dim:#777;--text-dimmer:#999;--primary:#FF6C0F;--primary-variant:#FF9900;--secondary:#4C4780;--secondary-light:rgba(76,71,128,0.08);--border:rgba(0,0,0,0.08);--border-strong:rgba(0,0,0,0.12);--quote-bg:rgba(255,108,15,0.05);--table-head:#FF6C0F;--table-stripe:rgba(0,0,0,0.02);--shadow:rgba(0,0,0,0.08)}
:root{--sidebar-w:260px;--toc-w:200px;--header-h:56px}
html{scroll-behavior:smooth}
body{font-family:'Pretendard',-apple-system,sans-serif;background:var(--bg);color:var(--text);font-size:16px;line-height:160%;letter-spacing:-0.02em;-webkit-font-smoothing:antialiased;transition:background .3s,color .3s}
.hdr{position:fixed;top:0;left:0;right:0;height:var(--header-h);background:var(--bg-sidebar);border-bottom:1px solid var(--border);display:flex;align-items:center;padding:0 20px;z-index:100;backdrop-filter:blur(12px)}
.hdr-left{display:flex;align-items:center;gap:12px}
.hdr-menu{display:none;background:none;border:none;cursor:pointer;width:36px;height:36px;border-radius:8px;color:var(--text-bright)}
.hdr-menu:hover{background:var(--bg-hover)}
.hdr-menu svg{width:20px;height:20px}
.logo{display:flex;align-items:center;gap:10px;text-decoration:none}
.logo-mark{display:flex;align-items:center}
.logo-mark img{height:28px;width:auto;filter:brightness(0) saturate(100%) invert(42%) sepia(93%) saturate(1700%) hue-rotate(360deg) brightness(101%) contrast(105%)}
.logo-sub{font-size:12px;color:var(--text-dim);font-weight:500;letter-spacing:-0.01em}
.logo-divider{width:1px;height:24px;background:var(--border-strong);margin:0 4px}
.hdr-right{margin-left:auto;display:flex;align-items:center;gap:8px}
.theme-btn{background:none;border:1px solid var(--border-strong);border-radius:8px;width:36px;height:36px;cursor:pointer;display:flex;align-items:center;justify-content:center;color:var(--text-dim);transition:all .2s}
.theme-btn:hover{background:var(--bg-hover);color:var(--primary);border-color:var(--primary)}
.side{position:fixed;top:var(--header-h);left:0;bottom:0;width:var(--sidebar-w);background:var(--bg-sidebar);border-right:1px solid var(--border);overflow-y:auto;padding:16px 10px;z-index:90;transition:transform .25s ease}
.side::-webkit-scrollbar{width:3px}
.side::-webkit-scrollbar-thumb{background:var(--border-strong);border-radius:3px}
.nav-divider{font-size:10px;font-weight:800;color:var(--primary);text-transform:uppercase;letter-spacing:0.1em;padding:20px 12px 8px;border-top:1px solid var(--border);margin-top:8px}
.nav-divider:first-child{border-top:none;margin-top:0}
.nav-section{margin-bottom:4px}
.nav-section-toggle{display:flex;align-items:center;width:100%;background:none;border:none;padding:8px 12px;font-family:inherit;font-size:13px;font-weight:700;color:var(--text-dim);cursor:pointer;border-radius:8px;transition:all .15s;gap:8px}
.nav-section-toggle:hover{background:var(--bg-hover);color:var(--text-bright)}
.chevron{width:16px;height:16px;margin-left:auto;transition:transform .2s;flex-shrink:0}
.nav-section.open .chevron{transform:rotate(180deg)}
.nav-section-items{max-height:0;overflow:hidden;transition:max-height .3s ease;padding-left:4px}
.nav-section.open .nav-section-items{max-height:2000px}
.nav-item{display:block;width:100%;text-align:left;background:none;border:none;padding:6px 12px 6px 20px;font-size:13px;font-family:inherit;color:var(--text-dim);border-radius:8px;cursor:pointer;transition:all .15s;line-height:1.5;margin-bottom:1px;border-left:2px solid transparent}
.nav-item:hover{background:var(--bg-hover);color:var(--text-bright)}
.nav-item.active{color:var(--primary);font-weight:600;border-left-color:var(--primary);background:var(--bg-hover)}
.nav-item.dim{opacity:0.45}
.toc{position:fixed;top:var(--header-h);right:0;bottom:0;width:var(--toc-w);padding:24px 16px;overflow-y:auto;font-size:12px}
.toc-title{font-size:11px;font-weight:700;color:var(--text-dim);text-transform:uppercase;letter-spacing:0.06em;margin-bottom:12px}
.toc a{display:block;padding:4px 0;color:var(--text-dimmer);text-decoration:none;border-left:2px solid transparent;padding-left:10px;transition:all .15s;line-height:1.5}
.toc a:hover,.toc a.active{color:var(--primary);border-left-color:var(--primary)}
.main{margin-left:var(--sidebar-w);margin-right:var(--toc-w);margin-top:var(--header-h);min-height:calc(100vh - var(--header-h))}
.chapter{display:none;max-width:700px;margin:0 auto;padding:48px 32px 100px;animation:fadeIn .2s ease}
.chapter.active{display:block}
@keyframes fadeIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}
.chapter h1{font-size:34px;font-weight:800;color:var(--text-bright);margin:0 0 32px;line-height:130%;letter-spacing:-0.02em}
.chapter h2{font-size:24px;font-weight:700;color:var(--text-bright);margin:48px 0 20px;padding-bottom:12px;border-bottom:1px solid var(--border);line-height:140%}
.chapter h3{font-size:18px;font-weight:700;color:var(--primary);margin:36px 0 12px;line-height:140%}
.chapter h4{font-size:16px;font-weight:700;color:var(--text-bright);margin:24px 0 8px}
.chapter p{font-size:18px;line-height:160%;letter-spacing:-0.02em;color:var(--text);margin:0 0 18px}
.chapter a{color:var(--primary);text-decoration:none;border-bottom:1px solid transparent;transition:border .15s}
.chapter a:hover{border-bottom-color:var(--primary)}
.chapter strong{font-weight:700;color:var(--text-bright)}
.chapter em{font-style:italic;color:var(--text-dim)}
.chapter ul,.chapter ol{margin:0 0 18px;padding-left:24px;font-size:18px;line-height:160%}
.chapter li{margin-bottom:8px;color:var(--text)}
.chapter li>ul,.chapter li>ol{margin-top:8px;margin-bottom:0}
.chapter blockquote{border-left:3px solid var(--primary);background:var(--quote-bg);margin:24px 0;padding:18px 22px;border-radius:0 12px 12px 0;font-size:16px}
.chapter blockquote p{font-size:16px;margin-bottom:8px}
.chapter blockquote p:last-child{margin-bottom:0}
.chapter table{width:100%;border-collapse:collapse;margin:24px 0;font-size:14px;border-radius:10px;overflow:hidden;border:1px solid var(--border)}
.chapter thead th{background:var(--table-head);color:var(--text-bright);font-weight:600;padding:12px 14px;text-align:left;font-size:13px}
[data-theme="light"] .chapter thead th{color:#fff}
.chapter tbody td{padding:11px 14px;border-bottom:1px solid var(--border);vertical-align:top;color:var(--text)}
.chapter tbody tr:nth-child(even){background:var(--table-stripe)}
.chapter tbody tr:hover{background:var(--bg-hover)}
.chapter code{font-family:'SF Mono','Fira Code',monospace;background:var(--bg-code);padding:2px 7px;border-radius:5px;font-size:14px;color:var(--primary-variant)}
.chapter pre{background:var(--bg-code);color:var(--text);padding:22px;border-radius:12px;overflow-x:auto;margin:24px 0;font-size:14px;line-height:1.6;border:1px solid var(--border)}
.chapter pre code{background:none;padding:0;color:inherit;font-size:inherit}
.chapter hr{border:none;height:1px;background:var(--border);margin:40px 0}
.ch-nav{display:flex;gap:16px;margin-top:60px;padding-top:24px;border-top:1px solid var(--border)}
.ch-nav button{flex:1;background:var(--primary);border:none;border-radius:10px;padding:14px 24px;color:#fff;font-family:inherit;font-size:15px;font-weight:600;cursor:pointer;transition:all .2s}
.ch-nav button:hover{background:var(--primary-variant);transform:translateY(-1px);box-shadow:0 4px 12px rgba(255,108,15,0.3)}
.overlay{display:none;position:fixed;inset:0;background:rgba(0,0,0,0.5);z-index:80}
.overlay.show{display:block}
@media(max-width:1100px){.toc{display:none}.main{margin-right:0}}
@media(max-width:768px){.hdr-menu{display:flex;align-items:center;justify-content:center}.side{transform:translateX(-100%);width:280px;box-shadow:4px 0 24px var(--shadow)}.side.open{transform:translateX(0)}.main{margin-left:0}.chapter{padding:32px 20px 80px}.chapter h1{font-size:26px}.chapter h2{font-size:20px}.chapter p,.chapter li{font-size:16px}.logo-sub,.logo-divider{display:none}}
</style>
</head>
<body>
<header class="hdr">
  <div class="hdr-left">
    <button class="hdr-menu" onclick="toggleMenu()"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 12h18M3 6h18M3 18h18"/></svg></button>
    <a class="logo" href="#"><span class="logo-mark"><img src="logo.png" alt="SPEC"></span><span class="logo-divider"></span><span class="logo-sub">Design Guide</span></a>
  </div>
  <div class="hdr-right">
    <button class="theme-btn" onclick="toggleTheme()" title="테마 전환"><svg id="themeIcon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg></button>
  </div>
</header>
<div class="overlay" onclick="toggleMenu()"></div>
<nav class="side">
${sidebar}
</nav>
<aside class="toc" id="toc"><div class="toc-title">On this page</div></aside>
<main class="main">
${contentHtml}
</main>
<script>
const chapters=${JSON.stringify(allChapters.map(c=>({id:c.id,title:c.title,h2s:c.h2s})))};
let currentIdx=0;
function go(id,btn){document.querySelectorAll('.chapter').forEach(el=>el.classList.remove('active'));document.querySelectorAll('.nav-item').forEach(el=>el.classList.remove('active'));const el=document.getElementById(id);if(el)el.classList.add('active');if(btn)btn.classList.add('active');else{const b=document.querySelector('.nav-item[data-target="'+id+'"]');if(b)b.classList.add('active')}currentIdx=chapters.findIndex(c=>c.id===id);updateToc();addNavButtons();window.scrollTo({top:0,behavior:'smooth'});if(window.innerWidth<=768){document.querySelector('.side').classList.remove('open');document.querySelector('.overlay').classList.remove('show')}}
function updateToc(){const toc=document.getElementById('toc');const ch=chapters[currentIdx];if(!ch||!ch.h2s||ch.h2s.length===0){toc.innerHTML='';return}let h='<div class="toc-title">On this page</div>';ch.h2s.forEach(x=>{h+='<a href="#'+x.anchor+'" onclick="event.preventDefault();smoothTo(\\''+x.anchor+'\\')">'+x.title.substring(0,35)+'</a>'});toc.innerHTML=h}
function smoothTo(a){const el=document.getElementById(a);if(el)el.scrollIntoView({behavior:'smooth',block:'start'})}
function addNavButtons(){document.querySelectorAll('.ch-nav').forEach(e=>e.remove());const ch=chapters[currentIdx];const article=document.getElementById(ch.id);if(!article)return;const prev=currentIdx>0?chapters[currentIdx-1]:null;const next=currentIdx<chapters.length-1?chapters[currentIdx+1]:null;const nav=document.createElement('div');nav.className='ch-nav';const pb=prev?'<button onclick="goIdx('+(currentIdx-1)+')">이전</button>':'<div></div>';const nb=next?'<button onclick="goIdx('+(currentIdx+1)+')">다음</button>':'<div></div>';nav.innerHTML=pb+nb;article.appendChild(nav)}
function goIdx(i){const ch=chapters[i];if(!ch)return;go(ch.id)}
function toggleMenu(){document.querySelector('.side').classList.toggle('open');document.querySelector('.overlay').classList.toggle('show')}
function toggleSection(btn){btn.closest('.nav-section').classList.toggle('open')}
function toggleTheme(){const html=document.documentElement;const isDark=html.getAttribute('data-theme')==='dark';html.setAttribute('data-theme',isDark?'light':'dark');document.getElementById('themeIcon').innerHTML=isDark?'<circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>':'<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>';localStorage.setItem('theme',isDark?'light':'dark')}
(function(){const saved=localStorage.getItem('theme');if(saved)document.documentElement.setAttribute('data-theme',saved)})();
updateToc();addNavButtons();
window.addEventListener('scroll',()=>{const links=document.querySelectorAll('.toc a');if(!links.length)return;const ch=chapters[currentIdx];if(!ch||!ch.h2s)return;let active=null;ch.h2s.forEach(h=>{const el=document.getElementById(h.anchor);if(el&&el.getBoundingClientRect().top<120)active=h.anchor});links.forEach(l=>l.classList.toggle('active',l.getAttribute('href')==='#'+active))});
</script>
</body>
</html>`;

const outPath = `${BASE}/site/index.html`;
fs.writeFileSync(outPath, html, 'utf-8');
const s = fs.statSync(outPath);
console.log('Done:', (s.size/1024).toFixed(1)+'KB', allChapters.length, 'total');
console.log('  Overview:', overviewChapters.length);
console.log('  Design Basics:', designChapters.length);
console.log('  Tools:', toolsChapters.length);
console.log('  References:', refsChapters.length);
console.log('  Practical:', practicalChapters.length);
console.log('  Weekly:', weeklyChapters.length);
