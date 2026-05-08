# Current Context

## Trạng thái hiện tại (sau Session 3 — 2026-05-08)
- ✅ **Firebase Auth thật** — đăng nhập/đăng ký qua Firebase Auth SDK
- ✅ **Firestore thật** — students, mealRecords, alerts đều dùng Firestore realtime
- ✅ **Phân quyền role** — admin (BGH) / teacher (Giáo viên). User đầu tiên tự động = admin
- ✅ **Build passing** — `npx vite build` thành công
- ✅ **Firestore rules deployed** — role-based security trên production
- ⚠️ Gemini API key vẫn ở client-side (tạm chấp nhận, user sẽ thêm vào Netlify env)

## Ưu tiên tiếp theo
1. Deploy lên Netlify và test login/register thật
2. Seed demo data sau khi tạo account đầu tiên
3. Phase 2: Hoàn thiện features (form CRUD, Reports data thật, fix AI records)

## Các file được phép chỉnh sửa
Mọi file trong `src/` đều có thể sửa. Không sửa `firebase.json`, `vite.config.ts` trừ khi cần thiết.
