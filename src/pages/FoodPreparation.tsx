import { useState, useMemo } from 'react';
import { Card, Badge, Button } from '../components/ui';
import { useStudents } from '../hooks/useStudents';
import { calculateSchoolFoodTotal, calculateDailyCalories, splitDailyCaloriesByMeal } from '../utils/nutrition';
import { ChefHat, Users, ShoppingCart, Filter, TrendingUp } from 'lucide-react';

type MealFilter = 'breakfast' | 'lunch' | 'dinner';

export default function FoodPreparation() {
  const { students, loading } = useStudents();
  const [selectedMeal, setSelectedMeal] = useState<MealFilter>('lunch');
  const [selectedClass, setSelectedClass] = useState<string>('all');

  const availableClasses = useMemo(() =>
    Array.from(new Set(students.map(s => s.className))).sort(),
    [students]
  );

  const filteredStudents = useMemo(() => {
    if (selectedClass === 'all') return students;
    return students.filter(s => s.className === selectedClass);
  }, [students, selectedClass]);

  const dayCount = filteredStudents.filter(s => (s.boardingType || 'day') === 'day').length;
  const boardingCount = filteredStudents.filter(s => (s.boardingType || 'day') === 'boarding').length;

  const summary = useMemo(() =>
    calculateSchoolFoodTotal(filteredStudents, selectedMeal),
    [filteredStudents, selectedMeal]
  );

  // Total calories for this meal
  const totalCalories = useMemo(() => {
    return filteredStudents.reduce((acc, student) => {
      const bt = student.boardingType || 'day';
      if (bt === 'day' && selectedMeal !== 'lunch') return acc;
      const plan = calculateDailyCalories(student);
      const meals = splitDailyCaloriesByMeal(plan, bt);
      const targetMeal = meals.find(m => m.mealType === selectedMeal);
      return acc + (targetMeal?.calories || 0);
    }, 0);
  }, [filteredStudents, selectedMeal]);

  // Class-level breakdown
  const classBreakdown = useMemo(() => {
    return availableClasses.map(cls => {
      const classStudents = filteredStudents.filter(s => s.className === cls);
      const classSummary = calculateSchoolFoodTotal(classStudents, selectedMeal);
      return { className: cls, ...classSummary };
    }).filter(c => c.totalStudents > 0);
  }, [availableClasses, filteredStudents, selectedMeal]);

  if (loading) return (
    <div className="p-8 animate-pulse space-y-4">
      <div className="h-32 bg-slate-200 rounded-xl"></div>
      <div className="h-64 bg-slate-200 rounded-xl"></div>
    </div>
  );

  const mealBtns: { key: MealFilter; label: string; emoji: string }[] = [
    { key: 'breakfast', label: 'Bữa sáng', emoji: '🌅' },
    { key: 'lunch', label: 'Bữa trưa', emoji: '☀️' },
    { key: 'dinner', label: 'Bữa tối', emoji: '🌙' },
  ];

  return (
    <div className="space-y-6 max-w-7xl">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <ShoppingCart className="w-6 h-6 text-green-600" />
            Chuẩn bị Thực phẩm
          </h2>
          <p className="text-slate-500 mt-1">Tổng hợp lượng thực phẩm cần mua cho toàn trường</p>
        </div>
        <div className="flex gap-2 items-center">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={selectedClass}
            onChange={e => setSelectedClass(e.target.value)}
            className="px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none bg-white font-medium"
          >
            <option value="all">Toàn trường</option>
            {availableClasses.map(c => <option key={c} value={c}>Lớp {c}</option>)}
          </select>
        </div>
      </header>

      {/* Meal Type Tabs */}
      <div className="flex gap-2">
        {mealBtns.map(btn => (
          <button
            key={btn.key}
            onClick={() => setSelectedMeal(btn.key)}
            className={`flex-1 py-3 px-4 rounded-xl text-sm font-semibold border transition-all ${
              selectedMeal === btn.key
                ? 'bg-green-50 text-green-700 border-green-200 ring-2 ring-green-500/30 shadow-sm'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
          >
            <span className="text-lg mr-1">{btn.emoji}</span> {btn.label}
          </button>
        ))}
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="flex flex-col justify-center">
          <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Tổng HS ăn bữa này</p>
          <p className="text-3xl font-black text-slate-900">{summary.totalStudents}</p>
        </Card>
        <Card className="flex flex-col justify-center">
          <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Bán trú</p>
          <p className="text-3xl font-black text-amber-600">{summary.dayStudents} <span className="text-base font-medium text-slate-500">HS</span></p>
        </Card>
        <Card className="flex flex-col justify-center">
          <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Nội trú</p>
          <p className="text-3xl font-black text-emerald-600">{summary.boardingStudents} <span className="text-base font-medium text-slate-500">HS</span></p>
        </Card>
        <Card className="flex flex-col justify-center">
          <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Tổng Calo</p>
          <p className="text-3xl font-black text-green-600">{totalCalories.toLocaleString()} <span className="text-base font-medium text-slate-500">kcal</span></p>
        </Card>
      </div>

      {/* Main Food Table */}
      <Card className="overflow-hidden p-0">
        <div className="px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-green-50 to-emerald-50 flex items-center justify-between">
          <h3 className="font-bold text-green-900 flex items-center gap-2">
            <ChefHat className="w-5 h-5" />
            Bảng tổng hợp thực phẩm — {summary.label}
            {selectedClass !== 'all' && <Badge severity="medium">Lớp {selectedClass}</Badge>}
          </h3>
          <span className="text-xs text-green-700 font-semibold">{summary.totalStudents} học sinh</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500 uppercase font-semibold border-b border-slate-200">
              <tr>
                <th className="px-6 py-3">Thực phẩm</th>
                <th className="px-6 py-3 text-right">Số lượng</th>
                <th className="px-6 py-3 text-right">Đơn vị</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {summary.foods.length > 0 ? summary.foods.map((food, i) => (
                <tr key={i} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-3.5 font-medium text-slate-900">{food.name}</td>
                  <td className="px-6 py-3.5 text-right">
                    <span className="text-lg font-black text-green-700">{food.totalAmountKg}</span>
                  </td>
                  <td className="px-6 py-3.5 text-right font-medium text-slate-600">{food.unit}</td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={3} className="px-6 py-8 text-center text-slate-500">
                    Không có học sinh nào ăn bữa này ({summary.label}).
                    {selectedMeal !== 'lunch' && ' Học sinh bán trú chỉ ăn bữa trưa tại trường.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Per-class breakdown (only when viewing all) */}
      {selectedClass === 'all' && classBreakdown.length > 0 && (
        <div>
          <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-green-600" />
            Chi tiết theo lớp
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {classBreakdown.map(cls => (
              <Card key={cls.className} className="space-y-2 bg-slate-50/50">
                <div className="flex justify-between items-center border-b border-slate-200/50 pb-2">
                  <h4 className="font-bold text-slate-900">Lớp {cls.className}</h4>
                  <Badge severity="success">{cls.totalStudents} HS</Badge>
                </div>
                <div className="space-y-1">
                  {cls.foods.slice(0, 5).map((food, i) => (
                    <div key={i} className="flex justify-between text-xs">
                      <span className="text-slate-600">{food.name}</span>
                      <span className="font-bold text-slate-900">{food.totalAmountKg} {food.unit}</span>
                    </div>
                  ))}
                  {cls.foods.length > 5 && (
                    <p className="text-xs text-slate-400 italic">... và {cls.foods.length - 5} loại khác</p>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
