import React, { useState, useMemo, useEffect, useRef } from "react";

/*
  충북혁신도시 순환버스 (빨간 노선) 안내
  - 순환1번(1000번) / 순환2번(2000번)
  - 이미지의 빨간 시간표를 그대로 데이터화
  - 각 행 = 한 대의 버스 회차, 열 = 정류장 도착/출발 시각
*/

// ── 정류장 순서 ─────────────────────────────
const STOPS = {
  "1000": [
    "충북혁신터미널", "소방병원", "새마을금고", "천년나무7단지", "천년나무4단지",
    "센텀", "서전고", "선옥", "교육과정평가원", "우미린", "우미린정문",
    "영무예다음2차", "대하육교", "체육공원", "맹동혁신출장소", "천년나무1단지",
    "쌍용예가2단지", "아이파크", "영무예다음3차", "충북혁신터미널(도착)"
  ],
  "2000": [
    "충북혁신터미널", "새마을금고", "아이파크", "쌍용예가2단지", "천년나무1단지",
    "맹동혁신출장소", "체육공원", "대하육교", "영무예다음2차", "우미린정문",
    "우미린", "교육과정평가원", "선옥", "서전고", "센텀", "천년나무4단지",
    "리슈빌", "영무예다음3차", "소방병원", "충북혁신터미널(도착)"
  ],
  // ── 셔클 자율주행셔틀 ──
  "SHUCLE_A1": [ // 시계방향 (음성→진천 방면)
    "한국소비자원", "한국석유관리원", "수소안전뮤지엄", "맹동혁신도시출장소",
    "국민체육센터", "대하육교", "동일하이빌", "성하빌딩사거리", "영무예다음1차",
    "덕산혁신도시출장소", "한국건설시험환경시험연구원", "정보통신산업진흥원"
  ],
  "SHUCLE_A2": [ // 반시계방향 (진천→음성 방면)
    "정보통신산업진흥원", "한국건설시험환경연구원", "덕산혁신도시출장소", "아모리움내안애",
    "우미린스테이", "동일하이빌", "대하육교", "국민체육센터", "맹동혁신도시출장소",
    "수소안전뮤지엄", "한국석유관리원", "한국소비자원"
  ],
};

// ── 시간표: 각 배열 = 한 회차, 정류장 순서대로 시각(문자열) ──
// 순환1번 (1000번) — 초록(이른 아침 첫차) + 빨강 시간표 통합
const SCHEDULE_1000 = [
  ["7:05","7:06","7:07","7:08","7:09","7:10","7:12","7:16","7:18","7:20","7:22","7:23","7:24","7:25","7:26","7:27","7:28","7:29","7:30","7:30"],
  ["7:30","7:32","7:38","7:44","7:46","7:48","7:50","7:54","7:56","7:58","8:00","8:03","8:05","8:07","8:09","8:11","8:12","8:13","8:14","8:14"],
  ["8:20","8:24","8:26","8:30","8:32","8:34","8:36","8:40","8:42","8:44","8:45","8:46","8:47","8:49","8:51","8:53","8:54","8:57","9:01","9:04"],
  ["9:30","9:34","9:36","9:40","9:42","9:44","9:46","9:50","9:52","9:54","9:55","9:56","9:57","9:59","10:01","10:03","10:04","10:07","10:11","10:14"],
  ["10:40","10:44","10:46","10:50","10:52","10:54","10:56","11:00","11:02","11:04","11:05","11:06","11:07","11:09","11:11","11:13","11:14","11:17","11:21","11:24"],
  ["11:50","11:54","11:56","12:00","12:02","12:04","12:06","12:10","12:12","12:14","12:15","12:16","12:17","12:19","12:21","12:23","12:24","12:27","12:31","12:34"],
  ["14:40","14:44","14:46","14:50","14:52","14:54","14:56","15:00","15:02","15:04","15:05","15:06","15:07","15:09","15:11","15:13","15:14","15:17","15:21","15:24"],
  ["15:30","15:34","15:36","15:40","15:42","15:44","15:46","15:50","15:52","15:54","15:55","15:56","15:57","15:59","16:01","16:03","16:04","16:07","16:11","16:14"],
  ["18:30","18:34","18:36","18:40","18:42","18:44","18:46","18:50","18:52","18:54","18:55","18:56","18:57","18:59","19:01","19:03","19:04","19:07","19:11","19:14"],
  ["19:30","19:34","19:36","19:40","19:42","19:44","19:46","19:50","19:52","19:54","19:55","19:56","19:57","19:59","20:01","20:03","20:04","20:07","20:11","20:14"],
];

