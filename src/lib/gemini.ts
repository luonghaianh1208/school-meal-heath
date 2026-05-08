import { GoogleGenAI } from '@google/genai';
import { Student, MealRecord, NutritionPlan } from '../types';

let genai: GoogleGenAI | null = null;

export function getGemini() {
  if (!genai) {
    let key = import.meta.env.VITE_GEMINI_API_KEY;
    // Fallback to process.env for standard AI Studio setup
    if (!key && typeof process !== 'undefined' && process.env) {
      key = process.env.GEMINI_API_KEY;
    }
    
    if (!key) {
      console.warn("GEMINI_API_KEY is not set. AI features might fail.");
    }
    genai = new GoogleGenAI({ apiKey: key || 'DUMMY' });
  }
  return genai;
}

// Hàm dọn dẹp kết quả từ Gemini, xóa mọi backtick code block và khoảng trắng đầu dòng
function cleanGeminiResponse(text: string): string {
  if (!text) return '';
  // Xóa các thẻ markdown code block (ví dụ: ```html, ```markdown, ```)
  let cleaned = text.replace(/```[a-z]*\n/gi, '').replace(/```/g, '');
  // Cắt bỏ khoảng trắng thụt lề (từ 4 dấu cách trở lên) ở đầu mỗi dòng để tránh bị hiểu là Indented Code Block
  cleaned = cleaned.replace(/^ {4,}/gm, '');
  return cleaned.trim();
}

export async function analyzeClassHealth(students: Student[], records: MealRecord[], className: string): Promise<string> {
  const ai = getGemini();
  const n = students.length;
  // Calculate average BMI
  const totalBmi = students.reduce((acc, st) => {
    const bmi = st.weight / ((st.height / 100) ** 2);
    return acc + bmi;
  }, 0);
  const avgBmi = n ? (totalBmi / n).toFixed(1) : 0;

  // % ăn đủ bữa tuần này (Mocked calculation for simplicity based on records)
  // Trong môi trường production, cần group theo ngày
  const avgEatLevel = records.length ? records.reduce((acc, r) => acc + r.eatLevel, 0) / records.length : 0;
  
  const monitoredStudents = students.filter(s => s.healthStatus !== 'normal');
  const monitoredList = monitoredStudents.map(s => `${s.name} (${s.healthStatus})`).join(", ");

  const prompt = `Bạn là chuyên gia dinh dưỡng học đường. Dựa trên dữ liệu sau của lớp ${className}:
- Số học sinh: ${n}
- Trung bình BMI: ${avgBmi}
- Mức độ ăn trung bình: ${avgEatLevel.toFixed(0)}%
- Học sinh cần chú ý: ${monitoredList || "Không có"}

Hãy đưa ra nhận xét ngắn gọn (3-4 câu) và 3 khuyến nghị cụ thể cho giáo viên. Bám sát vào dinh dưỡng tiểu học ở Việt Nam.
QUAN TRỌNG: Trả về dưới dạng Markdown thuần túy (KHÔNG bọc trong \`\`\`html hay \`\`\`markdown). KHÔNG thụt lề (indent) các dòng. Sử dụng thẻ HTML để tô màu: in đậm và màu xanh lá (<strong class="text-emerald-600">...</strong>) cho những điều tích cực/đạt chuẩn, in đậm và màu đỏ (<strong class="text-rose-600">...</strong>) cho các cảnh báo/vấn đề cần chú ý.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
    });
    return cleanGeminiResponse(response.text || '');
  } catch (err) {
    console.error("Gemini Error: ", err);
    return "Lỗi phân tích AI. Vui lòng kiểm tra API Key và kết nối.";
  }
}

export async function suggestWeeklyMenu(targetCalories: number, allergies: string[]): Promise<string> {
  const ai = getGemini();
  
  const prompt = `Gợi ý thực đơn 5 ngày cho học sinh tiểu học/THCS tại Việt Nam với:
- Mục tiêu calo mỗi bữa trưa: ${Math.round(targetCalories)} kcal
- Dị ứng cần tránh: ${allergies.join(", ") || "Không có"}
- Ưu tiên: nguyên liệu phổ biến, dễ nấu, giá hợp lý (<25.000đ/suất)

Format BẮT BUỘC: Sử dụng Markdown Bảng chuẩn GFM (Standard Markdown Table). Ví dụ:
| Ngày | Món ăn | Lượng Calo | Lưu ý |
|---|---|---|---|
| Thứ 2 | Cơm trắng, Thịt kho, Canh bí | 550 | ... |

QUAN TRỌNG: 
- Trả về dưới dạng Markdown thuần túy (KHÔNG bọc trong \`\`\`html hay \`\`\`markdown). 
- KHÔNG thụt lề (indent) bất kỳ dòng nào, đặc biệt là bảng biểu. Ký tự | của bảng phải nằm ở sát lề trái.
- Sử dụng thẻ HTML để tô màu: in đậm và màu xanh lá (<strong class="text-emerald-600">...</strong>) cho những điểm tốt/ưu điểm dinh dưỡng, in đậm và đỏ (<strong class="text-rose-600">...</strong>) cho các cảnh báo dị ứng hoặc lưu ý quan trọng.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
    });
    return cleanGeminiResponse(response.text || '');
  } catch (err) {
    console.error("Gemini Error: ", err);
    return "Lỗi gọi AI.";
  }
}

export async function generateClassReport(className: string, weekData: any): Promise<string> {
  const ai = getGemini();
  
  const prompt = `Tạo báo cáo tóm tắt tuần cho lớp ${className}:
${JSON.stringify(weekData)}

Viết báo cáo ngắn gọn dạng văn xuôi, phù hợp gửi cho ban giám hiệu.
Gồm: tình hình ăn uống chung, học sinh nổi bật (tốt/cần theo dõi), đề xuất.
QUAN TRỌNG: Trả về dưới dạng Markdown thuần túy (KHÔNG bọc trong \`\`\`html hay \`\`\`markdown). KHÔNG thụt lề (indent) các dòng. BẮT BUỘC sử dụng thẻ HTML để nhấn mạnh: in đậm màu xanh lá (<strong class="text-emerald-600">...</strong>) cho những tiến bộ, tích cực; in đậm màu đỏ (<strong class="text-rose-600">...</strong>) cho cảnh báo hoặc chỉ số kém.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
    });
    return cleanGeminiResponse(response.text || '');
  } catch (err) {
    console.error("Gemini Error: ", err);
    return "Lỗi gọi AI.";
  }
}
