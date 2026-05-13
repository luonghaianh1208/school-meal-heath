import { Student, NutritionPlan, MealPortion, MealIntakeEval, DailyIntakeSummary, MealRecord, Alert, MealBreakdown, FoodConversion, FoodItem, SchoolFoodSummary } from '../types';

// Tính BMI
export function calculateBMI(weight: number, height: number): number {
  if (height === 0) return 0;
  const heightInMeters = height / 100;
  return Number((weight / (heightInMeters * heightInMeters)).toFixed(1));
}

// Trạng thái BMI dành cho trẻ em (đơn giản hoá theo chuẩn VN)
export function getBMIStatus(bmi: number, age: number): 'underweight' | 'normal' | 'overweight' | 'obese' {
  // Bảng phân loại đơn giản
  if (age < 10) {
    if (bmi < 14) return 'underweight';
    if (bmi >= 14 && bmi <= 19) return 'normal';
    if (bmi > 19 && bmi <= 21) return 'overweight';
    return 'obese';
  } else {
    // 10-15 tuổi
    if (bmi < 16) return 'underweight';
    if (bmi >= 16 && bmi <= 22) return 'normal';
    if (bmi > 22 && bmi <= 24) return 'overweight';
    return 'obese';
  }
}

// Tính BMR theo Mifflin-St Jeor
export function calculateDailyCalories(student: Student): NutritionPlan {
  let bmr = 0;
  if (student.gender === 'male') {
    bmr = (10 * student.weight) + (6.25 * student.height) - (5 * student.age) + 5;
  } else {
    bmr = (10 * student.weight) + (6.25 * student.height) - (5 * student.age) - 161;
  }

  let activityFactor = 1.2;
  if (student.activityLevel === 'medium') activityFactor = 1.55;
  if (student.activityLevel === 'high') activityFactor = 1.725;

  const tdee = Math.round(bmr * activityFactor);
  const { protein, carbs, fat } = calculateMacros(tdee);
  const bmi = calculateBMI(student.weight, student.height);
  
  return {
    studentId: student.id,
    dailyCalories: tdee,
    protein,
    carbs,
    fat,
    bmi,
    bmiStatus: getBMIStatus(bmi, student.age)
  };
}

export function calculateMacros(calories: number): { protein: number, carbs: number, fat: number } {
  const proteinCalories = calories * 0.15;
  const carbsCalories = calories * 0.55;
  const fatCalories = calories * 0.30;

  return {
    protein: Math.round(proteinCalories / 4),
    carbs: Math.round(carbsCalories / 4),
    fat: Math.round(fatCalories / 9)
  };
}

// Bữa trưa/tối tại trường = 35% TDEE
export function calculateMealPortion(plan: NutritionPlan, mealType: 'lunch' | 'dinner'): MealPortion {
  const targetCalories = Math.round(plan.dailyCalories * 0.35);
  let note = "Khẩu phần bình thường";

  if (plan.bmiStatus === 'underweight') {
    note = "Tăng thêm 1 vắt cơm hoặc thức ăn giàu đạm";
  } else if (plan.bmiStatus === 'overweight' || plan.bmiStatus === 'obese') {
    note = "Giảm 20% tinh bột, tăng cường rau xanh";
  }

  return {
    mealType,
    targetCalories,
    rice: Math.round((targetCalories * 0.55 / 4) * 1.5), // ước tính 1g carb chín
    protein: Math.round((targetCalories * 0.15 / 4) * 2), // ước tính thịt/cá
    vegetable: 120, // chuẩn ~120g rau/bữa
    soup: 200, // 200ml
    fruit: 80, // gram
    note
  };
}

// Đánh giá dựa trên phần trăm ăn được
export function evaluateMealIntake(eatLevel: number, plan: NutritionPlan, mealType: 'lunch' | 'dinner'): MealIntakeEval {
  const targetCalories = Math.round(plan.dailyCalories * 0.35);
  const actualCalories = Math.round(targetCalories * (eatLevel / 100));
  const percentAchieved = eatLevel;
  const deficit = targetCalories - actualCalories;

  let status: MealIntakeEval['status'] = 'good';
  let message = 'Tốt, trẻ đã ăn đủ khẩu phần.';

  if (eatLevel < 25) {
    status = 'very_low';
    message = 'Trẻ ăn quá ít, cần theo dõi sức khỏe.';
  } else if (eatLevel <= 50) {
    status = 'low';
    message = 'Trẻ ăn không đủ, có thể cần ăn bù vào bữa xế hoặc tối.';
  } else if (eatLevel < 100) {
    status = 'good';
    message = 'Trẻ ăn tương đối đủ.';
  }

  return {
    eatLevel,
    targetCalories,
    actualCalories,
    deficit,
    percentAchieved,
    status,
    message
  };
}