// 순환2번 (2000번) 빨간 시간표
const SCHEDULE_2000 = [
  ["8:10","8:12","8:16","8:19","8:21","8:23","8:27","8:29","8:31","8:33","8:34","8:36","8:39","8:42","8:44","8:45","8:47","8:50","8:55","8:59"],
  ["9:20","9:22","9:26","9:29","9:31","9:33","9:37","9:39","9:41","9:43","9:44","9:46","9:49","9:52","9:54","9:55","9:57","10:00","10:05","10:09"],
  ["10:30","10:32","10:36","10:39","10:41","10:43","10:47","10:49","10:51","10:53","10:54","10:56","10:59","11:02","11:04","11:05","11:07","11:10","11:15","11:19"],
  ["14:30","14:32","14:36","14:39","14:41","14:43","14:47","14:49","14:51","14:53","14:54","14:56","14:59","15:02","15:04","15:05","15:07","15:10","15:15","15:19"],
  ["15:30","15:32","15:36","15:39","15:41","15:43","15:47","15:49","15:51","15:53","15:54","15:56","15:59","16:02","16:04","16:05","16:07","16:10","16:15","16:19"],
  ["16:40","16:42","16:46","16:49","16:51","16:53","16:57","16:59","17:01","17:03","17:04","17:06","17:09","17:12","17:14","17:15","17:17","17:20","17:23","17:27"],
  ["19:20","19:22","19:26","19:29","19:31","19:33","19:37","19:39","19:41","19:43","19:44","19:46","19:49","19:52","19:54","19:55","19:57","20:00","20:03","20:03"],
];

// 셔클 A1 (시계방향, 음성→진천 방면) — 12개 정류장 × 8회차
const SCHEDULE_SHUCLE_A1 = [
  ["9:30","9:32","9:36","9:38","9:41","9:43","9:46","9:47","9:48","9:50","9:54","9:55"],
  ["10:25","10:27","10:31","10:33","10:36","10:38","10:41","10:42","10:43","10:45","10:49","10:50"],
  ["11:20","11:22","11:26","11:28","11:31","11:33","11:36","11:37","11:38","11:40","11:44","11:45"],
  ["13:00","13:02","13:06","13:08","13:11","13:13","13:16","13:17","13:18","13:20","13:24","13:25"],
  ["13:55","13:57","14:01","14:03","14:06","14:08","14:11","14:12","14:13","14:15","14:19","14:20"],
  ["14:50","14:52","14:56","14:58","15:01","15:03","15:06","15:07","15:08","15:10","15:14","15:15"],
  ["15:45","15:47","15:51","15:53","15:56","15:58","16:01","16:02","16:03","16:05","16:09","16:10"],
  ["16:40","16:42","16:46","16:48","16:51","16:53","16:56","16:57","16:58","17:00","17:04","17:05"],
];

// 셔클 A2 (반시계방향, 진천→음성 방면) — 12개 정류장 × 8회차
const SCHEDULE_SHUCLE_A2 = [
  ["9:30","9:32","9:35","9:37","9:41","9:43","9:45","9:47","9:49","9:52","9:55","9:58"],
  ["10:25","10:27","10:30","10:32","10:36","10:38","10:40","10:42","10:44","10:47","10:50","10:53"],
  ["11:20","11:22","11:25","11:27","11:31","11:33","11:35","11:37","11:39","11:42","11:45","11:48"],
  ["13:00","13:02","13:05","13:07","13:11","13:13","13:15","13:17","13:19","13:22","13:25","13:28"],
  ["13:55","13:57","14:00","14:02","14:06","14:08","14:10","14:12","14:14","14:17","14:20","14:23"],
  ["14:50","14:52","14:55","14:57","15:01","15:03","15:05","15:07","15:09","15:12","15:15","15:18"],
  ["15:45","15:47","15:50","15:52","15:56","15:58","16:00","16:02","16:04","16:07","16:10","16:13"],
  ["16:40","16:42","16:45","16:47","16:51","16:53","16:55","16:57","16:59","17:02","17:05","17:08"],
];

const SCHEDULES = {
  "1000": SCHEDULE_1000,
  "2000": SCHEDULE_2000,
  "SHUCLE_A1": SCHEDULE_SHUCLE_A1,
  "SHUCLE_A2": SCHEDULE_SHUCLE_A2,
};
const LINE_META = {
  "1000": { label: "순환1번", num: "1000", color: "#E2483D" },
  "2000": { label: "순환2번", num: "2000", color: "#2F7D4F" },
  "SHUCLE_A1": { label: "모두타유 시계방향", num: "모두타유", color: "#12B5A5" },
  "SHUCLE_A2": { label: "모두타유 반시계", num: "모두타유", color: "#0E8C9E" },
};

// ── 버스 그룹(탭) 정의 ──
const GROUPS = {
  red: { label: "빨간버스", lines: ["1000", "2000"], color: "#E23B32", soft: "#FDECEA" },
  shucle: { label: "모두타유", lines: ["SHUCLE_A1", "SHUCLE_A2"], color: "#12B5A5", soft: "#E6F7F5" },
  intercity: { label: "시외버스", type: "dest", color: "#2E6BE6", soft: "#EAF1FE" },
  local: { label: "시내버스", type: "dest", hidden: true, color: "#F0932B", soft: "#FDF1E3" }, // 운행 확정 시 hidden 제거
};

