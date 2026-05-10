# Task Management

## Current Tasks
- [x] Đọc toàn bộ codebase và khởi tạo tài liệu dự án (`_docs/`).
- [x] Audit toàn bộ codebase: tìm bugs, đánh giá tiềm năng, đề xuất roadmap MVP.
- [ ] **Phase 1 — Sửa Critical bugs** (P0):
  - [x] Kết nối Firebase Auth thật (thay mock `useAuth`)
  - [x] Kết nối Firestore thật (thay mock `useStudents`, `useMealRecords`)
  - [x] Sửa Firebase persistence (deprecated API)
  - [ ] Bảo vệ Gemini API key (proxy qua backend)
  - [x] Hoàn thiện .env.example
  - [x] Sửa index.html (title, meta, favicon)
  - [x] Migrate Firestore eatLevel data (string → number)
- [ ] **Phase 2 — Hoàn thiện Features** (P1):
  - [x] Form Thêm/Sửa/Xoá Học sinh
  - [x] Dynamic class list từ data (MealTracking)
  - [x] Reports từ data thật (sửa eatLevel comparison)
  - [ ] Fix AI analysis truyền records rỗng
  - [ ] Mobile nav đầy đủ
- [ ] **Phase 3 — Polish** (P2):
  - [ ] Export PDF/Excel
  - [ ] Multi-user roles
  - [ ] Error boundaries
  - [ ] Loading states đồng nhất

## Ưu tiên
1. ~~Khởi tạo tài liệu~~ ✅
2. ~~Audit codebase~~ ✅
3. ~~Sửa Critical bugs~~ ✅ (trừ Gemini key)
4. ~~Chuyển sang data thật~~ ✅
5. Hoàn thiện features cốt lõi
6. Polish & tối ưu
