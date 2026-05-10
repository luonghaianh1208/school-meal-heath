import { collection, getDocs, addDoc, serverTimestamp, query, limit } from 'firebase/firestore';
import { db } from '../lib/firebase';

const sampleStudents = [
  { name: 'Nguyễn Văn An', className: '6A', age: 11, gender: 'male', weight: 40, height: 145, activityLevel: 'medium', allergies: [] as string[], healthStatus: 'normal' },
  { name: 'Trần Thị Bình', className: '6A', age: 11, gender: 'female', weight: 35, height: 140, activityLevel: 'high', allergies: ['sữa'], healthStatus: 'underweight' },
  { name: 'Lê Hoàng Cường', className: '6A', age: 12, gender: 'male', weight: 55, height: 150, activityLevel: 'low', allergies: [], healthStatus: 'overweight' },
  { name: 'Phạm Thu Dung', className: '7B', age: 13, gender: 'female', weight: 45, height: 155, activityLevel: 'medium', allergies: ['hải sản'], healthStatus: 'normal' },
  { name: 'Hoàng Minh Đức', className: '7B', age: 13, gender: 'male', weight: 50, height: 158, activityLevel: 'high', allergies: [], healthStatus: 'normal' }
];

export async function seedDatabase(): Promise<boolean> {
  try {
    // Check if students collection already has data
    const studentsCheck = await getDocs(query(collection(db, 'students'), limit(1)));
    if (!studentsCheck.empty) {
      console.log('Database already has data, skipping seed');
      return false;
    }

    console.log('Seeding Firestore database...');

    // Write students
    const studentRefs: Record<string, string> = {};
    for (const s of sampleStudents) {
      const docRef = await addDoc(collection(db, 'students'), {
        ...s,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      studentRefs[s.name] = docRef.id;
    }

    // Write sample meal records for today
    const today = new Date().toISOString().split('T')[0];
    const mealTypes = ['breakfast', 'lunch'] as const;
    const eatLevels = [100, 75, 50, 25, 0] as const;

    for (const [name, id] of Object.entries(studentRefs)) {
      for (const mealType of mealTypes) {
        const eatLevel = eatLevels[Math.floor(Math.random() * 3)]; // mostly 100/75/50
        await addDoc(collection(db, 'mealRecords'), {
          studentId: id,
          date: today,
          mealType,
          eatLevel,
          note: '',
          recordedBy: 'seed',
          createdAt: serverTimestamp()
        });
      }
    }

    // Write sample alerts
    const alertStudents = [
      { name: 'Trần Thị Bình', className: '6A', type: 'underweight', message: 'Cân nặng dưới ngưỡng tiêu chuẩn', severity: 'high' as const },
      { name: 'Lê Hoàng Cường', className: '6A', type: 'overweight', message: 'Cân nặng vượt ngưỡng tiêu chuẩn', severity: 'medium' as const }
    ];

    for (const alert of alertStudents) {
      await addDoc(collection(db, 'alerts'), {
        studentId: studentRefs[alert.name] || '',
        studentName: alert.name,
        className: alert.className,
        type: alert.type,
        message: alert.message,
        severity: alert.severity,
        isRead: false,
        createdAt: serverTimestamp()
      });
    }

    console.log('Firestore seed complete!');
    return true;
  } catch (err) {
    console.error('Error seeding database:', err);
    throw err;
  }
}
