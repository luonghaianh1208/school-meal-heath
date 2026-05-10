import { useState, useRef } from 'react';
import { Modal, Button } from '../ui';
import * as XLSX from 'xlsx';
import { useToast } from '../ui/Toast';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { secondaryAuth, db } from '../../lib/firebase';
import { doc, setDoc } from 'firebase/firestore';

interface ImportTeachersModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRefresh?: () => void;
}

export function ImportTeachersModal({ isOpen, onClose, onRefresh }: ImportTeachersModalProps) {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const jsonData = XLSX.utils.sheet_to_json(ws);
        
        setData(jsonData);
      } catch (err) {
        console.error("Error reading file:", err);
        toast("Không thể đọc file. Vui lòng đảm bảo đúng định dạng Excel.", "error");
      }
    };
    reader.readAsBinaryString(file);
  };

  const downloadTemplate = () => {
    const templateData = [
      {
        'Email': 'teacher@example.com',
        'Mật khẩu': 'password123',
        'Họ và tên': 'Nguyễn Văn A',
        'Lớp phân công': '6A, 7B'
      }
    ];
    const ws = XLSX.utils.json_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Template");
    XLSX.writeFile(wb, "Mau_Nhap_Giao_Vien.xlsx");
  };

  const handleImport = async () => {
    if (data.length === 0) {
      toast("Vui lòng chọn file có dữ liệu", "error");
      return;
    }

    setLoading(true);
    setProgress({ current: 0, total: data.length });
    let successCount = 0;
    let failCount = 0;

    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      try {
        if (!row['Email'] || !row['Mật khẩu']) {
          throw new Error("Thiếu Email hoặc Mật khẩu");
        }

        const userCredential = await createUserWithEmailAndPassword(secondaryAuth, row['Email'].toString().trim(), row['Mật khẩu'].toString());
        const newUid = userCredential.user.uid;

        const classesStr = row['Lớp phân công'] ? String(row['Lớp phân công']) : '';
        const assignedClasses = classesStr.split(',').map(c => c.trim()).filter(c => c.length > 0);

        await setDoc(doc(db, 'users', newUid), {
          email: row['Email'].toString().trim(),
          displayName: row['Họ và tên'] ? row['Họ và tên'].toString().trim() : row['Email'].toString().split('@')[0],
          role: 'teacher',
          assignedClasses,
          createdAt: new Date()
        });
        
        successCount++;
      } catch (err: any) {
        console.error("Error creating user row", row, err);
        failCount++;
      }
      setProgress({ current: i + 1, total: data.length });
    }

    // Sign out secondary auth
    await secondaryAuth.signOut();

    setLoading(false);
    toast(`Đã nhập xong! Thành công: ${successCount}, Lỗi: ${failCount}`, successCount > 0 ? 'success' : 'error');
    if (successCount > 0) {
      onRefresh?.();
      onClose();
      setData([]);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Nhập Giáo viên từ Excel">
      <div className="space-y-4">
        <div className="flex justify-between items-center bg-slate-50 p-3 rounded-lg border border-slate-200">
          <div className="text-sm text-slate-600">
            1. Tải file mẫu <br/>
            2. Điền dữ liệu vào file <br/>
            3. Upload file để hệ thống tự động tạo
          </div>
          <Button variant="outline" size="sm" onClick={downloadTemplate}>Tải File Mẫu</Button>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Chọn file Excel đã điền</label>
          <input
            type="file"
            accept=".xlsx, .xls"
            onChange={handleFileUpload}
            ref={fileInputRef}
            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
          />
        </div>

        {data.length > 0 && (
          <div className="mt-4">
            <h4 className="text-sm font-semibold text-slate-700 mb-2">Xem trước dữ liệu ({data.length} dòng):</h4>
            <div className="max-h-40 overflow-y-auto border border-slate-200 rounded-lg">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 sticky top-0">
                  <tr>
                    <th className="px-2 py-1">Email</th>
                    <th className="px-2 py-1">Họ và tên</th>
                    <th className="px-2 py-1">Lớp phân công</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {data.slice(0, 5).map((row, idx) => (
                    <tr key={idx}>
                      <td className="px-2 py-1 truncate max-w-[100px]">{row['Email']}</td>
                      <td className="px-2 py-1 truncate max-w-[100px]">{row['Họ và tên']}</td>
                      <td className="px-2 py-1 truncate max-w-[100px]">{row['Lớp phân công']}</td>
                    </tr>
                  ))}
                  {data.length > 5 && (
                    <tr>
                      <td colSpan={3} className="px-2 py-2 text-center text-slate-400 italic">
                        ... và {data.length - 5} dòng khác
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {loading && (
          <div className="mt-4">
            <div className="text-xs text-slate-500 mb-1 text-right">{progress.current} / {progress.total}</div>
            <div className="w-full bg-slate-200 rounded-full h-1.5">
              <div className="bg-green-500 h-1.5 rounded-full transition-all duration-300" style={{ width: `${(progress.current / progress.total) * 100}%` }}></div>
            </div>
          </div>
        )}

        <div className="flex justify-end gap-3 mt-6">
          <Button variant="outline" onClick={onClose} disabled={loading}>Đóng</Button>
          <Button onClick={handleImport} disabled={data.length === 0 || loading}>
            {loading ? 'Đang nhập...' : 'Xác nhận Nhập'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