export function calcDailyIntake(records: MealRecord[], plan: NutritionPlan): DailyIntakeSummary {
  if (records.length === 0) {
    return {
      date: new Date().toISOString().split('T')[0],
      totalTargetCalories: plan.dailyCalories,
      totalActualCalories: 0,
      percentAchieved: 0,
      meals: [],
      recommendation: "Chưa có dữ liệu bữa ăn hôm nay."
    };
  }

  const meals = records.map(r => evaluateMealIntake(r.eatLevel, plan, r.mealType));
  const totalActualCalories = meals.reduce((acc, curr) => acc + curr.actualCalories, 0);
  // Assume target is 35% * 2 for lunch + dinner at school if there are 2 records, else just 1.
  const totalTargetCalories = meals.reduce((acc, curr) => acc + curr.targetCalories, 0);
  const percentAchieved = Math.round((totalActualCalories / totalTargetCalories) * 100);

  let recommendation = "Duy trì chế độ ăn hiện tại.";
  if (percentAchieved < 70) {
    recommendation = "Trẻ ăn thiếu nhiều so với nhu cầu, phụ huynh cần bổ sung thêm bữa phụ ở nhà.";
  }

  return {
    date: records[0].date,
    totalTargetCalories,
    totalActualCalories,
    percentAchieved,
    meals,
    recommendation
  };
}

export function checkHealthAlerts(studentId: string, records: MealRecord[]): Alert[] {
  const alerts: Alert[] = [];
  if (records.length === 0) return alerts;

  // Lấy 5 ngày gần nhất
  const sorted = [...records].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const recentDays = sorted.slice(0, 5);

  const avgRecent = recentDays.reduce((acc, curr) => acc + curr.eatLevel, 0) / recentDays.length;

  if (recentDays.length >= 3 && avgRecent < 50) {
    alerts.push({
      id: Math.random().toString(),
      studentId,
      studentName: '', // Sẽ map sau
      className: '',
      type: 'eating_decrease',
      message: `Học sinh ăn trung bình dưới 50% trong liên tục ${recentDays.length} bữa vừa qua.`,
      severity: 'high',
      createdAt: new Date(),
      isRead: false
    });
  }

  return alerts;
}

// ==========================================
// PHASE 2: Chia bữa + Quy đổi thực phẩm
// ==========================================

import { MEAL_RATIOS, FOOD_DATABASE, VEGETABLE_PER_MEAL, FRUIT_PER_MEAL, MILK_PER_MEAL } from './foodDatabase';

/**
 * Chia TDEE theo từng bữa, phụ thuộc boardingType:
 * - Nội trú (boarding): Sáng 30%, Trưa 40%, Tối 30%
 * - Bán trú (day): Chỉ bữa trưa = 40% TDEE
 */
export function splitDailyCaloriesByMeal(
  plan: NutritionPlan,
  boardingType: 'day' | 'boarding' = 'day'
): MealBreakdown[] {
  const ratios = MEAL_RATIOS[boardingType];

  return ratios.map(r => {
    const calories = Math.round(plan.dailyCalories * r.percent / 100);
    const macros = calculateMacros(calories);
    return {
      mealType: r.mealType,
      label: r.label,
      percentOfDaily: r.percent,
      calories,
      protein: macros.protein,
      carbs: macros.carbs,
      fat: macros.fat,
    };
  });
}

/**
 * Quy đổi macro (g protein, g carbs, g fat) → gram thực phẩm cụ thể
 * Dựa trên bảng dinh dưỡng Viện Dinh dưỡng VN
 */
