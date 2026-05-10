# Changelog

## [Unreleased]

### 2026-05-10 — Session 4: Chuyển sang dữ liệu Firebase thật, sửa data mismatch + Cài Agent-Kit

**Cài đặt Agent-Kit:**
- Clone từ `github.com/luonghaianh1208/Agent-Kit`
- Copy `.agent/` (20 agents, 40 skills, 11 workflows) + `GEMINI.md` vào root dự án
- Dọn sạch thư mục temp

**Kiểm tra Firebase DB:**
- Xác nhận Firestore hoạt động đúng: 3 collections (students, mealRecords, alerts) có dữ liệu thật
- Firebase Auth có 1 user (luonghaianh1208@gmail.com)
- Firestore rules đã deployed đúng

**Data Migration (Firestore):**
- Migrate tất cả 10 meal records: `eatLevel` từ string (`"all"`, `"most"`, `"half"`) → number (`100`, `75`, `50`) để khớp TypeScript type

**Files thay đổi:**
- `src/pages/Reports.tsx` — Sửa so sánh `eatLevel` từ string (`'complete'`/`'most'`) → number (`>= 75`). Bug M5 fixed
- `src/pages/MealTracking.tsx` — Thay danh sách lớp hardcoded (`['6A','6B',...]`) bằng dynamic classes từ Firestore students. Thêm auto-select class khi data load. Bug M4 fixed
- `src/utils/seedData.ts` — Cập nhật seed eatLevel format string → number cho tương lai

**Bugs đã sửa:** M4, M5

### 2026-05-08 — Session 3: Kết nối Firebase thật + Phân quyền Role

**Files thay đổi:**
- `src/lib/firebase.ts` — Sửa deprecated `enableIndexedDbPersistence` → `initializeFirestore` với `persistentLocalCache`
- `src/types/index.ts` — Thêm `AppUser` interface (uid, email, displayName, role, assignedClasses)
- `src/hooks/useAuth.tsx` — **Viết lại hoàn toàn**: mock localStorage → Firebase Auth + Firestore user profile. Thêm `AuthProvider` context, `signUp`, phân quyền role (first user = admin)
- `src/App.tsx` — Wrap `<AuthProvider>` quanh toàn bộ app
- `src/hooks/useStudents.ts` — **Viết lại hoàn toàn**: localStorage → Firestore `onSnapshot` realtime. Thêm `deleteStudent`
- `src/hooks/useMealRecords.ts` — **Viết lại hoàn toàn**: localStorage → Firestore `onSnapshot` + `writeBatch`
- `src/utils/seedData.ts` — Seed vào Firestore thay vì localStorage
- `src/components/ProtectedRoute.tsx` — Dùng AuthContext, thêm role-based route protection + loading spinner
- `src/components/Layout.tsx` — Hiện user info + role badge sidebar, fix mobile nav hiện đủ 6 mục
- `src/pages/Login.tsx` — Real Firebase Auth, thêm đăng ký, xoá credential hints, error messages tiếng Việt
- `firestore.rules` — Role-based security rules (deployed)
- `index.html` — Sửa title, thêm meta description + favicon
- `.env.local` — Tạo mới với Firebase SDK config thật
- `.env.example` — Cập nhật đầy đủ biến Firebase

**Bugs đã sửa:** C1, C2, C3, C5, M1, M2, M3, M6

### 2026-05-08 — Session 2: Audit toàn bộ codebase
- Phát hiện 5 Critical, 10 Medium, 5 Low issues
- Tạo báo cáo audit chi tiết

### 2026-05-08 — Session 1: Khởi tạo docs
- Khởi tạo thư mục `_docs/`
