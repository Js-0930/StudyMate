# StudyMate v1.0

학생용 공부 계획 + 집중시간 관리 웹앱입니다.

## 기능
- 공부 계획 추가 / 완료 / 삭제
- 계획 필터
- 집중 타이머
- 오늘 / 최근 7일 공부시간
- 과목별 공부시간 통계
- 다크모드
- localStorage 자동 저장
- 모바일 반응형

## 실행
`index.html`을 브라우저로 열면 됩니다.

## 무료 배포
GitHub 저장소를 만든 뒤 이 폴더의 파일을 업로드하고
Settings → Pages → Deploy from a branch → `main` / `/ (root)`를 선택하면
GitHub Pages로 공개할 수 있습니다.

현재 데이터는 브라우저 localStorage에 저장되므로 여러 기기에서 공유되지 않습니다.
회원가입/로그인 및 동기화가 필요해지면 Firebase 또는 Supabase 같은 백엔드를 붙이는 것을 권장합니다.
