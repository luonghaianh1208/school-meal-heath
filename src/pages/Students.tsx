import { useState } from 'react';
import { Card, Badge, Button, ProgressBar } from '../components/ui';
import { useStudents } from '../hooks/useStudents';
import { calculateDailyCalories, splitDailyCaloriesByMeal, convertMacrosToFood } from '../utils/nutrition';
import { Search, Plus, Filter, X, Users } from 'lucide-react';
import { Student } from '../types';
import { useAuth } from '../hooks/useAuth';
import { Modal } from '../components/ui/Modal';
import { ImportStudentsModal } from '../components/admin/ImportStudentsModal';
import { Upload } from 'lucide-react';

export default function Students() {
  const { appUser } = useAuth();
  const { students, loading, addStudent, updateStudent, deleteStudent } = useStudents();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState<string>('all');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [formData, setFormData] = useState<Partial<Student>>({
    name: '', className: '', age: 6, gender: 'male', weight: 20, height: 110, activityLevel: 'medium', boardingType: 'day', allergies: [], healthStatus: 'normal'
  });
  
  // Available classes based on role
  let availableClasses = Array.from(new Set(students.map(s => s.className))).sort();
  if (appUser?.role === 'teacher') {
    availableClasses = appUser.assignedClasses || [];
  } else if (appUser?.role === 'admin') {
    // Admins can see all classes from users or current students, but let's just use existing student classes or assigned classes.
    // If admin wants to add a new class, they can type it in the form.
  }

  const filteredStudents = students.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesClass = selectedClass === 'all' || s.className === selectedClass;
    return matchesSearch && matchesClass;
  });

  const handleStudentClick = (student: Student) => {
    setSelectedStudent(student);
  };

  if (loading) return <div className="p-8">Đang tải dữ liệu...</div>;

  return (
    <div className="flex flex-col md:flex-row h-full gap-4 min-h-[calc(100vh-6rem)]">
      {/* List Section */}
      <Card className={`flex-1 md:max-w-sm flex flex-col p-0 overflow-hidden ${selectedStudent ? 'hidden md:flex' : ''}`}>
        <div className="p-4 border-b border-slate-100 bg-white sticky top-0 z-10 space-y-4">
          <div className="flex justify-between items-center">
            <h1 className="text-xl font-bold text-slate-900">Học sinh</h1>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" className="gap-1.5 shadow-sm" onClick={() => setIsImportModalOpen(true)}>
                <Upload className="w-4 h-4"/> <span className="hidden sm:inline">Nhập Excel</span>
              </Button>
              <Button size="sm" className="gap-1.5 shadow-sm" onClick={() => {
                setEditingStudent(null);
                setFormData({ name: '', className: availableClasses[0] || '', age: 6, gender: 'male', weight: 20, height: 110, activityLevel: 'medium', boardingType: 'day', allergies: [], healthStatus: 'normal' });
                setIsModalOpen(true);
              }}><Plus className="w-4 h-4"/> <span className="hidden sm:inline">Thêm HS</span></Button>
            </div>
          </div>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="text" 
                placeholder="Tìm học sinh..." 
                className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
            <select 
              value={selectedClass}
              onChange={e => setSelectedClass(e.target.value)}
              className="px-2 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none bg-white font-medium"
            >
              <option value="all">Tất cả</option>
              {availableClasses.map((c: string) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-3 space-y-2 bg-slate-50/30">
          {filteredStudents.map(student => (
            <div 
              key={student.id} 
              onClick={() => handleStudentClick(student)}
              className={`p-3 rounded-xl border cursor-pointer transition-colors flex items-center gap-3 ${selectedStudent?.id === student.id ? 'border-green-500 ring-1 ring-green-500 shadow-sm bg-green-50/50' : 'border-slate-100 bg-white hover:bg-slate-50 shadow-sm'}`}
            >
              <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-sm font-bold text-slate-600 shrink-0">
                {student.name.split(' ').map(n=>n[0]).slice(-2).join('')}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-slate-900 truncate">{student.name}</p>
                <p className="text-xs font-semibold text-slate-500">Lớp {student.className}</p>
              </div>
              <Badge severity={student.healthStatus === 'underweight' ? 'medium' : student.healthStatus === 'overweight' ? 'high' : 'success'}>
                  {student.healthStatus === 'underweight' ? 'Nhẹ cân' : student.healthStatus === 'overweight' ? 'Thừa cân' : student.healthStatus === 'monitored' ? 'Theo dõi' : 'Bình thường'}
              </Badge>
            </div>
          ))}
          {filteredStudents.length === 0 && <div className="text-center text-slate-500 py-8 text-sm">Không tìm thấy học sinh.</div>}
        </div>
      </Card>

      {/* Detail Panel */}
      {selectedStudent ? (
        <Card className="flex-1 flex flex-col p-0 overflow-hidden animate-in slide-in-from-right-8 md:animate-none">
          <div className="h-14 border-b border-slate-100 flex items-center px-6 justify-between shrink-0 bg-white">
            <h2 className="font-bold text-slate-900">Chi tiết học sinh</h2>
            <button onClick={() => setSelectedStudent(null)} className="p-1.5 md:hidden text-slate-500 hover:bg-slate-100 rounded-lg"><X className="w-5 h-5"/></button>
          </div>
          <div className="p-4 md:p-6 lg:p-8 overflow-y-auto flex-1 bg-white">
             <StudentDetail 
                student={selectedStudent} 
                onEdit={() => {
                  setEditingStudent(selectedStudent);
                  setFormData(selectedStudent);
                  setIsModalOpen(true);
                }}
                onDelete={async () => {
                  await deleteStudent(selectedStudent.id);
                  setSelectedStudent(null);
                }}
              />
          </div>
        </Card>
      ) : (
        <Card className="hidden md:flex flex-1 items-center justify-center bg-slate-50/50 text-slate-400 border-dashed border-2">
          <div className="text-center">
            <Users className="w-12 h-12 mx-auto mb-4 text-slate-300" />
            <p className="font-medium text-sm">Chọn một học sinh để xem chi tiết</p>
          </div>
        </Card>
      )}

      {/* Modal CRUD */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={editingStudent ? "Sửa thông tin học sinh" : "Thêm học sinh mới"}
      >
        <form onSubmit={async (e) => {
          e.preventDefault();
          if (editingStudent) {
            await updateStudent(editingStudent.id, formData);
          } else {
            await addStudent(formData as Omit<Student, 'id'>);
          }
          setIsModalOpen(false);
          // Update selected student if editing
          if (editingStudent && selectedStudent?.id === editingStudent.id) {
            setSelectedStudent({ ...selectedStudent, ...formData } as Student);
          }
        }} className="space-y-4">
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1 col-span-2">
              <label className="text-sm font-medium text-slate-700">Họ và tên</label>
              <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none" />
            </div>
            
            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700">Lớp</label>
              <input required type="text" value={formData.className} onChange={e => setFormData({...formData, className: e.target.value})} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none" />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700">Tuổi</label>
              <input required type="number" value={formData.age} onChange={e => setFormData({...formData, age: Number(e.target.value)})} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none" />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700">Giới tính</label>
              <select value={formData.gender} onChange={e => setFormData({...formData, gender: e.target.value as 'male'|'female'})} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none">
                <option value="male">Nam</option>
                <option value="female">Nữ</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700">Mức độ HĐ</label>
              <select value={formData.activityLevel} onChange={e => setFormData({...formData, activityLevel: e.target.value as 'low'|'medium'|'high'})} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none">
                <option value="low">Ít vận động</option>
                <option value="medium">Vừa phải</option>
                <option value="high">Năng động</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700">Cân nặng (kg)</label>
              <input required type="number" step="0.1" value={formData.weight} onChange={e => setFormData({...formData, weight: Number(e.target.value)})} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none" />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700">Chiều cao (cm)</label>
              <input required type="number" step="0.1" value={formData.height} onChange={e => setFormData({...formData, height: Number(e.target.value)})} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none" />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700">Loại hình</label>
              <select value={formData.boardingType || 'day'} onChange={e => setFormData({...formData, boardingType: e.target.value as 'day'|'boarding'})} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none">
                <option value="day">🏫 Bán trú</option>
                <option value="boarding">🏠 Nội trú</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700">Trạng thái sức khỏe</label>
              <select value={formData.healthStatus} onChange={e => setFormData({...formData, healthStatus: e.target.value as any})} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none">
                <option value="normal">Bình thường</option>
                <option value="underweight">Nhẹ cân</option>
                <option value="overweight">Thừa cân</option>
                <option value="monitored">Theo dõi</option>
              </select>
            </div>

            <div className="space-y-1 col-span-2">
              <label className="text-sm font-medium text-slate-700">Dị ứng (cách nhau dấu phẩy)</label>
              <input type="text" value={formData.allergies?.join(', ')} onChange={e => setFormData({...formData, allergies: e.target.value.split(',').map(s => s.trim()).filter(Boolean)})} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none" placeholder="VD: Đậu phộng, Hải sản" />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>Hủy</Button>
            <Button type="submit">Lưu</Button>
          </div>
        </form>
      </Modal>
      <ImportStudentsModal isOpen={isImportModalOpen} onClose={() => setIsImportModalOpen(false)} />
    </div>
  );
}

function StudentDetail({ student, onEdit, onDelete }: { student: Student, onEdit: () => void, onDelete: () => void }) {
  const nutritionPlan = calculateDailyCalories(student);

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in">
      <div className="flex items-start gap-6">
        <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center text-xl font-bold text-slate-600 shrink-0">
          {student.name.split(' ').map(n=>n[0]).slice(-2).join('')}
        </div>
        <div className="flex-1 mt-1">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-slate-900">{student.name}</h2>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={onEdit}>Sửa</Button>
              <Button size="sm" variant="danger" onClick={() => {
                if(window.confirm('Bạn có chắc muốn xóa học sinh này?')) {
                  onDelete();
                }
              }}>Xóa</Button>
            </div>
          </div>
          <p className="text-slate-500">Lớp {student.className} • {student.gender === 'male' ? 'Nam' : 'Nữ'} • {student.age} tuổi • {(student.boardingType || 'day') === 'boarding' ? '🏠 Nội trú' : '🏫 Bán trú'}</p>
          <div className="mt-3 flex gap-2">
            <Badge severity={student.healthStatus === 'underweight' ? 'medium' : student.healthStatus === 'overweight' ? 'high' : 'success'}>
                {student.healthStatus === 'underweight' ? 'Nhẹ cân' : student.healthStatus === 'overweight' ? 'Thừa cân' : 'Bình thường'}
            </Badge>
            {student.allergies.length > 0 && (
                <Badge severity="high">Dị ứng: {student.allergies.join(', ')}</Badge>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
          <Card className="bg-slate-50/50">
             <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Cân nặng</p>
             <p className="text-2xl font-bold text-slate-900">{student.weight} <span className="text-base font-normal text-slate-500">kg</span></p>
          </Card>
          <Card className="bg-slate-50/50">
             <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Chiều cao</p>
             <p className="text-2xl font-bold text-slate-900">{student.height} <span className="text-base font-normal text-slate-500">cm</span></p>
          </Card>
      </div>

      <Card>
        <h3 className="font-semibold text-slate-900 mb-4 border-b border-slate-100 pb-2">Kế hoạch Dinh dưỡng (Mỗi ngày)</h3>
        <div className="mb-6 flex justify-between items-end">
            <div>
                <p className="text-sm text-slate-500">Tổng năng lượng (TDEE)</p>
                <p className="text-3xl font-bold text-green-600">{nutritionPlan.dailyCalories} <span className="text-lg font-medium text-slate-600">kcal</span></p>
            </div>
            <div className="text-right">
                 <p className="text-sm text-slate-500">BMI hiện tại</p>
                 <p className="text-xl font-bold text-slate-900">{nutritionPlan.bmi}</p>
            </div>
        </div>

        <div className="space-y-4">
            <div>
                <div className="flex justify-between text-sm mb-1.5 font-medium">
                    <span className="text-slate-700">Protein (15%)</span>
                    <span className="text-slate-900">{nutritionPlan.protein}g</span>
                </div>
                <ProgressBar progress={15} colorClass="bg-red-400" />
            </div>
            <div>
                <div className="flex justify-between text-sm mb-1.5 font-medium">
                    <span className="text-slate-700">Carbohydrate (55%)</span>
                    <span className="text-slate-900">{nutritionPlan.carbs}g</span>
                </div>
                <ProgressBar progress={55} colorClass="bg-amber-400" />
            </div>
            <div>
                <div className="flex justify-between text-sm mb-1.5 font-medium">
                    <span className="text-slate-700">Fat (30%)</span>
                    <span className="text-slate-900">{nutritionPlan.fat}g</span>
                </div>
                <ProgressBar progress={30} colorClass="bg-yellow-400" />
            </div>
        </div>
      </Card>
      
      <Card>
          <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-2">
            <h3 className="font-semibold text-slate-900">Bữa ăn tại trường ({(student.boardingType || 'day') === 'boarding' ? 'Nội trú — 3 bữa' : 'Bán trú — bữa trưa'})</h3>
          </div>
          <div className="space-y-3">
            {splitDailyCaloriesByMeal(nutritionPlan, student.boardingType || 'day').map(meal => {
              const foods = convertMacrosToFood(meal);
              return (
                <div key={meal.mealType} className="bg-slate-50 rounded-lg p-3">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-semibold text-slate-800">{meal.label}</span>
                    <span className="text-sm font-bold text-green-600">{meal.calories} kcal ({meal.percentOfDaily}%)</span>
                  </div>
                  <div className="grid grid-cols-2 gap-1 text-xs">
                    {foods.foods.map(f => (
                      <div key={f.name} className="flex justify-between bg-white px-2 py-1 rounded">
                        <span className="text-slate-600">{f.name}</span>
                        <span className="font-bold text-slate-900">{f.amount}{f.unit}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
          <p className="text-sm text-slate-600 italic mt-3">Khuyến nghị: {(student.healthStatus === 'underweight') ? 'Nên dùng thêm các món phụ giàu dinh dưỡng.' : (student.healthStatus === 'overweight') ? 'Khuyến khích ăn nhiều rau, giảm tinh bột.' : 'Nên ăn hết phần để đảm bảo phát triển tốt.'}</p>
      </Card>
    </div>
  )
}