export function convertMacrosToFood(meal: MealBreakdown): FoodConversion {
  const foods: FoodItem[] = [];

  // === CƠM / TINH BỘT ===
  // 100g cơm chứa 28.7g carbs → cần (carbs / 28.7 * 100)g cơm
  const riceInfo = FOOD_DATABASE.find(f => f.name === 'Cơm (gạo tẻ)')!;
  const riceGrams = Math.round(meal.carbs * 0.75 / riceInfo.carbsPer100g * 100);
  foods.push({ name: '🍚 Cơm (gạo tẻ)', category: 'carbs', amount: riceGrams, unit: 'g' });

  // === THỊT / CÁ (PROTEIN CHÍNH) ===
  // Chia protein: 50% thịt/cá, 20% trứng, 30% từ nguồn khác
  const meatProtein = meal.protein * 0.5;
  const meatInfo = FOOD_DATABASE.find(f => f.name === 'Thịt heo nạc')!;
  const meatGrams = Math.round(meatProtein / meatInfo.proteinPer100g * 100);
  foods.push({ name: '🥩 Thịt/Cá', category: 'protein', amount: meatGrams, unit: 'g' });

  // === TRỨNG ===
  const eggProtein = meal.protein * 0.2;
  const eggInfo = FOOD_DATABASE.find(f => f.name === 'Trứng gà')!;
  const eggGrams = Math.round(eggProtein / eggInfo.proteinPer100g * 100);
  foods.push({ name: '🥚 Trứng gà', category: 'protein', amount: eggGrams, unit: 'g' });

  // === ĐẬU PHỤ (protein phụ) ===
  const tofuProtein = meal.protein * 0.15;
  const tofuInfo = FOOD_DATABASE.find(f => f.name === 'Đậu phụ')!;
  const tofuGrams = Math.round(tofuProtein / tofuInfo.proteinPer100g * 100);
  foods.push({ name: '🫘 Đậu phụ', category: 'protein', amount: tofuGrams, unit: 'g' });

  // === RAU XANH (cố định theo khuyến nghị) ===
  foods.push({ name: '🥬 Rau xanh', category: 'vegetable', amount: VEGETABLE_PER_MEAL, unit: 'g' });

  // === DẦU ĂN ===
  const oilInfo = FOOD_DATABASE.find(f => f.name === 'Dầu ăn (thực vật)')!;
  const oilGrams = Math.round(meal.fat * 0.3 / oilInfo.fatPer100g * 100);
  foods.push({ name: '🫒 Dầu ăn', category: 'fat', amount: oilGrams, unit: 'g' });

  // === SỮA ===
  foods.push({ name: '🥛 Sữa tươi', category: 'dairy', amount: MILK_PER_MEAL, unit: 'ml' });

  // === TRÁI CÂY ===
  foods.push({ name: '🍎 Trái cây', category: 'fruit', amount: FRUIT_PER_MEAL, unit: 'g' });

  return {
    mealType: meal.mealType,
    label: meal.label,
    calories: meal.calories,
    foods,
  };
}

/**
 * Tính tổng lượng thực phẩm cần chuẩn bị cho toàn trường (hoặc theo lớp)
 * Trả về kết quả theo kg
 */
export function calculateSchoolFoodTotal(
  students: Student[],
  mealType: 'breakfast' | 'lunch' | 'dinner' = 'lunch'
): SchoolFoodSummary {
  const label = mealType === 'breakfast' ? 'Bữa sáng' : mealType === 'lunch' ? 'Bữa trưa' : 'Bữa tối';

  // Lọc HS theo loại hình phù hợp với bữa
  const eligibleStudents = students.filter(s => {
    const bt = s.boardingType || 'day';
    if (bt === 'boarding') return true; // nội trú ăn cả 3 bữa
    return mealType === 'lunch'; // bán trú chỉ ăn trưa
  });

  const dayStudents = eligibleStudents.filter(s => (s.boardingType || 'day') === 'day');
  const boardingStudents = eligibleStudents.filter(s => (s.boardingType || 'day') === 'boarding');

  // Aggregate food totals
  const foodTotals: Record<string, { totalGrams: number; unit: string }> = {};

  eligibleStudents.forEach(student => {
    const plan = calculateDailyCalories(student);
    const meals = splitDailyCaloriesByMeal(plan, student.boardingType || 'day');
    const targetMeal = meals.find(m => m.mealType === mealType);
    if (!targetMeal) return;

    const foodConversion = convertMacrosToFood(targetMeal);
    foodConversion.foods.forEach(food => {
      if (!foodTotals[food.name]) {
        foodTotals[food.name] = { totalGrams: 0, unit: food.unit };
      }
      foodTotals[food.name].totalGrams += food.amount;
    });
  });

  const foods = Object.entries(foodTotals).map(([name, data]) => ({
    name,
    totalAmountKg: Math.round(data.totalGrams / 100) / 10, // round to 0.1 kg
    unit: data.unit === 'ml' ? 'lít' : 'kg',
  }));

  return {
    mealType,
    label,
    totalStudents: eligibleStudents.length,
    dayStudents: dayStudents.length,
    boardingStudents: boardingStudents.length,
    foods,
  };
}
