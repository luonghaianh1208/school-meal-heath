import { useState } from 'react';
import { Modal, Button, Card } from '../ui';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { secondaryAuth, db } from '../../lib/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { useToast } from '../ui/Toast';

export function CreateTeacherModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [classes, setClasses] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // 1. Create auth user in secondary app
      const userCredential = await createUserWithEmailAndPassword(secondaryAuth, email, password);
      const newUid = userCredential.user.uid;

      // 2. Create firestore doc
      const assignedClasses = classes.split(',').map(c => c.trim()).filter(c => c.length > 0);
      
      await setDoc(doc(db, 'users', newUid), {
        email,
        displayName: displayName || email.split('@')[0],
        role: 'teacher',
        assignedClasses,
        createdAt: new Date()
      });

      toast('Đã tạo tài khoản giáo viên thành công!', 'success');
      
      // Secondary auth login does not affect primary auth. We can sign out secondary auth to clear it up.
      await secondaryAuth.signOut();
      
      onClose();
      setEmail('');
      setPassword('');
      setDisplayName('');
      setClasses('');
    } catch (error: any) {
      console.error('Error creating teacher:', error);
      toast(error.message || 'Lỗi khi tạo tài khoản', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Thêm Giáo viên mới">
      <form onSubmit={handleCreate} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
          <input
            type="email"
            required
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="w-full px-3 py-2 border border-slate-200 rounded-lg"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Mật khẩu</label>
          <input
            type="password"
            required
            minLength={6}
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="w-full px-3 py-2 border border-slate-200 rounded-lg"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Họ tên hiển thị (Tùy chọn)</label>
          <input
            type="text"
            value={displayName}
            onChange={e => setDisplayName(e.target.value)}
            className="w-full px-3 py-2 border border-slate-200 rounded-lg"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Các lớp phân công (ngăn cách bởi dấu phẩy)</label>
          <input
            type="text"
            value={classes}
            onChange={e => setClasses(e.target.value)}
            placeholder="VD: 6A, 7B"
            className="w-full px-3 py-2 border border-slate-200 rounded-lg"
          />
        </div>
        
        <div className="flex justify-end gap-3 mt-6">
          <Button type="button" variant="outline" onClick={onClose} disabled={loading}>Hủy</Button>
          <Button type="submit" disabled={loading}>
            {loading ? 'Đang tạo...' : 'Tạo tài khoản'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
