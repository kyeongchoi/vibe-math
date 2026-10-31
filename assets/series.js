/* ============================================================
   바이브 수학 — 시리즈 설정
   ------------------------------------------------------------
   중학교 1·2·3학년 × 상·하 = 6권의 목록입니다.
   새 권을 공개할 때는 이 파일의 해당 항목만 고치면
   시리즈 허브(index.html)와 각 권 페이지(g?-?/index.html)에 함께 반영됩니다.

   필드 설명
   - id        : 폴더 이름. g{학년}-{1=상, 2=하}  (예: g1-2 = 1학년 하)
   - status    : 'live'(공개) | 'planned'(준비 중)
   - parts     : 편(대단원) 이름. 준비 중인 권은 예정 구성이므로 자유롭게 고치세요.
   - apps      : 앱 활동 수            ← 공개된 권만
   - published : 공개일 'YYYY-MM-DD'   ← 공개된 권만
   - fan       : 허브와 권 페이지 상단에 펼쳐 보여 줄 앱 3개 (그림 번호 + 이름) ← 공개된 권만
   ============================================================ */

window.VM_SITE = {
  series: '바이브 수학',
  tagline: '만지고 움직이며 배우는 중학교 수학',
  author: '최경식(목원대학교 교수)',
  email: 'kyeong@mokwon.ac.kr',
};

/* ---------- 전자칠판·교실용 데스크톱 앱 (허브의 "앱 내려받기" 구역) ----------
   파일은 GitHub 저장소의 Releases 에 올립니다 (저장소 파일 100 MB 제한 때문에 사이트 폴더에는 넣지 않음).
   - base : 릴리스 파일 주소의 앞부분. 'OWNER/REPO' 를 실제 GitHub 아이디/저장소 이름으로 바꾸세요.
            (예: https://github.com/kyeong-math/vibemath/releases/download/v1.2.0/)
   - files: 릴리스에 올린 파일 이름 그대로. 새 판을 올리면 version · base · file · size 를 함께 고칩니다.
   base 에 'OWNER/REPO' 가 남아 있으면 단추가 "준비 중"으로 표시됩니다. */
window.VM_DESKTOP = {
  version: '1.2.0', date: '2026-11-01',
  base: 'https://github.com/kyeongchoi/vibe-math/releases/download/v1.2.0/',
  guide: 'desktop/guide.html',
  files: [
    { os: 'windows', name: 'Windows 설치형', file: 'VibeMath-1.2.0-Windows-Setup.exe', size: '125 MB', recommended: true,
      note: '바탕화면과 시작 메뉴에 바로가기가 생깁니다. 관리자 권한 없이 설치됩니다.', req: 'Windows 10 / 11 (64비트)' },
    { os: 'windows', name: 'Windows 무설치형', file: 'VibeMath-1.2.0-Windows-Portable.exe', size: '112 MB',
      note: 'USB 메모리에 넣어 두고 더블클릭하면 바로 실행됩니다.', req: 'Windows 10 / 11 (64비트)' },
    { os: 'mac', name: 'macOS', file: 'VibeMath-1.2.0-macOS.dmg', size: '243 MB',
      note: '열린 창에서 앱을 Applications 폴더로 끌어다 놓습니다. Apple Silicon · Intel 공용.', req: 'macOS 13 Ventura 이상' },
  ],
};

window.VM_VOLUMES = [
  {
    id: 'g1-1', grade: 1, vol: '상', status: 'live',
    parts: ['수와 연산', '문자와 식', '좌표평면과 그래프'],
    apps: 192, published: '2026-10-22',
    fan: [
      { id: '1.6', name: '에라토스테네스의 체' },
      { id: '2.12', name: '절댓값 대결 — 남는 쪽의 부호' },
      { id: '5.12', name: '좌표 버블 팡!' },
    ],
  },
  {
    id: 'g1-2', grade: 1, vol: '하', status: 'planned',
    parts: ['기본 도형', '평면도형과 입체도형', '자료의 정리와 해석'],
  },
  {
    id: 'g2-1', grade: 2, vol: '상', status: 'planned',
    parts: ['수와 식의 계산', '부등식과 연립방정식', '일차함수'],
  },
  {
    id: 'g2-2', grade: 2, vol: '하', status: 'planned',
    parts: ['도형의 성질', '도형의 닮음과 피타고라스 정리', '확률'],
  },
  {
    id: 'g3-1', grade: 3, vol: '상', status: 'planned',
    parts: ['실수와 그 연산', '다항식과 이차방정식', '이차함수'],
  },
  {
    id: 'g3-2', grade: 3, vol: '하', status: 'planned',
    parts: ['삼각비', '원의 성질', '통계'],
  },
];

/* 공통 보조 함수 (허브·권 페이지에서 함께 사용) */
window.VM_UTIL = {
  label: (v) => `중학교 ${v.grade}학년 ${v.vol}`,          // 중학교 1학년 상
  short: (v) => `중${v.grade} ${v.vol}`,                   // 중1 상
  date: (s) => {                                            // 2026-10-22 → 2026년 10월 22일
    if (!s) return '';
    const [y, m, d] = s.split('-').map(Number);
    return `${y}년 ${m}월 ${d}일`;
  },
};
