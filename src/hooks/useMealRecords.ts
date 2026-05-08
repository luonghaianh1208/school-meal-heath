import { useState, useEffect } from 'react';
import { collection, query, where, orderBy, onSnapshot, doc, setDoc, writeBatch, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { MealRecord, Alert } from '../types';

export function useMealRecords(date?: string) {
  const [records, setRecords] = useState<MealRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);

    let q;
    if (date) {
      q = query(collection(db, 'mealRecords'), where('date', '==', date));
    } else {
      // Fetch all records — sort client-side to avoid composite index
      q = query(collection(db, 'mealRecords'));
    }

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as MealRecord));
      // Sort by date descending client-side
      data.sort((a, b) => b.date.localeCompare(a.date));
      setRecords(data);
      setLoading(false);
    }, (err) => {
      console.error('Error fetching meal records:', err);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [date]);

  const batchUpdateRecords = async (newRecords: MealRecord[]) => {
    const batch = writeBatch(db);

    newRecords.forEach(r => {
      const id = r.id || doc(collection(db, 'mealRecords')).id;
      const ref = doc(db, 'mealRecords', id);
      batch.set(ref, {
        studentId: r.studentId,
        date: r.date,
        mealType: r.mealType,
        eatLevel: r.eatLevel,
        note: r.note || '',
        recordedBy: r.recordedBy,
        createdAt: r.createdAt || serverTimestamp()
      }, { merge: true });
    });

    await batch.commit();
  };

  return { records, loading, batchUpdateRecords };
}

export function useAlerts() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simple query — sort client-side to avoid composite index
    const q = query(
      collection(db, 'alerts'),
      where('isRead', '==', false)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Alert));
      // Sort by severity (high first) then createdAt
      data.sort((a, b) => {
        const sevOrder = { high: 0, medium: 1, low: 2 };
        return (sevOrder[a.severity] || 2) - (sevOrder[b.severity] || 2);
      });
      setAlerts(data);
      setLoading(false);
    }, (err) => {
      console.error('Error fetching alerts:', err);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return { alerts, loading };
}
