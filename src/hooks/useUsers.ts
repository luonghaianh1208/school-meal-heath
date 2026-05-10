import { useState, useEffect } from 'react';
import { collection, onSnapshot, doc, updateDoc, deleteDoc, writeBatch } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { AppUser } from '../types';
import { useToast } from '../components/ui/Toast';

export function useUsers() {
  const [users, setUsers] = useState<AppUser[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const q = collection(db, 'users');
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const usersData: AppUser[] = [];
      snapshot.forEach((doc) => {
        usersData.push({ uid: doc.id, ...doc.data() } as AppUser);
      });
      setUsers(usersData);
      setLoading(false);
    }, (error) => {
      console.error("Lỗi khi tải danh sách người dùng:", error);
      toast("Lỗi khi tải danh sách người dùng", "error");
      setLoading(false);
    });

    return () => unsubscribe();
  }, [toast]);

  const updateAssignedClasses = async (uid: string, classes: string[]) => {
    try {
      const userRef = doc(db, 'users', uid);
      await updateDoc(userRef, { assignedClasses: classes });
      toast('Đã cập nhật phân công lớp thành công!', 'success');
    } catch (error) {
      console.error("Lỗi khi cập nhật lớp:", error);
      toast('Lỗi khi cập nhật lớp', 'error');
    }
  };

  const updateUserRole = async (uid: string, role: 'admin' | 'teacher') => {
    try {
      const userRef = doc(db, 'users', uid);
      await updateDoc(userRef, { role });
      toast('Đã thay đổi vai trò người dùng!', 'success');
    } catch (error) {
      console.error("Lỗi khi cập nhật role:", error);
      toast('Lỗi khi cập nhật vai trò', 'error');
    }
  };

  const deleteUser = async (uid: string) => {
    try {
      const userRef = doc(db, 'users', uid);
      await deleteDoc(userRef);
      toast('Đã xóa người dùng thành công!', 'success');
    } catch (error) {
      console.error("Lỗi khi xóa người dùng:", error);
      toast('Lỗi khi xóa người dùng', 'error');
    }
  };

  const deleteUsersBulk = async (uids: string[]) => {
    try {
      const batch = writeBatch(db);
      uids.forEach(uid => {
        batch.delete(doc(db, 'users', uid));
      });
      await batch.commit();
      toast(`Đã xóa ${uids.length} người dùng thành công!`, 'success');
    } catch (error) {
      console.error("Lỗi khi xóa hàng loạt người dùng:", error);
      toast('Lỗi khi xóa hàng loạt người dùng', 'error');
    }
  };

  return { users, loading, updateAssignedClasses, updateUserRole, deleteUser, deleteUsersBulk };
}
