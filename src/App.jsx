import React, { useState, useMemo } from "react";

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
};

// ── 시간표: 각 배열 = 한 회차, 정류장 순서대로 시각(문자열) ──
// 순환1번 (1000번) 빨간 시간표
const SCHEDULE_1000 = [
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

const SCHEDULES = { "1000": SCHEDULE_1000, "2000": SCHEDULE_2000 };
const LINE_META = {
  "1000": { label: "순환1번", num: "1000", color: "#E2483D" },
  "2000": { label: "순환2번", num: "2000", color: "#2F7D4F" },
};

const toMin = (t) => { const [h, m] = t.split(":").map(Number); return h * 60 + m; };

export default function App() {
  const [origin, setOrigin] = useState("");
  const [dest, setDest] = useState("");
  const [afterH, setAfterH] = useState(""); // 시 (24시간)
  const [afterM, setAfterM] = useState(""); // 분

  // 시각 필터 값 (시만 선택해도 동작, 둘 다 비면 필터 없음)
  const after = afterH === "" ? "" : `${afterH}:${afterM === "" ? "00" : afterM}`;

  const setNow = () => {
    const d = new Date();
    setAfterH(String(d.getHours()));
    setAfterM(String(d.getMinutes()).padStart(2, "0"));
  };

  // 출발지 후보: 두 노선의 모든 정류장 합집합 (도착 표시 제외)
  const allOrigins = useMemo(() => {
    const s = new Set();
    Object.values(STOPS).forEach((arr) => arr.slice(0, -1).forEach((x) => s.add(x)));
    return [...s];
  }, []);

  // 선택한 출발지에서 갈 수 있는 도착지 후보
  const destOptions = useMemo(() => {
    if (!origin) return [];
    const s = new Set();
    Object.entries(STOPS).forEach(([line, stops]) => {
      const oi = stops.indexOf(origin);
      if (oi >= 0) stops.slice(oi + 1).forEach((x) => s.add(x.replace("(도착)", "")));
    });
    return [...s];
  }, [origin]);

  const ready = origin && dest && afterH !== "";

  const results = useMemo(() => {
    if (!ready) return [];
    const out = [];
    Object.entries(SCHEDULES).forEach(([line, sched]) => {
      const stops = STOPS[line];
      const oi = stops.indexOf(origin);
      if (oi < 0) return;
      // 도착지 인덱스 (선택 시). 출발지 이후여야 함
      let di = -1;
      if (dest) {
        di = stops.findIndex((s, i) => i > oi && s.replace("(도착)", "") === dest);
        if (di < 0) return; // 이 노선으론 못 감
      }
      sched.forEach((row) => {
        const depT = row[oi];
        if (!depT) return;
        if (after && toMin(depT) < toMin(after)) return;
        out.push({
          line,
          dep: depT,
          depMin: toMin(depT),
          arr: di >= 0 ? row[di] : null,
          destName: di >= 0 ? stops[di].replace("(도착)", "") : null,
        });
      });
    });
    return out.sort((a, b) => a.depMin - b.depMin);
  }, [ready, origin, dest, after]);

  const S = styles;
  return (
    <div style={S.page}>
      <div style={S.blobA} />
      <div style={S.blobB} />
      <div style={S.blobC} />
      <div style={S.card}>
        <header style={S.header}>
          <h1 style={S.title}>충북혁도 빨간버스 시간표</h1>
          <p style={S.sub}>1000번 / 2000번</p>
        </header>

        <div style={S.form}>
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

          <div style={S.field}>
            <div style={S.timeHead}>
              <span style={S.lbl}>이후 시간</span>
              <button style={S.miniBtn} onClick={setNow}>지금</button>
            </div>
            <div style={S.timeRow}>
              <select style={{ ...S.input, ...S.timeSel }} value={afterH} onChange={(e) => setAfterH(e.target.value)}>
                <option value="">시</option>
                {Array.from({ length: 17 }, (_, i) => i + 6).map((h) => (
                  <option key={h} value={h}>{String(h).padStart(2, "0")}</option>
                ))}
              </select>
              <span style={S.colon}>:</span>
              <select style={{ ...S.input, ...S.timeSel }} value={afterM} onChange={(e) => setAfterM(e.target.value)} disabled={afterH === ""}>
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

        <div style={S.resultHead}>
          {ready ? `${results.length}대` : "출발 · 도착 · 시간을 선택하세요"}
        </div>

        <div style={S.list}>
          {ready && results.length === 0 && (
            <div style={S.empty}>조건에 맞는 버스가 없습니다</div>
          )}
          {results.map((r, i) => {
            const m = LINE_META[r.line];
            return (
              <div key={i} style={S.row}>
                <div style={S.rowLeft}>
                  <span style={{ ...S.dot, background: m.color }} />
                  <span style={S.rowNum}>{m.num}번</span>
                </div>
                <div style={S.rowMain}>
                  <div style={S.timeLine}>
                    <b style={S.dep}>{r.dep}</b>
                    <span style={S.arrow}>→</span>
                    <b style={S.arr}>{r.arr}</b>
                  </div>
                  <div style={S.stops}>{origin} → {r.destName}</div>
                </div>
              </div>
            );
          })}
        </div>

        <footer style={S.foot}>
          빨간(하행) 시간표 기준 · 실제 운행은 도로 상황에 따라 달라질 수 있습니다
        </footer>
      </div>
    </div>
  );
}

const glass = "saturate(160%) blur(20px)";

const styles = {
  page: {
    position: "relative", minHeight: "100vh", overflow: "hidden",
    background: "linear-gradient(150deg, #cfe2ff 0%, #e7d9ff 45%, #ffe0ec 100%)",
    padding: "28px 14px", fontFamily: "'Pretendard', -apple-system, sans-serif", color: "#1a1730",
    WebkitFontSmoothing: "antialiased", MozOsxFontSmoothing: "grayscale", textRendering: "optimizeLegibility",
  },
  blobA: { position: "absolute", top: -80, left: -60, width: 280, height: 280, borderRadius: "50%", background: "radial-gradient(circle, #7ca8ff 0%, transparent 70%)", filter: "blur(30px)", opacity: 0.7, pointerEvents: "none" },
  blobB: { position: "absolute", top: 180, right: -90, width: 320, height: 320, borderRadius: "50%", background: "radial-gradient(circle, #ff9ec2 0%, transparent 70%)", filter: "blur(34px)", opacity: 0.6, pointerEvents: "none" },
  blobC: { position: "absolute", bottom: -100, left: 40, width: 300, height: 300, borderRadius: "50%", background: "radial-gradient(circle, #b493ff 0%, transparent 70%)", filter: "blur(34px)", opacity: 0.55, pointerEvents: "none" },
  card: {
    position: "relative", maxWidth: 440, margin: "0 auto",
    background: "rgba(255,255,255,0.5)", backdropFilter: glass, WebkitBackdropFilter: glass,
    border: "1px solid rgba(255,255,255,0.6)", borderRadius: 28,
    boxShadow: "0 12px 40px rgba(70,60,130,0.18), inset 0 1px 0 rgba(255,255,255,0.7)",
    overflow: "hidden",
  },
  header: { padding: "32px 26px 22px" },
  title: { margin: 0, fontSize: 27, fontWeight: 700, letterSpacing: "-0.02em", color: "#211c3d" },
  sub: { margin: "8px 0 0", fontSize: 13, color: "#4a4370", fontWeight: 600, letterSpacing: "0.02em" },
  form: { padding: "0 26px", display: "flex", flexDirection: "column" },
  field: { display: "flex", flexDirection: "column", gap: 8, padding: "18px 0", borderTop: "1px solid rgba(255,255,255,0.45)" },
  lbl: { fontSize: 12, fontWeight: 600, color: "#5c5480", letterSpacing: "0.06em", textTransform: "uppercase" },
  input: {
    padding: "11px 14px", fontSize: 16, fontWeight: 500, color: "#211c3d",
    border: "1px solid rgba(255,255,255,0.55)", borderRadius: 14,
    background: "rgba(255,255,255,0.55)", backdropFilter: "blur(6px)", WebkitBackdropFilter: "blur(6px)",
    outline: "none", WebkitAppearance: "none", cursor: "pointer",
  },
  timeHead: { display: "flex", justifyContent: "space-between", alignItems: "center" },
  miniBtn: {
    padding: "6px 14px", fontSize: 12, fontWeight: 600, color: "#211c3d",
    border: "1px solid rgba(255,255,255,0.6)", borderRadius: 999,
    background: "rgba(255,255,255,0.4)", cursor: "pointer",
  },
  timeRow: { display: "flex", alignItems: "center", gap: 10 },
  timeSel: { flex: "0 0 auto", width: 78, textAlign: "center", textAlignLast: "center", fontSize: 20, fontWeight: 700 },
  colon: { fontSize: 22, fontWeight: 500, color: "#8a83a8" },
  resultHead: { padding: "24px 26px 10px", fontSize: 12, fontWeight: 600, color: "#5c5480", letterSpacing: "0.06em", textTransform: "uppercase" },
  list: { display: "flex", flexDirection: "column", gap: 10, padding: "0 18px 8px", maxHeight: 380, overflowY: "auto" },
  empty: { padding: "40px 24px", textAlign: "center", color: "#8a83a8", fontSize: 14 },
  row: {
    display: "flex", alignItems: "center", gap: 16, padding: "16px 18px",
    background: "rgba(255,255,255,0.55)", backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)",
    border: "1px solid rgba(255,255,255,0.55)", borderRadius: 18,
    boxShadow: "0 4px 16px rgba(70,60,130,0.08)",
  },
  rowLeft: { display: "flex", flexDirection: "column", alignItems: "center", gap: 6, width: 44, flexShrink: 0 },
  dot: { width: 10, height: 10, borderRadius: "50%", boxShadow: "0 0 8px rgba(0,0,0,0.15)" },
  rowNum: { fontSize: 11, fontWeight: 700, color: "#5c5480", letterSpacing: "0.03em", whiteSpace: "nowrap" },
  rowMain: { flex: 1, minWidth: 0 },
  timeLine: { display: "flex", alignItems: "baseline", gap: 10 },
  dep: { fontSize: 22, fontWeight: 700, letterSpacing: "-0.01em", color: "#211c3d" },
  arrow: { fontSize: 14, color: "#8a83a8" },
  arr: { fontSize: 22, fontWeight: 700, color: "#413a63", letterSpacing: "-0.01em" },
  stops: { fontSize: 13, color: "#5c5480", marginTop: 4, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" },
  foot: { padding: "22px 26px 34px", fontSize: 11, color: "#7b749c", lineHeight: 1.6 },
};
