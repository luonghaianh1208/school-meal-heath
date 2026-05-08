import { useState } from 'react';
import { Card, Badge, Button } from '../components/ui';
import { useUsers } from '../hooks/useUsers';
import { AppUser } from '../types';
import { Settings, Shield, User, Save, Edit3 } from 'lucide-react';

export default function Admin() {
  const { users, loading, updateAssignedClasses, updateUserRole } = useUsers();
  const [editingClassesFor, setEditingClassesFor] = useState<string | null>(null);
  const [tempClasses, setTempClasses] = useState<string>('');

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

  return (
    <div className="space-y-6">
      <header>
        <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <Settings className="w-6 h-6 text-green-600" />
          Quản trị Hệ thống
        </h2>
        <p className="text-slate-500 mt-1">Quản lý người dùng, phân quyền và phân công lớp học</p>
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
                            <span key={c} className="px-2 py-1 bg-slate-100 text-slate-700 rounded text-xs font-medium border border-slate-200">
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
                      <Button size="sm" variant="outline" onClick={() => handleEditClasses(user)} className="gap-1 px-2 text-slate-600">
                        <Edit3 className="w-4 h-4" /> Sửa lớp
                      </Button>
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
    </div>
  );
}