// ── 시외버스: 충북혁신도시터미널 출발 ──
// 각 편: { t: 시각, via: 경유표기(없으면 직통), days: 운행요일(생략 시 매일) }
// days 코드: 0=일 1=월 2=화 3=수 4=목 5=금 6=토
const INTERCITY = {
  "서울남부(서초)": [
    { t: "6:20" }, { t: "7:00" }, { t: "7:40" }, { t: "8:20", via: "대소" },
    { t: "9:00", via: "대소" }, { t: "9:10", via: "대소", days: [5,6,0] }, { t: "9:30" },
    { t: "9:40", via: "대소", days: [6] }, { t: "10:00", via: "대소" },
    { t: "10:20", via: "대소", days: [6] }, { t: "10:30" }, { t: "10:50", via: "대소", days: [6] },
    { t: "11:00", via: "대소" }, { t: "11:20", via: "대소", days: [6] }, { t: "12:00", via: "대소" },
    { t: "12:30" }, { t: "13:00", via: "대소" }, { t: "14:00", via: "대소" }, { t: "14:30" },
    { t: "15:00", via: "대소" }, { t: "15:40", via: "대소", days: [5,6,0] }, { t: "16:00", via: "대소·죽전" },
    { t: "16:20", via: "대소", days: [6] }, { t: "16:30" }, { t: "17:00", via: "대소" },
    { t: "17:30" }, { t: "17:50", via: "대소", days: [6] }, { t: "18:00", via: "대소·죽전" },
    { t: "18:30" }, { t: "19:00", via: "대소" }, { t: "20:00" }, { t: "21:00" },
  ],
  "동서울 (덕산·대소)": [
    { t: "7:35" }, { t: "10:05" }, { t: "12:35" }, { t: "16:05" }, { t: "18:35" },
  ],
  "수원·안산 (대소경유)": [
    { t: "7:55", via: "대소·로데오" }, { t: "14:55", via: "대소·공포" },
  ],
  "김포·인천공항": [
    { t: "8:20" }, { t: "13:30" }, { t: "19:00" },
  ],
  "대전복합 (진천경유)": [
    { t: "7:10" }, { t: "9:00" }, { t: "11:00" }, { t: "13:00" }, { t: "15:00" }, { t: "17:00" }, { t: "19:00" },
  ],
  "유성": [
    { t: "6:40" }, { t: "9:30" }, { t: "12:50" }, { t: "13:50" }, { t: "16:00" }, { t: "17:50" }, { t: "18:50" }, { t: "21:00" },
  ],
  "청주 (진천경유)": [
    { t: "9:15" }, { t: "13:20" }, { t: "19:20" },
  ],
  "충주 (무극·음성·주덕경유)": [
    { t: "8:20" }, { t: "11:27" }, { t: "16:52" }, { t: "18:55" }, { t: "20:00", via: "음성종착" },
  ],
  "천안 (진천경유)": [
    { t: "7:20" }, { t: "9:40" }, { t: "11:20" }, { t: "13:30" }, { t: "18:30" },
  ],
  "오송": [
    { t: "9:00" }, { t: "18:30" },
  ],
};

// ── 시내버스: 방면별 출발 시각 (경유/요일 구분 없음) ──
const LOCAL = {
  "대소↔광혜원": ["6:50","9:20","14:10","17:20"],
  "용촌·용소": ["7:10","8:00","10:30","13:00","16:00"],
  "통동": ["6:50","9:00","10:50","13:40","15:50","18:30","19:50"],
  "봉곡": ["9:50"],
  "인곡": ["6:40","18:20"],
  "기지": ["6:50","7:10"],
  "덕산·진천": ["6:50","7:00","7:40","8:00","8:10","8:50","9:20","9:40","10:10","10:30","11:10","11:40","13:00","13:50","14:40","15:50","17:00","18:10","19:00","19:20","20:00","20:50"],
  "맹동·무극 (금왕)": ["6:50","7:20","8:10","9:50","10:20","11:50","12:30","13:20","14:00","14:50","16:10","17:20","18:00","19:20","20:20"],
};

const DEST_DATA = { intercity: INTERCITY, local: LOCAL };

// 요일 이름 (0=일 ~ 6=토)
const DAY_NAMES = ["일","월","화","수","목","금","토"];

const toMin = (t) => { const [h, m] = t.split(":").map(Number); return h * 60 + m; };

// ── 애드센스 광고 컴포넌트 ─────────────────────────────
// client: 본인 게시자 ID (ca-pub-...), slot: 광고 단위 슬롯 ID
const ADS_CLIENT = "ca-pub-6686343538244363"; // ← 본인 게시자 ID로 교체
const ADS_SLOT = "XXXXXXXXXX";                // ← 광고 단위 슬롯 ID로 교체

function AdBox() {
  const ref = useRef(null);
  const pushed = useRef(false);
  useEffect(() => {
    if (pushed.current) return;
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
      pushed.current = true;
    } catch (e) { /* 개발 중 or 미승인 시 무시 */ }
  }, []);
  return (
    <div style={{ padding: "0 18px 8px" }}>
      <ins
        className="adsbygoogle"
        style={{ display: "block", textAlign: "center" }}
        data-ad-client={ADS_CLIENT}
        data-ad-slot={ADS_SLOT}
        data-ad-format="auto"
        data-full-width-responsive="true"
        ref={ref}
      />
    </div>
  );
}

