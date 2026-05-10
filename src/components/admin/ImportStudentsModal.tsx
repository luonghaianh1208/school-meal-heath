import { useState, useRef } from 'react';
import { Modal, Button } from '../ui';
import * as XLSX from 'xlsx';
import { useToast } from '../ui/Toast';
import { useStudents } from '../../hooks/useStudents';

interface ImportStudentsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRefresh?: () => void;
}

export function ImportStudentsModal({ isOpen, onClose, onRefresh }: ImportStudentsModalProps) {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const { addStudentsBulk } = useStudents('all');

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
        'Họ và tên': 'Nguyễn Văn B',
        'Lớp': '6A',
        'Tuổi': 12,
        'Giới tính': 'nam',
        'Cân nặng (kg)': 45,
        'Chiều cao (cm)': 150,
        'Mức độ HĐ': 'vừa',
        'Dị ứng': 'đậu phộng, hải sản',
        'Sức khoẻ': 'bình thường'
      }
    ];
    const ws = XLSX.utils.json_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Template");
    XLSX.writeFile(wb, "Mau_Nhap_Hoc_Sinh.xlsx");
  };

  const handleImport = async () => {
    if (data.length === 0) {
      toast("Vui lòng chọn file có dữ liệu", "error");
      return;
    }

    setLoading(true);
    try {
      const studentsToImport = data.map(row => ({
        name: row['Họ và tên']?.toString().trim() || 'Chưa có tên',
        className: row['Lớp']?.toString().trim() || 'N/A',
        age: Number(row['Tuổi']) || 10,
        gender: row['Giới tính']?.toString().toLowerCase() === 'female' || row['Giới tính']?.toString().toLowerCase() === 'nữ' ? 'female' as const : 'male' as const,
        weight: Number(row['Cân nặng (kg)']) || 30,
        height: Number(row['Chiều cao (cm)']) || 130,
        activityLevel: ['low', 'medium', 'high', 'ít', 'vừa', 'nhiều'].some(val => row['Mức độ HĐ']?.toString().toLowerCase().includes(val)) 
          ? (row['Mức độ HĐ']?.toString().toLowerCase().includes('nhiều') ? 'active' : row['Mức độ HĐ']?.toString().toLowerCase().includes('ít') ? 'sedentary' : 'moderate') 
          : 'moderate',
        allergies: row['Dị ứng'] ? row['Dị ứng'].toString().split(',').map((s: string) => s.trim()) : [],
        healthStatus: ['normal', 'underweight', 'overweight', 'monitored', 'bình thường', 'nhẹ cân', 'thừa cân', 'theo dõi'].some(val => row['Sức khoẻ']?.toString().toLowerCase().includes(val))
          ? (row['Sức khoẻ']?.toString().toLowerCase().includes('nhẹ cân') ? 'underweight' : row['Sức khoẻ']?.toString().toLowerCase().includes('thừa cân') ? 'overweight' : row['Sức khoẻ']?.toString().toLowerCase().includes('theo dõi') ? 'monitored' : 'normal')
          : 'normal'
      }));

      await addStudentsBulk(studentsToImport);
      
      toast(`Đã nhập thành công ${studentsToImport.length} học sinh!`, 'success');
      onRefresh?.();
      onClose();
      setData([]);
    } catch (err: any) {
      console.error("Error importing students", err);
      toast("Lỗi khi nhập dữ liệu: " + (err.message || ''), "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Nhập Học sinh từ Excel">
      <div className="space-y-4">
        <div className="flex justify-between items-center bg-slate-50 p-3 rounded-lg border border-slate-200">
          <div className="text-sm text-slate-600">
            1. Tải file mẫu <br/>
            2. Điền dữ liệu vào file <br/>
            3. Upload file để hệ thống tự động thêm
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
                    <th className="px-2 py-1">Họ và tên</th>
                    <th className="px-2 py-1">Lớp</th>
                    <th className="px-2 py-1">Tuổi</th>
                    <th className="px-2 py-1">Cân nặng</th>
                    <th className="px-2 py-1">Chiều cao</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {data.slice(0, 5).map((row, idx) => (
                    <tr key={idx}>
                      <td className="px-2 py-1 truncate max-w-[80px]">{row['Họ và tên']}</td>
                      <td className="px-2 py-1 truncate max-w-[60px]">{row['Lớp']}</td>
                      <td className="px-2 py-1">{row['Tuổi']}</td>
                      <td className="px-2 py-1">{row['Cân nặng (kg)']}kg</td>
                      <td className="px-2 py-1">{row['Chiều cao (cm)']}cm</td>
                    </tr>
                  ))}
                  {data.length > 5 && (
                    <tr>
                      <td colSpan={5} className="px-2 py-2 text-center text-slate-400 italic">
                        ... và {data.length - 5} dòng khác
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
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
