import { useState } from 'react';
import { Card, Badge, Button } from '../components/ui';
import { useUsers } from '../hooks/useUsers';
import { useStudents } from '../hooks/useStudents';
import { AppUser } from '../types';
import { Settings, Shield, User, Save, Edit3, Trash2, Plus, Upload, AlertTriangle } from 'lucide-react';
import { CreateTeacherModal } from '../components/admin/CreateTeacherModal';
import { ImportTeachersModal } from '../components/admin/ImportTeachersModal';

export default function Admin() {
  const { users, loading, updateAssignedClasses, updateUserRole, deleteUser, deleteUsersBulk } = useUsers();
  const { students, deleteStudentsBulk } = useStudents('all');
  const [editingClassesFor, setEditingClassesFor] = useState<string | null>(null);
  const [tempClasses, setTempClasses] = useState<string>('');
  
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  if (loading) return <div className="p-8">Đang tải dữ liệu...</div>;

  const handleEditClasses = (user: AppUser) => {
    setEditingClassesFor(user.uid);
    setTempClasses((user.assignedClasses || []).join(', '));
  };

  const handleSaveClasses = async (user: AppUser) => {
    const classesArray = tempClasses.split(',').map(c => c.trim()).filter(c => c.length > 0);
    await updateAssignedClasses(user.uid, classesArray);
    setEditingClassesFor(null);
  };

  const toggleRole = async (user: AppUser) => {
    if (confirm(`Bạn có chắc muốn đổi vai trò của ${user.displayName || user.email}?`)) {
      await updateUserRole(user.uid, user.role === 'admin' ? 'teacher' : 'admin');
    }
  };

  const handleDeleteUser = async (user: AppUser) => {
    if (confirm(`CHÚ Ý: Bạn có chắc chắn muốn XÓA người dùng ${user.displayName || user.email}?`)) {
      await deleteUser(user.uid);
    }
  };

  const handleResetStudents = async () => {
    if (students.length === 0) return alert('Hệ thống hiện không có dữ liệu học sinh.');
    if (confirm(`CẢNH BÁO NGUY HIỂM: Bạn đang chuẩn bị xóa TOÀN BỘ ${students.length} học sinh trên hệ thống. Hành động này không thể hoàn tác! Bạn có chắc chắn không?`)) {
      await deleteStudentsBulk(students.map(s => s.id));
    }
  };

  const handleResetTeachers = async () => {
    const teachers = users.filter(u => u.role === 'teacher');
    if (teachers.length === 0) return alert('Hệ thống hiện không có giáo viên.');
    if (confirm(`CẢNH BÁO NGUY HIỂM: Bạn đang chuẩn bị xóa TOÀN BỘ ${teachers.length} giáo viên trên hệ thống. Hành động này không thể hoàn tác! Bạn có chắc chắn không?`)) {
      await deleteUsersBulk(teachers.map(t => t.uid));
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Settings className="w-6 h-6 text-green-600" />
            Quản trị Hệ thống
          </h2>
          <p className="text-slate-500 mt-1">Quản lý người dùng, phân quyền và phân công lớp học</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setIsImportModalOpen(true)} variant="outline" className="gap-2">
            <Upload className="w-4 h-4" /> Nhập Excel
          </Button>
          <Button onClick={() => setIsCreateModalOpen(true)} className="gap-2">
            <Plus className="w-4 h-4" /> Thêm người dùng
          </Button>
        </div>
      </header>

      <Card className="overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-slate-500 uppercase font-semibold border-b border-slate-200">
              <tr>
                <th className="px-6 py-4">Người dùng</th>
                <th className="px-6 py-4">Vai trò</th>
                <th className="px-6 py-4">Lớp phụ trách</th>
                <th className="px-6 py-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map(user => (
                <tr key={user.uid} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-700 shrink-0 font-bold">
                        {user.displayName ? user.displayName[0].toUpperCase() : user.email[0].toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900">{user.displayName || 'Người dùng ẩn danh'}</p>
                        <p className="text-xs text-slate-500">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <button onClick={() => toggleRole(user)} className="focus:outline-none hover:opacity-80 transition-opacity">
                       <Badge severity={user.role === 'admin' ? 'high' : 'medium'} className="flex items-center gap-1">
                         {user.role === 'admin' ? <Shield className="w-3 h-3" /> : <User className="w-3 h-3" />}
                         {user.role === 'admin' ? 'Ban Giám Hiệu' : 'Giáo viên'}
                       </Badge>
                    </button>
                  </td>
                  <td className="px-6 py-4">
                    {editingClassesFor === user.uid ? (
                      <input
                        type="text"
                        value={tempClasses}
                        onChange={e => setTempClasses(e.target.value)}
                        placeholder="VD: 6A, 7B"
                        className="px-3 py-1.5 border border-slate-300 rounded-md text-sm w-full focus:ring-2 focus:ring-green-500 focus:outline-none"
                      />
                    ) : (
                      <div className="flex flex-wrap gap-1">
                        {user.assignedClasses && user.assignedClasses.length > 0 ? (
                          user.assignedClasses.map(c => (
                            <span key={c} className="px-2.5 py-1 bg-green-50 text-green-700 rounded-md text-xs font-semibold border border-green-200">
                              Lớp {c}
                            </span>
                          ))
                        ) : (
                          <span className="text-slate-400 italic text-xs">Chưa phân công</span>
                        )}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    {editingClassesFor === user.uid ? (
                      <div className="flex items-center justify-end gap-2">
                        <Button size="sm" onClick={() => handleSaveClasses(user)} className="gap-1 px-2"><Save className="w-4 h-4"/> Lưu</Button>
                        <Button size="sm" variant="outline" onClick={() => setEditingClassesFor(null)} className="px-2 text-slate-500">Hủy</Button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-end gap-2">
                        <Button size="sm" variant="outline" onClick={() => handleEditClasses(user)} className="gap-1 px-2 text-slate-600">
                          <Edit3 className="w-4 h-4" /> Sửa
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => handleDeleteUser(user)} className="gap-1 px-2 text-red-600 border-red-200 hover:bg-red-50">
                          <Trash2 className="w-4 h-4" /> Xóa
                        </Button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-slate-500">
                    Chưa có dữ liệu người dùng.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <Card className="border-red-100 bg-red-50/30">
        <h3 className="text-lg font-bold text-red-700 flex items-center gap-2 mb-4">
          <AlertTriangle className="w-5 h-5" />
          Khu vực Nguy hiểm (Reset Data)
        </h3>
        <p className="text-sm text-slate-600 mb-6">Thao tác tại đây sẽ xóa vĩnh viễn dữ liệu trên hệ thống. Vui lòng cẩn trọng.</p>
        
        <div className="flex gap-4">
          <Button variant="outline" onClick={handleResetStudents} className="border-red-200 text-red-600 hover:bg-red-50">
            Xóa TOÀN BỘ Học sinh
          </Button>
          <Button variant="outline" onClick={handleResetTeachers} className="border-red-200 text-red-600 hover:bg-red-50">
            Xóa TOÀN BỘ Giáo viên
          </Button>
        </div>
      </Card>

      <CreateTeacherModal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} />
      <ImportTeachersModal isOpen={isImportModalOpen} onClose={() => setIsImportModalOpen(false)} />
    </div>
  );
}
