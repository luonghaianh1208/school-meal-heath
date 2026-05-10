import { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot, addDoc, updateDoc, deleteDoc, doc, serverTimestamp, writeBatch } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Student } from '../types';

import { useAuth } from './useAuth';

export function useStudents(className?: string) {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { appUser } = useAuth();

  useEffect(() => {
    setLoading(true);

    // Fetch all students, filter client-side to avoid composite index requirement
    const q = query(collection(db, 'students'), orderBy('name'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      let data = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Student));
      
      // Lọc theo lớp được phân công nếu là giáo viên
      if (appUser && appUser.role === 'teacher') {
        const assigned = appUser.assignedClasses || [];
        data = data.filter(s => assigned.includes(s.className));
      }

      if (className && className !== 'all') {
        data = data.filter(s => s.className === className);
      }
      setStudents(data);
      setLoading(false);
    }, (err) => {
      console.error('Error fetching students:', err);
      setError(err);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [className, appUser]);

  const addStudent = async (student: Omit<Student, 'id'>) => {
    const { id, ...data } = student as any;
    await addDoc(collection(db, 'students'), {
      ...data,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
  };

  const updateStudent = async (id: string, updates: Partial<Student>) => {
    const { id: _id, ...data } = updates as any;
    await updateDoc(doc(db, 'students', id), {
      ...data,
      updatedAt: serverTimestamp()
    });
  };

  const deleteStudent = async (id: string) => {
    await deleteDoc(doc(db, 'students', id));
  };

  const deleteStudentsBulk = async (ids: string[]) => {
    const batch = writeBatch(db);
    ids.forEach(id => {
      batch.delete(doc(db, 'students', id));
    });
    await batch.commit();
  };

  const addStudentsBulk = async (studentsList: Omit<Student, 'id'>[]) => {
    const batch = writeBatch(db);
    studentsList.forEach(student => {
      const docRef = doc(collection(db, 'students'));
      batch.set(docRef, {
        ...student,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
    });
    await batch.commit();
  };

  return { students, loading, error, addStudent, updateStudent, deleteStudent, deleteStudentsBulk, addStudentsBulk };
}
