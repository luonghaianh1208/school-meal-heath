import { useState, useEffect } from 'react';
import { Card, Button, Badge } from '../components/ui';
import { useStudents } from '../hooks/useStudents';
import { useAuth } from '../hooks/useAuth';
import { useMealRecords } from '../hooks/useMealRecords';
import { evaluateMealIntake, calculateDailyCalories } from '../utils/nutrition';
import { Student, MealRecord } from '../types';
import { format } from 'date-fns';
import { Check, Edit2 } from 'lucide-react';
import { useToast } from '../components/ui/Toast';

export default function MealTracking() {
  const { appUser } = useAuth();
  const classes = appUser?.role === 'admin' 
    ? ['6A', '6B', '7A', '7B', '8A', '8B', '9A', '9B'] 
    : (appUser?.assignedClasses || []);
    
  const [selectedClass, setSelectedClass] = useState(classes[0] || '6A');
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const { students } = useStudents(selectedClass);
  const { records, batchUpdateRecords } = useMealRecords(selectedDate);
  const { toast } = useToast();
  
  // Local state for fast toggling before saving
  const [localRecords, setLocalRecords] = useState<Record<string, number>>({});
  const [isSaving, setIsSaving] = useState(false);

  // Sync local records with fetched records if any
  useEffect(() => {
    const defaultRecs: Record<string, number> = {};
    students.forEach(s => {
      const existing = records.find(r => r.studentId === s.id);
      if (existing) {
        defaultRecs[s.id] = existing.eatLevel;
      } else {
        // default to unselected ? No, default 100 is easier for teachers, but let's leave unset as 100 for now.
        defaultRecs[s.id] = 100;
      }
    });
    setLocalRecords(defaultRecs);
  }, [students, records]);

  const handleToggle = (studentId: string, level: number) => {
    setLocalRecords(prev => ({ ...prev, [studentId]: level }));
  };

  const handleMarkAll100 = () => {
    const all100: Record<string, number> = {};
    students.forEach(s => { all100[s.id] = 100; });
    setLocalRecords(all100);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const newRecs: MealRecord[] = students.map(s => {
        const existing = records.find(r => r.studentId === s.id);
        return {
          id: existing?.id || '', // will auto-gen if empty in batchUpdateRecords
          studentId: s.id,
          date: selectedDate,
          mealType: 'lunch',
          eatLevel: (localRecords[s.id] ?? 100) as any,
          recordedBy: appUser?.uid || 'unknown', 
          createdAt: existing?.createdAt || new Date()
        };
      });
      await batchUpdateRecords(newRecs);
      toast('Đã lưu điểm danh thành công!', 'success');
    } catch (e) {
      toast('Lỗi khi lưu điểm danh.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  // derived values
  const progress = students.length ? Math.round((Object.keys(localRecords).length / students.length) * 100) : 0;

  if (classes.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <Card className="text-center p-8 max-w-md">
          <h2 className="text-xl font-bold text-slate-900 mb-2">Chưa được phân công</h2>
          <p className="text-slate-500">Bạn chưa được phân công quản lý lớp nào. Vui lòng liên hệ Ban Giám Hiệu.</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full space-y-4">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shrink-0">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Điểm danh bữa ăn</h2>
          <p className="text-slate-500 mt-1">Đánh giá lượng ăn thực tế của học sinh</p>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select 
            value={selectedClass} onChange={e => setSelectedClass(e.target.value)}
            className="px-3 py-2.5 border border-slate-200 rounded-lg text-sm bg-white font-medium focus:outline-none focus:ring-2 focus:ring-green-500 shadow-sm"
          >
            {classes.map(c => <option key={c} value={c}>Lớp {c}</option>)}
          </select>
          <input 
            type="date" value={selectedDate} onChange={e=>setSelectedDate(e.target.value)}
            className="px-3 py-2.5 border border-slate-200 rounded-lg text-sm bg-white font-medium focus:outline-none focus:ring-2 focus:ring-green-500 shadow-sm"
          />
        </div>
      </header>

      <Card className="flex flex-col sm:flex-row justify-between items-center sm:items-center p-4 gap-4 bg-slate-50/50">
          <div className="w-full sm:w-1/2">
             <div className="flex justify-between text-sm mb-1.5 font-medium">
                <span className="text-slate-700">Tiến độ nhập</span>
                <span className="text-green-600">{Object.keys(localRecords).length}/{students.length} HS</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2">
                <div className="bg-green-600 h-2 rounded-full transition-all" style={{ width: `${progress}%` }}></div>
            </div>
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
             <Button variant="outline" className="flex-1 sm:flex-none text-sm" onClick={handleMarkAll100}>Chọn tất cả Điểm 100%</Button>
             <Button className="flex-1 sm:flex-none text-sm gap-2" onClick={handleSave} disabled={isSaving}>
                 {isSaving ? 'Đang lưu...' : <><Check className="w-4 h-4"/> Lưu hoàn tất</>}
             </Button>
          </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {students.map(student => {
          const plan = calculateDailyCalories(student);
          const currentEatLevel = localRecords[student.id] ?? 100;
          const evaluation = evaluateMealIntake(currentEatLevel, plan, 'lunch');

          const levels = [
             { val: 0, label: '0%', color: 'border-red-200 text-red-700 bg-red-50 hover:bg-red-100', active: 'bg-red-500 text-white border-red-500 ring-red-500' },
             { val: 25, label: '25%', color: 'border-orange-200 text-orange-700 bg-orange-50 hover:bg-orange-100', active: 'bg-orange-500 text-white border-orange-500 ring-orange-500' },
             { val: 50, label: '50%', color: 'border-amber-200 text-amber-700 bg-amber-50 hover:bg-amber-100', active: 'bg-amber-500 text-white border-amber-500 ring-amber-500' },
             { val: 75, label: '75%', color: 'border-green-200 text-green-700 bg-green-50 hover:bg-green-100', active: 'bg-green-400 text-white border-green-400 ring-green-400' },
             { val: 100, label: '100%', color: 'border-green-300 text-green-800 bg-green-50 hover:bg-green-100', active: 'bg-green-600 text-white border-green-600 ring-green-600' }
          ];

          return (
            <Card key={student.id} className={`p-4 border ${evaluation.status === 'very_low' ? 'border-red-200 bg-red-50/20' : 'border-slate-100'}`}>
              <div className="flex items-center gap-3 mb-4">
                 <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-sm font-medium text-slate-600 shrink-0">
                    {student.name.split(' ').map(n=>n[0]).slice(-2).join('')}
                 </div>
                 <div className="flex-1">
                     <p className="text-sm font-semibold text-slate-900">{student.name}</p>
                     {student.allergies.length > 0 && <p className="text-[10px] text-red-500 mt-0.5">Dị ứng: {student.allergies.join(', ')}</p>}
                 </div>
              </div>
              
              <div className="flex justify-between gap-1 mb-3">
                 {levels.map(l => {
                    const isActive = currentEatLevel === l.val;
                    return (
                        <button
                          key={l.val}
                          onClick={() => handleToggle(student.id, l.val)}
                          className={`flex-1 py-2 text-xs font-semibold rounded-md border transition-all 
                                      ${isActive ? `${l.active} ring-1 shadow-sm` : l.color}`}
                        >
                            {l.label}
                        </button>
                    )
                 })}
              </div>

              <div className="text-xs bg-slate-50 rounded-md p-2">
                 <span className={`font-medium ${evaluation.status === 'good' ? 'text-green-600' : evaluation.status === 'low' ? 'text-amber-600' : 'text-red-600'}`}>
                   Ăn {currentEatLevel}% → {evaluation.actualCalories} kcal / {evaluation.targetCalories} kcal
                 </span>
                 <p className="text-slate-500 mt-0.5 mt-1">{evaluation.message}</p>
              </div>
            </Card>
          )
        })}
      </div>
    </div>
  );
}
