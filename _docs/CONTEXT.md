# Current Context

## Trạng thái hiện tại (sau Session 4 — 2026-05-10)
- ✅ **Firebase Auth thật** — đăng nhập/đăng ký qua Firebase Auth SDK
- ✅ **Firestore thật** — students, mealRecords, alerts đều dùng Firestore realtime
- ✅ **Dữ liệu đồng bộ** — eatLevel dạng number (0|25|50|75|100) trong cả DB lẫn code
- ✅ **Dynamic class list** — MealTracking lấy danh sách lớp từ data thật, không hardcode
- ✅ **Reports data thật** — Reports.tsx đã sử dụng data Firestore, so sánh eatLevel đúng format
- ✅ **Phân quyền role** — admin (BGH) / teacher (Giáo viên). User đầu tiên tự động = admin
- ✅ **Build passing** — `npx vite build` thành công
- ✅ **Firestore rules deployed** — role-based security trên production
- ⚠️ Gemini API key vẫn ở client-side (tạm chấp nhận)
- ⚠️ Collection `users` trống — sẽ tạo khi user đăng nhập lần đầu trên app

## Firebase DB Status
- **Project:** schoolmealheath
- **Auth:** 1 user (luonghaianh1208@gmail.com)
- **Firestore collections:** students (5 docs), mealRecords (10 docs), alerts (2 docs)
- **Data đã migrate:** eatLevel string → number

## Ưu tiên tiếp theo
1. Deploy lên Netlify và test login/register thật
2. Phase 2: Hoàn thiện features (Reports AI, fix AI records, Mobile nav)
3. Phase 3: Export PDF/Excel, Error boundaries, Loading states

## Các file được phép chỉnh sửa
Mọi file trong `src/` đều có thể sửa. Không sửa `firebase.json`, `vite.config.ts` trừ khi cần thiết.
