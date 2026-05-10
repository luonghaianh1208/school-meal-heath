# Code Rules & Patterns

## Code Standards
- Dùng TypeScript cho toàn bộ project, hạn chế dùng `any`. Định nghĩa các kiểu dữ liệu chung trong `src/types/index.ts`.
- Sử dụng Functional Components và Hooks. Không sử dụng Class Components.
- Không tự ý thêm thư viện ngoài trừ khi thật sự cần thiết và được yêu cầu.

## UX/UI Patterns
- Dùng Tailwind CSS làm công cụ styling chính. Không viết file CSS riêng trừ trường hợp cực kỳ đặc biệt (như global base trong `index.css`).
- Giao diện cần tuân thủ cấu trúc của `Layout` và sử dụng `lucide-react` cho icons, `recharts` cho biểu đồ thống kê.
- Đảm bảo thiết kế hiện đại, bảng màu cao cấp, giao diện sạch và có trạng thái phản hồi tốt (hover, focus, active).
- Áp dụng Framer Motion (`motion`) nếu cần tạo các điểm nhấn hoạt ảnh (micro-animations, transitions) mượt mà.

## State Management & Logic
- Tách biệt logic gọi API / Database ra khỏi UI component bằng cách sử dụng custom hooks (như `useAuth`, `useStudents`, `useMealRecords`).
- Xử lý lỗi đầy đủ khi gọi API / DB, và hiển thị thông báo lỗi cho người dùng thông qua `ToastProvider`.
## Modal
- Mỗi modal/popup/dialog trong dự án PHẢI dùng ReactDOM.createPortal để render ra document.body. KHÔNG dùng conditional rendering để show modal inline.
