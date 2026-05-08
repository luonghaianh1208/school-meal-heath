import { useState, useMemo } from 'react';
import { Card, Button } from '../components/ui';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip } from 'recharts';
import { DownloadCloud, Sparkles, Printer } from 'lucide-react';
import { useToast } from '../components/ui/Toast';
import { useAuth } from '../hooks/useAuth';
import { useStudents } from '../hooks/useStudents';
import { useMealRecords } from '../hooks/useMealRecords';
import * as XLSX from 'xlsx';

export default function Reports() {
  const { toast } = useToast();
  const { appUser } = useAuth();
  const { students, loading: loadingStudents } = useStudents();
  const { records, loading: loadingRecords } = useMealRecords();
  
  const [selectedClass, setSelectedClass] = useState<string>('all');

  // Available classes
  let availableClasses = Array.from(new Set(students.map(s => s.className))).sort();
  if (appUser?.role === 'teacher') {
    availableClasses = appUser.assignedClasses || [];
  }

  // Filter students based on selected class
  const filteredStudents = useMemo(() => {
    return students.filter(s => {
      const isAllowed = appUser?.role === 'admin' || (appUser?.role === 'teacher' && (appUser.assignedClasses || []).includes(s.className));
      const matchesClass = selectedClass === 'all' || s.className === selectedClass;
      return isAllowed && matchesClass;
    });
  }, [students, selectedClass, appUser]);

  // Compute week data (Mocked trend for now or real if enough data, here we do a simple real aggregation by date)
  const weekData = useMemo(() => {
    // Group records by date
    const dateGroups: Record<string, { total: number, complete: number }> = {};
    const filteredStudentIds = new Set(filteredStudents.map(s => s.id));

    records.forEach(r => {
      if (!filteredStudentIds.has(r.studentId)) return;
      if (!dateGroups[r.date]) dateGroups[r.date] = { total: 0, complete: 0 };
      dateGroups[r.date].total += 1;
      if (r.eatLevel === 'complete' || r.eatLevel === 'most') {
        dateGroups[r.date].complete += 1;
      }
    });

    const sortedDates = Object.keys(dateGroups).sort().slice(-7); // last 7 days
    if (sortedDates.length === 0) {
      return [
        { name: 'Chưa có dữ liệu', 'Ăn đủ (%)': 0 }
      ];
    }
    return sortedDates.map(date => {
      const group = dateGroups[date];
      const percentage = group.total > 0 ? Math.round((group.complete / group.total) * 100) : 0;
      return {
        name: date.slice(-5), // MM-DD
        'Ăn đủ (%)': percentage
      };
    });
  }, [records, filteredStudents]);

  // Compute top attention (students with lowest completion rate)
  const topAttention = useMemo(() => {
    const studentStats: Record<string, { name: string, className: string, total: number, complete: number }> = {};
    
    filteredStudents.forEach(s => {
      studentStats[s.id] = { name: s.name, className: s.className, total: 0, complete: 0 };
    });

    records.forEach(r => {
      if (studentStats[r.studentId]) {
        studentStats[r.studentId].total += 1;
        if (r.eatLevel === 'complete' || r.eatLevel === 'most') {
          studentStats[r.studentId].complete += 1;
        }
      }
    });

    return Object.values(studentStats)
      .filter(s => s.total > 0)
      .map(s => ({
        ...s,
        percentage: Math.round((s.complete / s.total) * 100)
      }))
      .sort((a, b) => a.percentage - b.percentage)
      .slice(0, 5);
  }, [records, filteredStudents]);

  const handleExportExcel = () => {
    if (topAttention.length === 0) {
      toast('Không có dữ liệu để xuất', 'info');
      return;
    }
    
    // Create a workbook
    const wb = XLSX.utils.book_new();
    
    // Sheet 1: Top Cần theo dõi
    const wsAttention = XLSX.utils.json_to_sheet(topAttention.map(s => ({
      'Học sinh': s.name,
      'Lớp': s.className,
      'Số bữa ghi nhận': s.total,
      'Tỷ lệ ăn đủ (%)': s.percentage
    })));
    // Define column widths for better formatting
    wsAttention['!cols'] = [
      { wch: 25 }, // Học sinh
      { wch: 15 }, // Lớp
      { wch: 15 }, // Số bữa
      { wch: 15 }  // Tỷ lệ
    ];
    XLSX.utils.book_append_sheet(wb, wsAttention, 'Top_Can_Theo_Doi');

    // Sheet 2: Xu hướng
    const wsTrend = XLSX.utils.json_to_sheet(weekData.map(d => ({
      'Ngày': d.name,
      'Tỷ lệ ăn đủ (%)': d['Ăn đủ (%)']
    })));
    wsTrend['!cols'] = [
      { wch: 15 }, // Ngày
      { wch: 15 }  // Tỷ lệ
    ];
    XLSX.utils.book_append_sheet(wb, wsTrend, 'Xu_Huong');

    XLSX.writeFile(wb, `Bao_Cao_Dinh_Duong_${new Date().toISOString().split('T')[0]}.xlsx`);
    toast('Đã xuất file Excel!', 'success');
  }

  const handlePrint = () => {
    const element = document.getElementById('report-content');
    if (!element) return;
    
    // Use dynamic import to avoid SSR issues if this was SSR, though Vite is SPA.
    import('html2pdf.js').then((html2pdf) => {
      const opt = {
        margin:       10,
        filename:     `Bao_Cao_Dinh_Duong_${new Date().toISOString().split('T')[0]}.pdf`,
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { scale: 2, useCORS: true },
        jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
      };
      html2pdf.default().set(opt).from(element).save().then(() => {
         toast('Đã tải xuống file PDF!', 'success');
      });
    });
  }

  if (loadingStudents || loadingRecords) return <div className="p-8">Đang tải báo cáo...</div>;


  return (
    <div id="report-content" className="flex flex-col h-full space-y-6 print:space-y-4 bg-white p-2">
      <header className="flex justify-between items-end shrink-0 mb-2 border-b border-slate-100 pb-4 print:pb-2">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">Báo cáo Tổng hợp</h2>
          <p className="text-slate-500 mt-1">Xu hướng dinh dưỡng 7 ngày gần nhất</p>
        </div>
        <div className="flex gap-2 items-center print:hidden">
          <select 
            value={selectedClass}
            onChange={e => setSelectedClass(e.target.value)}
            className="px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none bg-white font-medium"
          >
            <option value="all">Tất cả lớp</option>
            {availableClasses.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <Button onClick={handlePrint} variant="outline" className="gap-2 h-auto py-2 px-4">
              <Printer className="w-4 h-4" /> <span className="hidden sm:inline">In PDF</span>
          </Button>
          <Button onClick={handleExportExcel} className="gap-2 shadow-sm font-medium h-auto py-2 px-4 shadow-green-600/20">
              <DownloadCloud className="w-4 h-4" /> <span className="hidden sm:inline">Xuất Excel</span>
          </Button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="col-span-1 md:col-span-2 space-y-4">
            <h3 className="font-semibold text-slate-900">Xu hướng Tỷ lệ học sinh ăn đủ (≥75%)</h3>
            <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={weekData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#64748b'}} dy={10} />
                        <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#64748b'}} />
                        <Tooltip />
                        <Line type="monotone" dataKey="Ăn đủ (%)" stroke="#16a34a" strokeWidth={3} dot={{r: 4, strokeWidth: 2}} activeDot={{r: 6}} />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </Card>

        <Card className="flex flex-col">
            <h3 className="font-semibold text-slate-900 mb-4 border-b border-slate-100 pb-2">Top cần theo dõi</h3>
            <div className="space-y-4 flex-1">
                {topAttention.map((s, i) => (
                    <div key={i} className="flex justify-between items-center text-sm">
                        <div>
                            <p className="font-semibold text-slate-900">{s.name}</p>
                            <p className="text-xs text-slate-500">Lớp {s.className}</p>
                        </div>
                        <span className="px-2 py-1 bg-red-50 text-red-700 font-medium rounded text-xs">{s.percentage}%</span>
                    </div>
                ))}
                {topAttention.length === 0 && <p className="text-sm text-slate-500 text-center py-4">Chưa có dữ liệu theo dõi.</p>}
            </div>
            <div className="mt-4 pt-4 border-t border-slate-100">
                 <Button variant="ghost" className="w-full text-xs gap-1 text-slate-600"><Sparkles className="w-3 h-3"/> Đề xuất giải pháp bằng AI</Button>
            </div>
        </Card>
      </div>
    </div>
  );
}
