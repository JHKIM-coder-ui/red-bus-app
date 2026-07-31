# 충북혁도 빨간버스 시간표

충북혁신도시 순환버스(1000번 / 2000번)의 출발·도착 시각을 조회하는 웹앱입니다.
출발지·도착지·시간을 선택하면 탈 수 있는 버스를 알려줍니다.

서버·로그인·데이터베이스가 필요 없는 **정적 웹앱**이며, PWA로 만들어져 있어
폰에서 "홈 화면에 추가"로 앱처럼 설치할 수 있습니다.

---

## 다른 사람이 사용하게 하는 방법

배포(deploy)하면 **웹 주소(URL)** 가 하나 생깁니다. 그 주소만 공유하면 누구나 링크를
열어서 바로 사용할 수 있고, 폰에서 열어 "홈 화면에 추가"를 누르면 아이콘이 생겨
앱처럼 쓸 수 있습니다. (앱스토어 등록이나 설치 파일 배포는 필요 없습니다.)

### 방법 A — Vercel (가장 쉬움, 추천)

1. https://vercel.com 에 GitHub 계정으로 로그인
2. 이 폴더를 GitHub 저장소에 올린다
   ```bash
   git init
   git add .
   git commit -m "빨간버스 시간표"
   git branch -M main
   git remote add origin https://github.com/사용자명/저장소명.git
   git push -u origin main
   ```
3. Vercel에서 **New Project → 방금 만든 저장소 선택 → Deploy**
   - Framework Preset이 자동으로 **Vite** 로 잡힘 (그대로 두면 됨)
   - Build Command: `npm run build` / Output Directory: `dist` (자동 설정됨)
4. 몇 초 뒤 `https://저장소명.vercel.app` 주소가 생성됨 → 이 주소를 공유

GitHub 없이도 배포 가능: Vercel CLI 사용
```bash
npm i -g vercel
vercel        # 안내에 따라 로그인 후 배포
vercel --prod # 정식 배포
```

### 방법 B — Netlify

1. 로컬에서 빌드
   ```bash
   npm install
   npm run build
   ```
2. https://app.netlify.com 의 "Add new site → Deploy manually" 에
   생성된 `dist` 폴더를 그대로 드래그&드롭
3. 바로 URL 생성됨

---

## 로컬에서 실행해보기

```bash
npm install     # 최초 1회
npm run dev      # http://localhost:5173 에서 미리보기
```

## 시간표 데이터 수정

버스 시각과 정류장 순서는 `src/App.jsx` 상단의
`STOPS`, `SCHEDULE_1000`, `SCHEDULE_2000` 에 들어 있습니다.
숫자만 고치면 앱에 바로 반영됩니다.

## 폰에 설치(PWA)
- **아이폰(Safari):** 공유 버튼 → "홈 화면에 추가"
- **안드로이드(Chrome):** 우측 상단 메뉴 → "앱 설치" 또는 "홈 화면에 추가"
