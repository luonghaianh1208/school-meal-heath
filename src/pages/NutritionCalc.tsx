import { useState } from 'react';
import { Card, Badge, Button, ProgressBar } from '../components/ui';
import { calculateBMI, getBMIStatus, calculateDailyCalories, calculateMealPortion } from '../utils/nutrition';
import { Activity, Scale, Ruler, CheckCircle2 } from 'lucide-react';
import { Student } from '../types';

export default function NutritionCalc() {
  const [age, setAge] = useState(11);
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [weight, setWeight] = useState(40);
  const [height, setHeight] = useState(145);
  const [activity, setActivity] = useState<'low' | 'medium' | 'high'>('medium');

  // Create a dummy student to use existing logic
  const dummyStudent: Student = {
    id: 'temp', name: 'Demo', className: 'N/A', age, gender, weight, height, activityLevel: activity,
    allergies: [], healthStatus: 'normal', createdAt: new Date(), updatedAt: new Date()
  };

  const plan = calculateDailyCalories(dummyStudent);
  const lunchPortion = calculateMealPortion(plan, 'lunch');

  return (
    <div className="flex flex-col h-full space-y-6 max-w-5xl">
      <header className="shrink-0 mb-2 border-b border-slate-100 pb-4">
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">Máy tính Dinh dưỡng</h2>
        <p className="text-slate-500 mt-1">Tính toán nhu cầu calo & khẩu phần chi tiết (Chuẩn Viện Dinh Dưỡng VN)</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Input Form */}
        <Card className="space-y-6 h-fit bg-slate-50/50">
          <h3 className="font-semibold text-slate-900 flex items-center gap-2 border-b border-slate-200 pb-3">Phân tích học sinh</h3>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Tuổi</label>
              <input type="number" min="6" max="15" value={age} onChange={(e) => setAge(Number(e.target.value))} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-green-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Giới tính</label>
              <select value={gender} onChange={(e) => setGender(e.target.value as any)} className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white focus:ring-2 focus:ring-green-500">
                <option value="male">Nam</option>
                <option value="female">Nữ</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
             <div>
                <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-1.5"><Scale className="w-4 h-4 text-slate-400"/> Cân nặng (kg)</label>
                <div className="flex items-center gap-3">
                  <input type="range" min="20" max="80" value={weight} onChange={(e) => setWeight(Number(e.target.value))} className="flex-1 accent-green-600" />
                  <span className="w-10 text-right font-medium text-slate-900">{weight}</span>
                </div>
             </div>
             <div>
                <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-1.5"><Ruler className="w-4 h-4 text-slate-400"/> Chiều cao (cm)</label>
                <div className="flex items-center gap-3">
                  <input type="range" min="110" max="180" value={height} onChange={(e) => setHeight(Number(e.target.value))} className="flex-1 accent-green-600" />
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
        </Card>

        {/* Results */}
        <div className="space-y-6">
            <Card className="border-t-4 border-t-green-500 shadow-md">
                <div className="flex justify-between items-start mb-6 border-b border-slate-100 pb-4">
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

                <div className="space-y-4 mb-6">
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

            <Card className="bg-green-50/50 border border-green-100">
               <div className="flex justify-between items-center mb-4">
                  <h3 className="font-semibold text-green-900">Khẩu phần bữa trưa (35%)</h3>
                  <span className="text-lg font-bold text-green-700">{lunchPortion.targetCalories} kcal</span>
               </div>
               
               <div className="grid grid-cols-2 gap-y-3 gap-x-6 text-sm text-slate-700 mb-4">
                  <div className="flex justify-between border-b border-green-200/50 pb-1">
                      <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-green-500" /> Cơm (Tinh bột)</span>
                      <span className="font-medium text-slate-900">{lunchPortion.rice}g</span>
                  </div>
                  <div className="flex justify-between border-b border-green-200/50 pb-1">
                      <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-green-500" /> Thịt/Cá (Đạm)</span>
                      <span className="font-medium text-slate-900">{lunchPortion.protein}g</span>
                  </div>
                  <div className="flex justify-between border-b border-green-200/50 pb-1">
                      <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-green-500" /> Rau củ</span>
                      <span className="font-medium text-slate-900">{lunchPortion.vegetable}g</span>
                  </div>
                  <div className="flex justify-between border-b border-green-200/50 pb-1">
                      <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-green-500" /> Canh</span>
                      <span className="font-medium text-slate-900">{lunchPortion.soup}ml</span>
                  </div>
               </div>

               <div className="bg-white p-3 rounded-lg border border-green-100/50 text-sm flex gap-2">
                  <span className="font-semibold text-amber-600">Đề xuất:</span>
                  <span className="text-slate-600">{lunchPortion.note}</span>
               </div>
            </Card>
        </div>
      </div>
    </div>
  );
}
