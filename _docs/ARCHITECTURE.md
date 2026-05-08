# System Architecture

## Cấu trúc tổng thể
Ứng dụng được xây dựng theo kiến trúc Client-side Rendering (CSR) với React, kết nối trực tiếp đến Firebase để lưu trữ dữ liệu và xác thực. Các chức năng phân tích AI được thực hiện thông qua Google Gemini API.

## Tổ chức thư mục (Directory Structure)
- `src/components/`: Chứa các component giao diện dùng chung (UI components, Layout, ProtectedRoute).
- `src/pages/`: Các trang chính của ứng dụng (Dashboard, Login, Students, MealTracking, NutritionCalc, AIInsights, Reports).
- `src/lib/`: Cấu hình và tích hợp dịch vụ bên ngoài (firebase.ts, gemini.ts).
- `src/hooks/`: Custom React hooks để quản lý state và logic nghiệp vụ (useAuth, useStudents, useMealRecords).
- `src/utils/`: Các hàm tiện ích (logic tính toán dinh dưỡng `nutrition.ts`, dữ liệu mẫu `seedData.ts`).
- `src/types/`: Định nghĩa kiểu dữ liệu TypeScript dùng chung toàn dự án (`index.ts`).

## Luồng dữ liệu (Data Flow)
1. **Authentication:** Người dùng đăng nhập qua Firebase Auth.
2. **Database:** Dữ liệu học sinh, bữa ăn được lưu tại Firebase Firestore. Custom hooks sẽ lắng nghe thay đổi (realtime) từ Firestore.
3. **AI Integration:** Dữ liệu bữa ăn và dinh dưỡng được gửi lên Google Gemini API để lấy phân tích, đánh giá, và đề xuất.
