import { useState } from 'react';
import { Modal, Button } from '../ui';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { secondaryAuth, db } from '../../lib/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { useToast } from '../ui/Toast';

interface CreateTeacherModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultRole?: 'teacher' | 'admin';
}

export function CreateTeacherModal({ isOpen, onClose, defaultRole = 'teacher' }: CreateTeacherModalProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [classes, setClasses] = useState('');
  const [role, setRole] = useState<'teacher' | 'admin'>(defaultRole);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { toast } = useToast();

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setDisplayName('');
    setClasses('');
    setRole(defaultRole);
    setError('');
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Validate
      if (password.length < 6) {
        setError('Mật khẩu phải có ít nhất 6 ký tự.');
        setLoading(false);
        return;
      }

      // 1. Create auth user via secondary app (won't logout current admin)
      const userCredential = await createUserWithEmailAndPassword(secondaryAuth, email, password);
      const newUid = userCredential.user.uid;

      // 2. Create Firestore user document
      const assignedClasses = classes.split(',').map(c => c.trim()).filter(c => c.length > 0);

      await setDoc(doc(db, 'users', newUid), {
        email,
        displayName: displayName || email.split('@')[0],
        role,
        assignedClasses,
        createdAt: new Date()
      });

      // 3. Sign out secondary auth (cleanup)
      await secondaryAuth.signOut();

      toast(`Đã tạo tài khoản ${role === 'admin' ? 'Ban Giám Hiệu' : 'Giáo viên'} thành công!`, 'success');
      resetForm();
      onClose();
    } catch (err: any) {
      console.error('Error creating user:', err);

      // Map Firebase error codes to Vietnamese
      const errorMessages: Record<string, string> = {
        'auth/email-already-in-use': 'Email này đã được sử dụng.',
        'auth/invalid-email': 'Email không hợp lệ.',
        'auth/weak-password': 'Mật khẩu quá yếu (tối thiểu 6 ký tự).',
        'auth/operation-not-allowed': 'Đăng ký bằng email/mật khẩu chưa được bật trong Firebase.',
      };

      const friendlyMessage = errorMessages[err.code] || err.message || 'Có lỗi xảy ra. Vui lòng thử lại.';
      setError(friendlyMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Thêm người dùng mới">
      <form onSubmit={handleCreate} className="space-y-4">
        {error && (
          <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 font-medium">
            ⚠️ {error}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Email <span className="text-red-500">*</span></label>
          <input
            type="email"
            required
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="email@example.com"
            className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Mật khẩu <span className="text-red-500">*</span></label>
          <input
            type="password"
            required
            minLength={6}
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="Tối thiểu 6 ký tự"
            className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Họ tên hiển thị</label>
          <input
            type="text"
            value={displayName}
            onChange={e => setDisplayName(e.target.value)}
            placeholder="VD: Nguyễn Văn A"
            className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none"
          />
        </div>

        {/* Role Selection */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Vai trò</label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setRole('teacher')}
              className={`py-2.5 rounded-lg text-sm font-medium border transition-all ${
                role === 'teacher'
                  ? 'bg-blue-50 text-blue-700 border-blue-200 ring-1 ring-blue-500 shadow-sm'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              📚 Giáo viên
            </button>
            <button
              type="button"
              onClick={() => setRole('admin')}
              className={`py-2.5 rounded-lg text-sm font-medium border transition-all ${
                role === 'admin'
                  ? 'bg-purple-50 text-purple-700 border-purple-200 ring-1 ring-purple-500 shadow-sm'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              👑 Ban Giám Hiệu
            </button>
          </div>
        </div>

        {/* Class assignment — only relevant for teachers */}
        {role === 'teacher' && (
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Lớp phân công</label>
            <input
              type="text"
              value={classes}
              onChange={e => setClasses(e.target.value)}
              placeholder="VD: 6A, 7B, 8C"
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none"
            />
            <p className="text-xs text-slate-400 mt-1">Ngăn cách các lớp bằng dấu phẩy. Có thể gán sau.</p>
          </div>
        )}

        <div className="flex justify-end gap-3 pt-2 border-t border-slate-100">
          <Button type="button" variant="outline" onClick={() => { resetForm(); onClose(); }} disabled={loading}>Hủy</Button>
          <Button type="submit" disabled={loading}>
            {loading ? 'Đang tạo...' : `Tạo ${role === 'admin' ? 'Admin' : 'Giáo viên'}`}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
