/**
 * Bảng quy đổi thực phẩm Việt Nam
 * Nguồn: Viện Dinh dưỡng Quốc gia Việt Nam
 * Đơn vị: per 100g thực phẩm ăn được
 */

export interface FoodNutritionInfo {
  name: string;
  category: 'carbs' | 'protein' | 'fat' | 'vegetable' | 'dairy' | 'fruit';
  caloriesPer100g: number;
  proteinPer100g: number;   // g
  carbsPer100g: number;     // g
  fatPer100g: number;       // g
  icon: string;             // emoji
}

// Bảng thực phẩm phổ biến trong bữa ăn học đường VN
export const FOOD_DATABASE: FoodNutritionInfo[] = [
  // === TINH BỘT ===
  { name: 'Cơm (gạo tẻ)', category: 'carbs', caloriesPer100g: 130, proteinPer100g: 2.6, carbsPer100g: 28.7, fatPer100g: 0.3, icon: '🍚' },
  { name: 'Phở / Bún', category: 'carbs', caloriesPer100g: 110, proteinPer100g: 3.4, carbsPer100g: 23.5, fatPer100g: 0.4, icon: '🍜' },

  // === PROTEIN ===
  { name: 'Thịt bò nạc', category: 'protein', caloriesPer100g: 121, proteinPer100g: 21.0, carbsPer100g: 0, fatPer100g: 3.8, icon: '🥩' },
  { name: 'Thịt gà (ức)', category: 'protein', caloriesPer100g: 110, proteinPer100g: 23.1, carbsPer100g: 0, fatPer100g: 1.2, icon: '🍗' },
  { name: 'Thịt heo nạc', category: 'protein', caloriesPer100g: 139, proteinPer100g: 19.0, carbsPer100g: 0, fatPer100g: 7.0, icon: '🥓' },
  { name: 'Cá (trung bình)', category: 'protein', caloriesPer100g: 96, proteinPer100g: 18.2, carbsPer100g: 0, fatPer100g: 2.1, icon: '🐟' },
  { name: 'Trứng gà', category: 'protein', caloriesPer100g: 155, proteinPer100g: 12.6, carbsPer100g: 0.7, fatPer100g: 11.3, icon: '🥚' },
  { name: 'Đậu phụ', category: 'protein', caloriesPer100g: 76, proteinPer100g: 8.1, carbsPer100g: 1.9, fatPer100g: 4.2, icon: '🫘' },

  // === CHẤT BÉO ===
  { name: 'Dầu ăn (thực vật)', category: 'fat', caloriesPer100g: 884, proteinPer100g: 0, carbsPer100g: 0, fatPer100g: 100, icon: '🫒' },

  // === RAU CỦ ===
  { name: 'Rau xanh (trung bình)', category: 'vegetable', caloriesPer100g: 25, proteinPer100g: 2.0, carbsPer100g: 3.5, fatPer100g: 0.3, icon: '🥬' },

  // === SỮA ===
  { name: 'Sữa tươi', category: 'dairy', caloriesPer100g: 61, proteinPer100g: 3.2, carbsPer100g: 4.8, fatPer100g: 3.3, icon: '🥛' },

  // === TRÁI CÂY ===
  { name: 'Trái cây (trung bình)', category: 'fruit', caloriesPer100g: 50, proteinPer100g: 0.5, carbsPer100g: 12, fatPer100g: 0.2, icon: '🍎' },
];

// Tỷ lệ chia bữa theo loại hình
// Nội trú: 3 bữa (sáng 30%, trưa 40%, tối 30%)
// Bán trú: chỉ bữa trưa (100% bữa tại trường = 40% TDEE)
export const MEAL_RATIOS = {
  boarding: [
    { mealType: 'breakfast' as const, label: 'Bữa sáng', percent: 30 },
    { mealType: 'lunch' as const, label: 'Bữa trưa', percent: 40 },
    { mealType: 'dinner' as const, label: 'Bữa tối', percent: 30 },
  ],
  day: [
    { mealType: 'lunch' as const, label: 'Bữa trưa', percent: 40 },
  ],
};

/**
 * Cấu trúc bữa ăn mẫu (tỷ lệ macro phân bổ cho từng loại thực phẩm)
 * Mỗi bữa bao gồm: cơm + thịt/cá + rau + canh + trái cây (+ sữa/trứng)
 */
export const MEAL_FOOD_TEMPLATE = {
  breakfast: {
    label: 'Bữa sáng',
    foods: [
      { name: 'Phở / Bún', carbsRatio: 0.8, proteinRatio: 0.3, icon: '🍜' },
      { name: 'Thịt/Cá (sáng)', carbsRatio: 0, proteinRatio: 0.4, icon: '🥩' },
      { name: 'Rau xanh', carbsRatio: 0.1, proteinRatio: 0, icon: '🥬' },
      { name: 'Sữa tươi', carbsRatio: 0.1, proteinRatio: 0.3, icon: '🥛' },
    ],
  },
  lunch: {
    label: 'Bữa trưa',
    foods: [
      { name: 'Cơm (gạo tẻ)', carbsRatio: 0.7, proteinRatio: 0, icon: '🍚' },
      { name: 'Thịt/Cá (trưa)', carbsRatio: 0, proteinRatio: 0.55, icon: '🥩' },
      { name: 'Trứng gà', carbsRatio: 0, proteinRatio: 0.15, icon: '🥚' },
      { name: 'Rau xanh', carbsRatio: 0.15, proteinRatio: 0.05, icon: '🥬' },
      { name: 'Canh (nước)', carbsRatio: 0.05, proteinRatio: 0.05, icon: '🥣' },
      { name: 'Trái cây', carbsRatio: 0.1, proteinRatio: 0, icon: '🍎' },
    ],
  },
  dinner: {
    label: 'Bữa tối',
    foods: [
      { name: 'Cơm (gạo tẻ)', carbsRatio: 0.7, proteinRatio: 0, icon: '🍚' },
      { name: 'Thịt/Cá (tối)', carbsRatio: 0, proteinRatio: 0.55, icon: '🥩' },
      { name: 'Trứng gà', carbsRatio: 0, proteinRatio: 0.15, icon: '🥚' },
      { name: 'Rau xanh', carbsRatio: 0.15, proteinRatio: 0.05, icon: '🥬' },
      { name: 'Canh (nước)', carbsRatio: 0.05, proteinRatio: 0.05, icon: '🥣' },
      { name: 'Sữa tươi', carbsRatio: 0.1, proteinRatio: 0.2, icon: '🥛' },
    ],
  },
};

/**
 * Hệ số quy đổi: macro (g) → thực phẩm (g)
 * VD: 1g protein cần ~4.8g thịt bò nạc (vì 100g thịt bò có 21g protein)
 */
export function getConversionFactor(foodName: string): FoodNutritionInfo | undefined {
  return FOOD_DATABASE.find(f => f.name === foodName);
}

// Lượng rau chuẩn mỗi bữa (cố định theo khuyến nghị)
export const VEGETABLE_PER_MEAL = 120; // gram
export const SOUP_PER_MEAL = 200;      // ml
export const FRUIT_PER_MEAL = 80;      // gram
export const MILK_PER_MEAL = 200;      // ml (1 hộp)
