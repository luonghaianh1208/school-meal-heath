// Chỉ hỗ trợ timestamp dummy ở client type
export type Timestamp = {
  seconds: number;
  nanoseconds: number;
  toDate: () => Date;
};

export interface AppUser {
  uid: string
  email: string
  displayName: string
  phone?: string                 // 10 số, dùng để liên lạc
  role: 'admin' | 'teacher'
  assignedClasses: string[]      // ["6A", "7B"] — lớp được giao (teacher)
  createdAt: Timestamp | Date
}

export interface Student {
  id: string
  name: string
  className: string        // "6A", "7B", etc.
  age: number
  gender: 'male' | 'female'
  weight: number           // kg
  height: number           // cm
  activityLevel: 'low' | 'medium' | 'high'
  boardingType: 'day' | 'boarding'  // bán trú | nội trú
  allergies: string[]      // ["đậu phộng", "hải sản"]
  healthStatus: 'normal' | 'underweight' | 'overweight' | 'monitored'
  createdAt: Timestamp | Date
  updatedAt: Timestamp | Date
}

export interface MealRecord {
  id: string
  studentId: string
  date: string             // "2024-01-15"
  mealType: 'lunch' | 'dinner'
  eatLevel: 0 | 25 | 50 | 75 | 100   // % ăn được
  note?: string
  recordedBy: string       // userId của giáo viên
  createdAt: Timestamp | Date
}

export interface DailyMenu {
  id: string
  date: string
  dishes: Dish[]
  totalCalories: number
  totalCost: number
}

export interface Dish {
  name: string
  calories: number         // kcal/khẩu phần
  protein: number          // g
  carbs: number            // g
  fat: number              // g
  costPerServing: number   // VNĐ
}

export interface NutritionPlan {
  studentId: string
  dailyCalories: number
  protein: number          // g/ngày
  carbs: number            // g/ngày
  fat: number              // g/ngày
  bmi: number
  bmiStatus: string
}

export interface Alert {
  id: string
  studentId: string
  studentName: string
  className: string
  type: 'eating_decrease' | 'underweight' | 'overweight' | 'absent_long'
  message: string
  severity: 'low' | 'medium' | 'high'
  createdAt: Timestamp | Date
  isRead: boolean
}

export interface MealPortion {
  mealType: 'lunch' | 'dinner'
  targetCalories: number        // kcal mục tiêu bữa này
  rice: number                  // gram cơm
  protein: number               // gram thịt/cá/trứng/đậu
  vegetable: number             // gram rau củ
  soup: number                  // ml canh
  fruit?: number                // gram trái cây (nếu có)
  note: string                  // ví dụ: "Phù hợp HS thiếu cân, tăng thêm 1 vắt cơm"
}

export interface MealIntakeEval {
  eatLevel: number              // % đã ăn (0-100)
  targetCalories: number        // kcal khuyến nghị bữa này
  actualCalories: number        // kcal thực tế nhận được
  deficit: number               // kcal thiếu (âm = thừa)
  percentAchieved: number       // % đạt mục tiêu
  status: 'good' | 'low' | 'very_low' | 'excess'
  message: string               // nhận xét ngắn cho giáo viên
}

export interface DailyIntakeSummary {
  date: string
  totalTargetCalories: number
  totalActualCalories: number
  percentAchieved: number
  meals: MealIntakeEval[]
  recommendation: string        // gợi ý bữa tiếp theo nếu thiếu calo
}

// Chia TDEE theo từng bữa
export interface MealBreakdown {
  mealType: 'breakfast' | 'lunch' | 'dinner'
  label: string                 // "Bữa sáng", "Bữa trưa", "Bữa tối"
  percentOfDaily: number        // 30, 40, 30
  calories: number              // kcal
  protein: number               // g
  carbs: number                 // g
  fat: number                   // g
}

// Quy đổi macro → thực phẩm cụ thể
export interface FoodItem {
  name: string                  // "Cơm (gạo tẻ)", "Thịt bò nạc"
  category: 'carbs' | 'protein' | 'fat' | 'vegetable' | 'dairy' | 'fruit'
  amount: number                // gram
  unit: string                  // "g", "ml"
}

export interface FoodConversion {
  mealType: 'breakfast' | 'lunch' | 'dinner'
  label: string
  calories: number
  foods: FoodItem[]
}

// Tổng hợp thực phẩm cho toàn trường / lớp
export interface SchoolFoodSummary {
  mealType: 'breakfast' | 'lunch' | 'dinner'
  label: string
  totalStudents: number
  dayStudents: number           // bán trú
  boardingStudents: number      // nội trú
  foods: {
    name: string
    totalAmountKg: number       // kg
    unit: string
  }[]
}
