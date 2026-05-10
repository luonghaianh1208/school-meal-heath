# Known Bugs & Issues

## 🔴 Critical

1. **[C1] `enableIndexedDbPersistence` deprecated** — `src/lib/firebase.ts:3` — Firebase SDK v12 đã xoá API này, cần chuyển sang `initializeFirestore` với `persistentLocalCache`.
2. **[C2] Auth mock** — `src/hooks/useAuth.ts` — Không dùng Firebase Auth SDK thật, chỉ mock bằng localStorage. Ai cũng login được.
3. **[C3] Data mock** — `src/hooks/useStudents.ts`, `useMealRecords.ts` — Toàn bộ dữ liệu lưu localStorage, không dùng Firestore. Mất data khi clear browser.
4. **[C4] API key lộ trên client** — `src/lib/gemini.ts:8` — `VITE_GEMINI_API_KEY` bị bundle vào browser JS, ai cũng thấy qua DevTools.
5. **[C5] `.env.example` thiếu biến Firebase** — Không có `VITE_FIREBASE_*`, developer mới không biết cần setup gì.

## 🟡 Medium

6. **[M1] Title sai** — `index.html:6` — "My Google AI Studio App" thay vì tên app.
7. **[M2] Thiếu meta SEO** — `index.html` — Không description, favicon, OG tags.
8. **[M3] Login hiện credential test** — `Login.tsx:56,69` — Hiện email/pass demo trên label.
9. ~~**[M4] Danh sách lớp hard-code**~~ ✅ Đã chuyển sang dynamic từ Firestore.
10. ~~**[M5] Reports data mock**~~ ✅ Đã sửa eatLevel comparison, dùng data Firestore thật.
11. **[M6] Mobile nav thiếu "Báo cáo"** — `Layout.tsx:96` — `navItems.slice(0,5)` cắt mất item thứ 6.
12. **[M7] Nút "Thêm HS" broken** — `Students.tsx:35` — Không có onClick handler.
13. **[M8] Nút "Xem tất cả" broken** — `Dashboard.tsx:147` — Click không navigate.
14. **[M9] AI analysis truyền records rỗng** — `AIInsights.tsx:20` — Luôn truyền `[]`.
15. **[M10] Duplicate CSS class** — `MealTracking.tsx:160` — `mt-0.5 mt-1` xung đột.

## 🟢 Low

16. **[L1] Fallback 'DUMMY' API key** — `gemini.ts:17`.
17. **[L2] ID generation không tối ưu** — `useStudents.ts:32`.
18. **[L3] Cast `as any`** — `seedData.ts:50`.
19. **[L4] `weekData: any` type** — `gemini.ts:82`.
20. **[L5] Unused React import** — `ProtectedRoute.tsx:1`.

## ✅ Resolved
- **[C1]** Sửa deprecated persistence API — Session 3
- **[C2]** Auth mock → Firebase Auth thật — Session 3
- **[C3]** Data mock → Firestore thật — Session 3
- **[C5]** .env.example — Session 3
- **[M1]** Title sai — Session 3
- **[M2]** Meta SEO — Session 3
- **[M3]** Login credential hints — Session 3
- **[M4]** Danh sách lớp hard-code → dynamic — Session 4
- **[M5]** Reports data mock → Firestore data thật — Session 4
- **[M6]** Mobile nav — Session 3