export default function App() {
  const [tab, setTab] = useState("red");
  const [origin, setOrigin] = useState("");
  const [dest, setDest] = useState("");
  const [destName, setDestName] = useState(""); // 시외/시내버스 목적지
  const [afterH, setAfterH] = useState(""); // 시 (24시간)
  const [afterM, setAfterM] = useState(""); // 분
  const [selected, setSelected] = useState(null); // 상세 뷰용 선택 결과
  const [showHelp, setShowHelp] = useState(false); // 앱 안내 모달

  const group = GROUPS[tab];
  const accent = group.color || "#E23B32"; // 현재 탭 대표색
  const accentSoft = group.soft || "#FDECEA";
  const isDestMode = group.type === "dest"; // 시외/시내버스 방식
  // 현재 탭의 노선들 (순환 방식일 때만)
  const tabLines = group.lines || [];

  // 탭 변경 시 검색값 초기화
  const changeTab = (t) => {
    setTab(t);
    setOrigin(""); setDest(""); setDestName(""); setAfterH(""); setAfterM(""); setSelected(null);
  };

  // 시각 필터 값 (시만 선택해도 동작, 둘 다 비면 필터 없음)
  const after = afterH === "" ? "" : `${afterH}:${afterM === "" ? "00" : afterM}`;

  const setNow = () => {
    const d = new Date();
    setAfterH(String(d.getHours()));
    setAfterM(String(d.getMinutes()).padStart(2, "0"));
  };

  // 출발지 후보: 현재 탭 노선의 모든 정류장 합집합 (도착 표시 제외)
  const allOrigins = useMemo(() => {
    const s = new Set();
    tabLines.forEach((line) => STOPS[line].slice(0, -1).forEach((x) => s.add(x.replace("(도착)", ""))));
    return [...s];
  }, [tabLines]);

  // 선택한 출발지에서 갈 수 있는 도착지 후보 (현재 탭 노선 기준)
  const destOptions = useMemo(() => {
    if (!origin) return [];
    const s = new Set();
    tabLines.forEach((line) => {
      const stops = STOPS[line];
      const oi = stops.indexOf(origin);
      if (oi >= 0) stops.slice(oi + 1).forEach((x) => s.add(x.replace("(도착)", "")));
    });
    return [...s];
  }, [origin, tabLines]);

  const ready = origin && dest && afterH !== "";

  const results = useMemo(() => {
    if (!ready) return [];
    const out = [];
    tabLines.forEach((line) => {
      const sched = SCHEDULES[line];
      const stops = STOPS[line];
      const oi = stops.indexOf(origin);
      if (oi < 0) return;
      // 도착지 인덱스 (선택 시). 출발지 이후여야 함
      let di = -1;
      if (dest) {
        di = stops.findIndex((s, i) => i > oi && s.replace("(도착)", "") === dest);
        if (di < 0) return; // 이 노선으론 못 감
      }
      sched.forEach((row, rowIdx) => {
        const depT = row[oi];
        if (!depT) return;
        if (after && toMin(depT) < toMin(after)) return;
        out.push({
          line,
          rowIdx,
          oi,
          di,
          dep: depT,
          depMin: toMin(depT),
          arr: di >= 0 ? row[di] : null,
          destName: di >= 0 ? stops[di].replace("(도착)", "") : null,
        });
      });
    });
    return out.sort((a, b) => a.depMin - b.depMin);
  }, [ready, origin, dest, after, tabLines]);

  // ── 시외/시내버스(목적지 방식) ──
  const destList = useMemo(() => {
    if (!isDestMode) return [];
    return Object.keys(DEST_DATA[tab]);
  }, [isDestMode, tab]);

  // 오늘 요일 (0=일 ~ 6=토)
  const todayDow = new Date().getDay();

  // 조회 조건: 시간대 선택 시 활성 (목적지는 선택사항)
  const destReady = isDestMode && afterH !== "";

  // 모든 목적지의 출발 편을 시간순으로 합쳐 반환. 목적지 선택 시 그 목적지만.
  const destResults = useMemo(() => {
    if (!destReady) return [];
    const data = DEST_DATA[tab];
    const targets = destName ? [destName] : Object.keys(data);
    const out = [];
    targets.forEach((d) => {
      (data[d] || []).forEach((item) => {
        // 시외버스는 객체({t,via,days}), 시내버스는 문자열
        const t = typeof item === "string" ? item : item.t;
        const via = typeof item === "string" ? null : (item.via || null);
        const days = typeof item === "string" ? null : (item.days || null);
        if (after && toMin(t) < toMin(after)) return;
        const runsToday = !days || days.includes(todayDow);
        out.push({
          dest: d,
          t,
          min: toMin(t),
          via,
          days,
          runsToday,
        });
      });
    });
    // 오늘 운행 편을 먼저, 그 안에서 시간순
    return out.sort((a, b) => {
      if (a.runsToday !== b.runsToday) return a.runsToday ? -1 : 1;
      return a.min - b.min;
    });
  }, [destReady, tab, destName, after, todayDow]);

  const hasResults = isDestMode
    ? (destReady && destResults.length > 0)
    : (ready && results.length > 0);
  const showEmpty = isDestMode
    ? (destReady && destResults.length === 0)
    : (ready && results.length === 0);

  const S = styles;
  return (
    <div className="page" style={S.page}>
      <div className="card" style={S.card}>
        <header style={{ ...S.header, background: accent }}>
          <div style={S.titleRow}>
            <h1 style={S.title}>충북혁도 버스 시간표</h1>
            <button style={S.helpBtn} onClick={() => setShowHelp(true)} aria-label="앱 안내">?</button>
          </div>
          <p style={S.sub}>{
            tab === "red" ? "빨간버스 1000번 / 2000번"
            : tab === "shucle" ? "자율주행셔틀 모두타유"
            : tab === "intercity" ? "혁신도시터미널 시외버스"
            : "혁신도시터미널 시내버스"
          }</p>
        </header>

        <div style={S.tabs}>
          {Object.entries(GROUPS).filter(([, g]) => !g.hidden).map(([key, g]) => (
            <button
              key={key}
              onClick={() => changeTab(key)}
              style={{
                ...S.tab,
                ...(tab === key ? { ...S.tabActive, background: g.color, borderColor: g.color } : {}),
              }}
            >
              {g.label}
            </button>
          ))}
        </div>

        <div style={S.form}>
          {!isDestMode && (
            <>
              <label style={S.field}>
                <span style={S.lbl}>출발</span>
                <select style={S.input} value={origin} onChange={(e) => { setOrigin(e.target.value); setDest(""); }}>
                  <option value="">정류장 선택</option>
                  {allOrigins.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </label>

              <label style={S.field}>
                <span style={S.lbl}>도착</span>
                <select style={S.input} value={dest} onChange={(e) => setDest(e.target.value)} disabled={!origin}>
                  <option value="">정류장 선택</option>
                  {destOptions.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </label>
            </>
          )}

          {isDestMode && (
            <label style={S.field}>
              <span style={S.lbl}>도착</span>
              <select style={S.input} value={destName} onChange={(e) => setDestName(e.target.value)}>
                <option value="">정류장 선택</option>
                {destList.map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
            </label>
          )}

          <div style={S.field}>
            <div style={S.timeHead}>
              <span style={S.lbl}>출발 시간</span>
              <button style={{ ...S.miniBtn, color: accent, borderColor: accent }} onClick={setNow}>지금</button>
            </div>
            <div style={S.timeRow}>
              <select className="timeSel" style={{ ...S.input, ...S.timeSel }} value={afterH} onChange={(e) => setAfterH(e.target.value)}>
                <option value="">시</option>
                {Array.from({ length: 17 }, (_, i) => i + 6).map((h) => (
                  <option key={h} value={h}>{String(h).padStart(2, "0")}</option>
                ))}
              </select>
              <span style={S.colon}>:</span>
              <select className="timeSel" style={{ ...S.input, ...S.timeSel }} value={afterM} onChange={(e) => setAfterM(e.target.value)} disabled={afterH === ""}>
                <option value="">분</option>
                {[...new Set(["00", "10", "20", "30", "40", "50", afterM].filter(Boolean))]
                  .sort((a, b) => Number(a) - Number(b))
                  .map((m) => (
                    <option key={m} value={m}>{m}</option>
                  ))}
              </select>
            </div>
          </div>
        </div>

        <div style={{ ...S.resultHead, ...(hasResults || showEmpty ? {} : S.resultHeadEmpty) }}>
          {isDestMode
            ? (destReady ? `${destResults.length}편` : "")
            : (ready ? `${results.length}대` : "")}
        </div>

        <div style={{ ...S.list, ...(hasResults ? {} : S.listEmpty) }}>
          {/* 순환 방식(빨간버스·모두타유) 결과 */}
          {!isDestMode && ready && results.length === 0 && (
            <div style={S.empty}>선택한 시간 이후 버스편이 없습니다</div>
          )}
          {!isDestMode && results.map((r, i) => {
            const m = LINE_META[r.line];
            return (
              <div key={i} style={S.row} onClick={() => setSelected(r)} role="button" tabIndex={0}>
                <div style={S.rowLeft}>
                  <span style={{ ...S.dot, background: m.color }} />
                  <span style={S.rowNum}>{m.num === "모두타유" ? m.num : `${m.num}번`}</span>
                </div>
                <div style={S.rowMain}>
                  <div style={S.timeLine}>
                    <b style={S.dep}>{r.dep}</b>
                    <span style={S.arrow}>→</span>
                    <b style={S.arr}>{r.arr}</b>
                  </div>
                  <div style={S.stops}>{origin} → {r.destName}</div>
                </div>
                <span style={S.chevron}>›</span>
              </div>
            );
          })}

          {/* 목적지 방식(시외·시내버스) 편별 목록 */}
          {isDestMode && destReady && destResults.length === 0 && (
            <div style={S.empty}>선택한 시간 이후 버스편이 없습니다</div>
          )}
          {isDestMode && destReady && destResults.map((r, i) => (
            <div key={i} style={{ ...S.row, ...(r.runsToday ? {} : S.rowDim) }}>
              <div style={S.busTimeCol}>
                <b style={{ ...S.dep, color: accent }}>{r.t}</b>
              </div>
              <div style={S.rowMain}>
                <div style={S.busDest}>{r.dest}</div>
                <div style={S.busTags}>
                  <span style={{ ...S.viaTag, ...(r.via ? S.viaCol : S.directCol) }}>
                    {r.via ? `${r.via} 경유` : "직통"}
                  </span>
                  {r.days && (
                    <span style={{ ...S.dayTag, ...(r.runsToday ? S.dayRun : S.dayNo) }}>
                      {r.days.map((d) => DAY_NAMES[d]).join("·")}요일 운행{r.runsToday ? "" : " (오늘 미운행)"}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        <AdBox />

        <footer style={S.foot}>
          실제운행은 도로 사정에 따라 달라질 수 있음.
          <br />
          문의: <a href="mailto:redbus.help@gmail.com" style={{ ...S.mail, color: accent, borderColor: accentSoft }}>JH K (redbus.help@gmail.com)</a>
        </footer>
      </div>

      {selected && (
        <DetailView result={selected} onClose={() => setSelected(null)} />
      )}
      {showHelp && <HelpView onClose={() => setShowHelp(false)} />}
    </div>
  );
}

// ── 앱 안내 뷰 ─────────────────────────────
function HelpView({ onClose }) {
  const D = detailStyles;
  return (
    <div style={D.overlay} onClick={onClose}>
      <div style={D.sheet} onClick={(e) => e.stopPropagation()}>
        <div style={D.grabber} />
        <div style={D.head}>
          <div style={D.headLeft}>
            <span style={D.headNum}>이 앱은</span>
          </div>
          <button style={D.close} onClick={onClose} aria-label="닫기">✕</button>
        </div>
        <div style={helpStyles.body}>
          <p style={helpStyles.p}>
            <b>충북혁신도시</b>를 오가는 여러 버스의 출발·도착 시각을 한 곳에서 찾아보는 앱입니다.
            출발지·도착지·시간을 고르면 언제 어디서 어떤 버스를 타야 하는지 알려줍니다.
          </p>
          <div style={helpStyles.sec}>지금 담긴 버스</div>
          <ul style={helpStyles.ul}>
            <li style={helpStyles.li}><b>빨간버스</b> — 혁신도시 순환버스(1000·2000번). 출발·도착 정류장으로 조회</li>
            <li style={helpStyles.li}><b>모두타유</b> — 자율주행셔틀. 시계·반시계 방향 순환</li>
            <li style={helpStyles.li}><b>시외버스</b> — 혁신도시터미널에서 서울·대전·청주 등으로 가는 버스. 직통·경유·요일 운행 구분 표시</li>
          </ul>
          <div style={helpStyles.sec}>앞으로</div>
          <p style={helpStyles.p}>
            시내버스를 비롯해 혁신도시를 지나는 <b>모든 버스 정보를 하나씩 추가</b>할 예정입니다.
            정보가 다 모이면, 내 위치와 시간대를 기준으로 <b>여러 버스를 한 번에 비교</b>해
            가장 빠른 편을 골라주는 기능을 목표로 하고 있습니다.
          </p>
          <p style={helpStyles.note}>
            시각은 예정 시각이며 실제 운행은 도로 상황에 따라 달라질 수 있습니다.
            잘못된 정보나 제안은 아래 문의 이메일로 알려주세요.
          </p>
          <a href="mailto:redbus.help@gmail.com" style={helpStyles.mailBtn}>문의: redbus.help@gmail.com</a>
        </div>
      </div>
    </div>
  );
}

// ── 상세 노선/시각 뷰 ─────────────────────────────
function DetailView({ result, onClose }) {
  const m = LINE_META[result.line];
  const stops = STOPS[result.line];
  const row = SCHEDULES[result.line][result.rowIdx];
  const D = detailStyles;

  return (
    <div style={D.overlay} onClick={onClose}>
      <div style={D.sheet} onClick={(e) => e.stopPropagation()}>
        <div style={D.grabber} />
        <div style={D.head}>
          <div style={D.headLeft}>
            <span style={{ ...D.dot, background: m.color }} />
            <span style={D.headNum}>{m.num === "모두타유" ? m.label : `${m.num}번`}</span>
            <span style={D.headTime}>{result.dep} 출발</span>
          </div>
          <button style={D.close} onClick={onClose} aria-label="닫기">✕</button>
        </div>

        <div style={D.timeline}>
          {stops.map((name, idx) => {
            const t = row[idx];
            const inRange = idx >= result.oi && (result.di < 0 || idx <= result.di);
            const isOrigin = idx === result.oi;
            const isDest = idx === result.di;
            const label = name.replace("(도착)", "");
            return (
              <div key={idx} style={D.stopRow}>
                <div style={D.timeCol}>{t}</div>
                <div style={D.lineCol}>
                  <span style={{
                    ...D.node,
                    ...(inRange ? { borderColor: m.color } : {}),
                    ...(isOrigin || isDest ? { background: m.color, borderColor: m.color } : {}),
                  }} />
                  {idx < stops.length - 1 && (
                    <span style={{ ...D.bar, ...(inRange && idx >= result.oi && (result.di < 0 || idx < result.di) ? { background: m.color } : {}) }} />
                  )}
                </div>
                <div style={{ ...D.stopName, ...(inRange ? D.stopNameActive : {}) }}>
                  {label}
                  {isOrigin && <span style={{ ...D.tag, background: m.color }}>승차</span>}
                  {isDest && <span style={{ ...D.tag, background: "#111" }}>하차</span>}
                </div>
              </div>
            );
          })}
        </div>

        <div style={D.foot}>정류장별 시각은 예정 시각으로, 실제 운행과 다를 수 있습니다</div>
      </div>
    </div>
  );
}

// ── GoBus풍 스타일: 흰 배경 + 빨간 포인트 ──
const RED = "#E23B32";
const RED_SOFT = "#FDECEA";
const INK = "#1F2430";
const SUB = "#8A90A0";
const LINE = "#EEF0F4";

const styles = {
  page: {
    position: "relative", minHeight: "100vh",
    background: "#F5F6F8",
    padding: "14px 12px 20px", fontFamily: "'Pretendard', -apple-system, sans-serif", color: INK,
    WebkitFontSmoothing: "antialiased", MozOsxFontSmoothing: "grayscale", textRendering: "optimizeLegibility",
  },
  card: {
    position: "relative", maxWidth: 440, margin: "0 auto",
    background: "#fff", borderRadius: 24, overflow: "hidden",
    boxShadow: "0 6px 24px rgba(20,25,40,0.06)",
  },
  header: { padding: "22px 22px 14px", background: RED, color: "#fff" },
  titleRow: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 },
  title: { margin: 0, fontSize: 24, fontWeight: 800, letterSpacing: "-0.02em", color: "#fff" },
  helpBtn: {
    flexShrink: 0, width: 30, height: 30, borderRadius: "50%",
    border: "1px solid rgba(255,255,255,0.6)", background: "rgba(255,255,255,0.18)",
    color: "#fff", fontSize: 16, fontWeight: 700, cursor: "pointer", lineHeight: 1,
  },
  sub: { margin: "6px 0 0", fontSize: 13, color: "rgba(255,255,255,0.9)", fontWeight: 500, letterSpacing: "0.02em" },

  tabs: { display: "flex", gap: 6, padding: "12px 16px 4px", background: "#fff" },
  tab: {
    flex: 1, padding: "10px 2px", fontSize: 13, fontWeight: 700, cursor: "pointer",
    borderRadius: 999, border: "1px solid " + LINE,
    background: "#fff", color: SUB, whiteSpace: "nowrap",
  },
  tabActive: { background: RED, color: "#fff", border: "1px solid " + RED },

  form: { padding: "8px 22px 0", display: "flex", flexDirection: "column" },
  field: { display: "flex", flexDirection: "column", gap: 7, padding: "12px 0", borderTop: "1px solid " + LINE },
  lbl: { fontSize: 12, fontWeight: 700, color: SUB, letterSpacing: "0.04em" },
  input: {
    padding: "12px 14px", fontSize: 16, fontWeight: 600, color: INK,
    border: "1px solid " + LINE, borderRadius: 14,
    background: "#FAFBFC", outline: "none", WebkitAppearance: "none", cursor: "pointer",
  },
  timeHead: { display: "flex", justifyContent: "space-between", alignItems: "center" },
  miniBtn: {
    padding: "6px 14px", fontSize: 12, fontWeight: 700, color: RED,
    border: "1px solid " + RED, borderRadius: 999, background: "#fff", cursor: "pointer",
  },
  timeRow: { display: "flex", alignItems: "center", gap: 10 },
  timeSel: { flex: "0 0 auto", width: 78, textAlign: "center", textAlignLast: "center", fontSize: 20, fontWeight: 700 },
  colon: { fontSize: 22, fontWeight: 500, color: "#C7CCD6" },

  resultHead: { padding: "18px 22px 8px", fontSize: 12, fontWeight: 700, color: SUB, letterSpacing: "0.04em" },
  resultHeadEmpty: { padding: "4px 22px 0", height: 0, overflow: "hidden" },
  list: { display: "flex", flexDirection: "column", gap: 10, padding: "0 16px 8px", maxHeight: "min(52vh, 520px)", overflowY: "auto" },
  listEmpty: { maxHeight: "none", padding: "0 16px" },
  empty: { padding: "36px 22px", textAlign: "center", color: "#B4B9C4", fontSize: 14 },

  row: {
    display: "flex", alignItems: "center", gap: 14, padding: "15px 16px",
    background: "#fff", border: "1px solid " + LINE, borderRadius: 16,
    boxShadow: "0 2px 10px rgba(20,25,40,0.04)", cursor: "pointer",
  },
  rowDim: { opacity: 0.5 },
  rowLeft: { display: "flex", flexDirection: "column", alignItems: "center", gap: 5, width: 46, flexShrink: 0 },
  dot: { width: 9, height: 9, borderRadius: "50%" },
  rowNum: { fontSize: 11, fontWeight: 800, color: SUB, letterSpacing: "0.02em", whiteSpace: "nowrap" },
  rowMain: { flex: 1, minWidth: 0 },
  timeLine: { display: "flex", alignItems: "baseline", gap: 9 },
  dep: { fontSize: 21, fontWeight: 800, letterSpacing: "-0.01em", color: INK },
  arrow: { fontSize: 14, color: "#C7CCD6" },
  arr: { fontSize: 21, fontWeight: 800, color: SUB, letterSpacing: "-0.01em" },
  stops: { fontSize: 13, color: SUB, marginTop: 3, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" },
  chevron: { fontSize: 22, color: "#C7CCD6", fontWeight: 400, flexShrink: 0, marginLeft: 2 },

  busTimeCol: { width: 58, flexShrink: 0, display: "flex", alignItems: "center" },
  busDest: { fontSize: 16, fontWeight: 800, color: INK, marginBottom: 5 },
  busTags: { display: "flex", flexWrap: "wrap", gap: 6, alignItems: "center" },
  viaTag: { fontSize: 12, fontWeight: 700, padding: "2px 9px", borderRadius: 999 },
  directCol: { background: "#E7F6EE", color: "#188A56" },
  viaCol: { background: "#EAF0FF", color: "#3A5BD0" },
  dayTag: { fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 999 },
  dayRun: { background: "#F1F3F7", color: SUB },
  dayNo: { background: RED_SOFT, color: RED },

  foot: { padding: "14px 22px 20px", fontSize: 11, color: "#A6ABB8", lineHeight: 1.8, background: "#fff" },
  mail: { color: RED, fontWeight: 700, textDecoration: "none", borderBottom: "1px solid " + RED_SOFT },
};

// ── 상세/안내 시트 스타일 ──
const detailStyles = {
  overlay: {
    position: "fixed", inset: 0, zIndex: 100,
    background: "rgba(20,25,40,0.4)",
    display: "flex", alignItems: "flex-end", justifyContent: "center",
  },
  sheet: {
    width: "100%", maxWidth: 440, maxHeight: "85vh", overflowY: "auto",
    background: "#fff",
    borderTopLeftRadius: 24, borderTopRightRadius: 24,
    boxShadow: "0 -8px 40px rgba(20,25,40,0.2)",
    padding: "10px 0 28px",
  },
  grabber: { width: 40, height: 5, borderRadius: 3, background: "#E3E6EC", margin: "6px auto 12px" },
  head: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 22px 16px", borderBottom: "1px solid " + LINE },
  headLeft: { display: "flex", alignItems: "center", gap: 8 },
  dot: { width: 10, height: 10, borderRadius: "50%" },
  headNum: { fontSize: 15, fontWeight: 800, color: INK },
  headTime: { fontSize: 14, color: SUB, fontWeight: 700 },
  close: { border: "none", background: "#F1F3F7", color: INK, width: 30, height: 30, borderRadius: "50%", fontSize: 14, cursor: "pointer" },
  timeline: { padding: "16px 22px 8px" },
  stopRow: { display: "flex", alignItems: "stretch", minHeight: 44 },
  timeCol: { width: 52, flexShrink: 0, fontSize: 13, fontWeight: 700, color: SUB, paddingTop: 1 },
  lineCol: { width: 24, flexShrink: 0, display: "flex", flexDirection: "column", alignItems: "center" },
  node: { width: 13, height: 13, borderRadius: "50%", background: "#fff", border: "2.5px solid #D6DAE2", flexShrink: 0, zIndex: 1 },
  bar: { width: 2.5, flex: 1, background: "#E7EAF0", margin: "1px 0" },
  stopName: { flex: 1, fontSize: 15, color: SUB, paddingBottom: 14, display: "flex", alignItems: "center", gap: 8, lineHeight: 1.2 },
  stopNameActive: { color: INK, fontWeight: 800 },
  tag: { fontSize: 11, fontWeight: 700, color: "#fff", padding: "2px 8px", borderRadius: 999, flexShrink: 0 },
  foot: { padding: "8px 22px 0", fontSize: 11, color: "#A6ABB8", lineHeight: 1.5 },
};

// ── 앱 안내 스타일 ──
const helpStyles = {
  body: { padding: "16px 22px 8px" },
  p: { margin: "0 0 14px", fontSize: 14, lineHeight: 1.65, color: "#3A4150" },
  sec: { fontSize: 12, fontWeight: 800, color: SUB, letterSpacing: "0.04em", margin: "18px 0 8px" },
  ul: { margin: "0 0 6px", padding: 0, listStyle: "none" },
  li: { fontSize: 14, lineHeight: 1.55, color: "#3A4150", marginBottom: 10, paddingLeft: 12, borderLeft: "3px solid " + RED },
  note: { margin: "16px 0 14px", fontSize: 12, lineHeight: 1.6, color: SUB },
  mailBtn: {
    display: "block", textAlign: "center", padding: "13px", borderRadius: 14,
    background: RED, color: "#fff", fontSize: 14, fontWeight: 800,
    textDecoration: "none", marginBottom: 6,
  },
};
