import { useState } from 'react';
import { Card, Badge, Button, ProgressBar } from '../components/ui';
import { calculateBMI, getBMIStatus, calculateDailyCalories, splitDailyCaloriesByMeal, convertMacrosToFood } from '../utils/nutrition';
import { Activity, Scale, Ruler, CheckCircle2, Utensils, ChefHat } from 'lucide-react';
import { Student, MealBreakdown } from '../types';

export default function NutritionCalc() {
  const [age, setAge] = useState(11);
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [weight, setWeight] = useState(40);
  const [height, setHeight] = useState(145);
  const [activity, setActivity] = useState<'low' | 'medium' | 'high'>('medium');
  const [boardingType, setBoardingType] = useState<'day' | 'boarding'>('day');

  const dummyStudent: Student = {
    id: 'temp', name: 'Demo', className: 'N/A', age, gender, weight, height,
    activityLevel: activity, boardingType, allergies: [], healthStatus: 'normal',
    createdAt: new Date(), updatedAt: new Date()
  };

  const plan = calculateDailyCalories(dummyStudent);
  const mealBreakdowns = splitDailyCaloriesByMeal(plan, boardingType);

  return (
    <div className="flex flex-col h-full space-y-6 max-w-6xl">
      <header className="shrink-0 mb-2 border-b border-slate-100 pb-4">
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">Máy tính Dinh dưỡng</h2>
        <p className="text-slate-500 mt-1">Tính toán nhu cầu calo, chia bữa & quy đổi thực phẩm (Chuẩn Viện Dinh Dưỡng VN)</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Input Form — 2 cols */}
        <Card className="lg:col-span-2 space-y-5 h-fit bg-slate-50/50">
          <h3 className="font-semibold text-slate-900 flex items-center gap-2 border-b border-slate-200 pb-3">
            <Scale className="w-4 h-4 text-green-600" /> Thông tin học sinh
          </h3>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Tuổi</label>
              <input type="number" min="6" max="18" value={age} onChange={(e) => setAge(Number(e.target.value))} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Giới tính</label>
              <select value={gender} onChange={(e) => setGender(e.target.value as any)} className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white focus:ring-2 focus:ring-green-500 focus:outline-none">
                <option value="male">Nam</option>
                <option value="female">Nữ</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
             <div>
                <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-1.5"><Scale className="w-4 h-4 text-slate-400"/> Cân nặng (kg)</label>
                <div className="flex items-center gap-3">
                  <input type="range" min="20" max="150" value={weight} onChange={(e) => setWeight(Number(e.target.value))} className="flex-1 accent-green-600" />
                  <span className="w-10 text-right font-medium text-slate-900">{weight}</span>
                </div>
             </div>
             <div>
                <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-1.5"><Ruler className="w-4 h-4 text-slate-400"/> Chiều cao (cm)</label>
                <div className="flex items-center gap-3">
                  <input type="range" min="110" max="220" value={height} onChange={(e) => setHeight(Number(e.target.value))} className="flex-1 accent-green-600" />
                  <span className="w-10 text-right font-medium text-slate-900">{height}</span>
                </div>
             </div>
          </div>

          <div>
             <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-1.5"><Activity className="w-4 h-4 text-slate-400"/> Mức vận động</label>
             <div className="grid grid-cols-3 gap-2">
                {(['low', 'medium', 'high'] as const).map((level) => (
                    <button 
                       key={level}
                       onClick={() => setActivity(level)}
                       className={`py-2 px-1 rounded-lg text-xs font-medium border transition-colors ${activity === level ? 'bg-green-50 text-green-700 border-green-200 ring-1 ring-green-500' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                    >
                        {level === 'low' ? 'Ít vận động' : level === 'medium' ? 'Vừa phải' : 'Vận động nhiều'}
                    </button>
                ))}
             </div>
          </div>

          {/* Boarding Type Toggle */}
          <div>
             <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-1.5">
               <Utensils className="w-4 h-4 text-slate-400"/> Loại hình
             </label>
             <div className="grid grid-cols-2 gap-2">
                <button 
                  onClick={() => setBoardingType('day')}
                  className={`py-2.5 rounded-lg text-sm font-medium border transition-all ${boardingType === 'day' ? 'bg-amber-50 text-amber-700 border-amber-200 ring-1 ring-amber-500 shadow-sm' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                >
                  🏫 Bán trú
                </button>
                <button 
                  onClick={() => setBoardingType('boarding')}
                  className={`py-2.5 rounded-lg text-sm font-medium border transition-all ${boardingType === 'boarding' ? 'bg-emerald-50 text-emerald-700 border-emerald-200 ring-1 ring-emerald-500 shadow-sm' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                >
                  🏠 Nội trú
                </button>
             </div>
             <p className="text-xs text-slate-400 mt-1.5">
               {boardingType === 'day' ? 'Ăn 1 bữa trưa tại trường' : 'Ăn 3 bữa (sáng, trưa, tối) tại trường'}
             </p>
          </div>
        </Card>

        {/* Results — 3 cols */}
        <div className="lg:col-span-3 space-y-6">
            {/* TDEE Summary */}
            <Card className="border-t-4 border-t-green-500 shadow-md">
                <div className="flex justify-between items-start mb-5 border-b border-slate-100 pb-4">
                    <div>
                        <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">Tổng năng lượng (TDEE)</p>
                        <p className="text-4xl font-bold text-slate-900 mt-1">{plan.dailyCalories} <span className="text-xl text-slate-500 font-normal">kcal/ngày</span></p>
                    </div>
                    <div className="text-right">
                        <p className="text-xs text-slate-500 uppercase font-medium mb-1 relative top-0.5">CHỈ SỐ BMI</p>
                        <Badge severity={plan.bmiStatus === 'underweight' ? 'medium' : plan.bmiStatus === 'overweight' ? 'high' : 'success'} className="text-sm py-1">
                            {plan.bmi} - {plan.bmiStatus === 'underweight' ? 'Nhẹ cân' : plan.bmiStatus === 'overweight' ? 'Thừa cân' : plan.bmiStatus === 'obese' ? 'Béo phì' : 'Bình thường'}
                        </Badge>
                    </div>
                </div>

                <div className="space-y-3 mb-4">
                    <div>
                        <div className="flex justify-between text-sm mb-1.5 font-medium">
                            <span className="text-slate-700">Protein (15%)</span>
                            <span className="text-slate-900">{plan.protein}g</span>
                        </div>
                        <ProgressBar progress={15} colorClass="bg-red-400" />
                    </div>
                    <div>
                        <div className="flex justify-between text-sm mb-1.5 font-medium">
                            <span className="text-slate-700">Carbohydrate (55%)</span>
                            <span className="text-slate-900">{plan.carbs}g</span>
                        </div>
                        <ProgressBar progress={55} colorClass="bg-amber-400" />
                    </div>
                    <div>
                        <div className="flex justify-between text-sm mb-1.5 font-medium">
                            <span className="text-slate-700">Fat (30%)</span>
                            <span className="text-slate-900">{plan.fat}g</span>
                        </div>
                        <ProgressBar progress={30} colorClass="bg-yellow-400" />
                    </div>
                </div>
            </Card>

            {/* Chia bữa Cards */}
            <div>
              <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                <ChefHat className="w-4 h-4 text-green-600" />
                Phân chia theo bữa ({boardingType === 'day' ? 'Bán trú — 1 bữa' : 'Nội trú — 3 bữa'})
              </h3>
              <div className={`grid gap-4 ${mealBreakdowns.length === 1 ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-3'}`}>
                {mealBreakdowns.map((meal) => (
                  <MealCard key={meal.mealType} meal={meal} />
                ))}
              </div>
            </div>
        </div>
      </div>
    </div>
  );
}

function MealCard({ meal }: { meal: MealBreakdown }) {
  const foodConversion = convertMacrosToFood(meal);
  const mealColors = {
    breakfast: { bg: 'bg-orange-50/60', border: 'border-orange-100', accent: 'text-orange-700', badge: 'bg-orange-100 text-orange-700' },
    lunch: { bg: 'bg-green-50/60', border: 'border-green-100', accent: 'text-green-700', badge: 'bg-green-100 text-green-700' },
    dinner: { bg: 'bg-blue-50/60', border: 'border-blue-100', accent: 'text-blue-700', badge: 'bg-blue-100 text-blue-700' },
  };
  const colors = mealColors[meal.mealType];

  return (
    <Card className={`${colors.bg} border ${colors.border} space-y-3`}>
      <div className="flex justify-between items-center pb-2 border-b border-slate-200/50">
        <div>
          <h4 className={`font-bold ${colors.accent}`}>{meal.label}</h4>
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${colors.badge}`}>{meal.percentOfDaily}% TDEE</span>
        </div>
        <span className={`text-xl font-black ${colors.accent}`}>{meal.calories} <span className="text-xs font-medium">kcal</span></span>
      </div>

      {/* Macro breakdown */}
      <div className="grid grid-cols-3 gap-2 text-center text-xs">
        <div className="bg-white/70 rounded-lg p-2">
          <p className="font-bold text-red-600">{meal.protein}g</p>
          <p className="text-slate-500">Protein</p>
        </div>
        <div className="bg-white/70 rounded-lg p-2">
          <p className="font-bold text-amber-600">{meal.carbs}g</p>
          <p className="text-slate-500">Carbs</p>
        </div>
        <div className="bg-white/70 rounded-lg p-2">
          <p className="font-bold text-yellow-600">{meal.fat}g</p>
          <p className="text-slate-500">Fat</p>
        </div>
      </div>

      {/* Food conversion table */}
      <div className="space-y-1.5">
        <p className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Quy đổi thực phẩm</p>
        {foodConversion.foods.map((food) => (
          <div key={food.name} className="flex justify-between items-center text-sm bg-white/60 px-2.5 py-1.5 rounded-lg">
            <span className="text-slate-700">{food.name}</span>
            <span className="font-bold text-slate-900">{food.amount}{food.unit}</span>
          </div>
        ))}
      </div>
    </Card>
  );
}
