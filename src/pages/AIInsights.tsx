import { useState, useMemo } from 'react';
import { Card, Button } from '../components/ui';
import { Sparkles, FileText, CalendarCheck, ClipboardType, Activity } from 'lucide-react';
import Markdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';
import { useStudents } from '../hooks/useStudents';
import { useMealRecords } from '../hooks/useMealRecords';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../components/ui/Toast';
import { analyzeClassHealth, suggestWeeklyMenu, generateClassReport } from '../lib/gemini';

export default function AIInsights() {
  const { appUser } = useAuth();
  const { toast } = useToast();
  const { students } = useStudents();
  const { records } = useMealRecords();
  
  const [activeTab, setActiveTab] = useState<'health' | 'menu' | 'report'>('health');
  const [selectedClass, setSelectedClass] = useState<string>('');
  
  const [healthResult, setHealthResult] = useState('');
  const [menuResult, setMenuResult] = useState('');
  const [reportResult, setReportResult] = useState('');
  const [loading, setLoading] = useState(false);

  // Available classes
  let availableClasses = Array.from(new Set(students.map(s => s.className))).sort();
  if (appUser?.role === 'teacher') {
    availableClasses = appUser.assignedClasses || [];
  }
  
  const activeClass = selectedClass || availableClasses[0] || '';

  const classStudents = useMemo(() => students.filter(s => s.className === activeClass), [students, activeClass]);
  const classRecords = useMemo(() => {
    const studentIds = new Set(classStudents.map(s => s.id));
    return records.filter(r => studentIds.has(r.studentId));
  }, [records, classStudents]);

  const handleHealthAnalysis = async () => {
    if (classStudents.length === 0) {
      toast('Không có học sinh trong lớp này để phân tích!', 'error');
      return;
    }
    setLoading(true);
    try {
      const res = await analyzeClassHealth(classStudents, classRecords, activeClass);
      setHealthResult(res);
    } catch(e) {
      toast('Lỗi khi gọi API. Bạn đã cấu hình GEMINI_API_KEY chưa?', 'error');
    }
    setLoading(false);
  };

  const handleMenuSuggest = async () => {
    if (classStudents.length === 0) {
      toast('Không có học sinh trong lớp này để gợi ý!', 'error');
      return;
    }
    setLoading(true);
    try {
      const avgCal = 650; // Mock avg lunch
      // Gather allergies
      const allergies = Array.from(new Set(classStudents.flatMap(s => s.allergies || []))) as string[];
      const res = await suggestWeeklyMenu(avgCal, allergies);
      setMenuResult(res);
    } catch(e) {
      toast('Lỗi khi gọi API. Bạn đã cấu hình GEMINI_API_KEY chưa?', 'error');
    }
    setLoading(false);
  };

  const handleReportGenerate = async () => {
    if (classStudents.length === 0) {
      toast('Không có học sinh trong lớp này để tạo báo cáo!', 'error');
      return;
    }
    setLoading(true);
    try {
      const avgBMI = classStudents.reduce((acc, s) => acc + s.weight / Math.pow(s.height/100, 2), 0) / classStudents.length;
      const res = await generateClassReport(activeClass, { students: classStudents.length, avgBMI });
      setReportResult(res);
    } catch(e) {
      toast('Lỗi khi gọi API. Bạn đã cấu hình GEMINI_API_KEY chưa?', 'error');
    }
    setLoading(false);
  };

  return (
    <div className="flex flex-col h-full space-y-6">
      <header className="shrink-0 flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-green-600" /> AI Phân tích & Gợi ý
          </h2>
          <p className="text-slate-500 mt-1">Sử dụng sức mạnh của Gemini 2.0 Flash để đưa ra quyết định dinh dưỡng tốt hơn.</p>
        </div>
        <select 
            value={activeClass}
            onChange={e => setSelectedClass(e.target.value)}
            className="px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none bg-white font-medium"
        >
            {availableClasses.map((c: string) => <option key={c} value={c}>Lớp {c}</option>)}
            {availableClasses.length === 0 && <option value="">Không có lớp</option>}
        </select>
      </header>

      <div className="flex gap-2 border-b border-slate-200 overflow-x-auto">
        <button 
          onClick={() => setActiveTab('health')}
         className={`px-4 py-3 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${activeTab === 'health' ? 'border-green-600 text-green-700' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'}`}
        >
          <div className="flex gap-2 items-center"><ActivityIcon /> Sức khỏe Lớp học</div>
        </button>
        <button 
          onClick={() => setActiveTab('menu')}
          className={`px-4 py-3 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${activeTab === 'menu' ? 'border-green-600 text-green-700' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'}`}
        >
           <div className="flex gap-2 items-center"><CalendarCheck className="w-4 h-4"/> Thực đơn Tuần</div>
        </button>
        <button 
          onClick={() => setActiveTab('report')}
          className={`px-4 py-3 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${activeTab === 'report' ? 'border-green-600 text-green-700' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'}`}
        >
          <div className="flex gap-2 items-center"><ClipboardType className="w-4 h-4"/> Báo cáo BGH</div>
        </button>
      </div>

      <Card className="min-h-[400px] flex flex-col p-6">
        {activeTab === 'health' && (
           <div className="space-y-6 flex-1 flex flex-col">
              <div className="flex justify-between items-center">
                  <p className="text-sm text-slate-600">Phân tích chuyên sâu về tình trạng ăn uống và BMI của lớp {activeClass || '...'} tuần qua.</p>
                  <Button onClick={handleHealthAnalysis} disabled={loading}>{loading ? 'Đang phân tích...' : 'Phân tích ngay'}</Button>
              </div>
              <div className="flex-1 bg-slate-50 rounded-xl p-4 border border-slate-200">
                  {loading ? <Skeleton /> : healthResult ? (
                     <div className="markdown-body prose prose-sm prose-green max-w-none text-slate-700">
                        <Markdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>{healthResult}</Markdown>
                     </div>
                  ) : <div className="h-full flex items-center justify-center text-slate-400 text-sm">Nhấn nút để bắt đầu phân tích AI</div>}
              </div>
           </div>
        )}

        {activeTab === 'menu' && (
           <div className="space-y-6 flex-1 flex flex-col">
              <div className="flex justify-between items-center">
                  <p className="text-sm text-slate-600">Tạo thực đơn 5 ngày dựa trên chuẩn calo và tránh các dị ứng ghi nhận (như Đậu phộng).</p>
                  <Button onClick={handleMenuSuggest} disabled={loading}>{loading ? 'Đang tạo...' : 'Gợi ý thực đơn'}</Button>
              </div>
              <div className="flex-1 bg-slate-50 rounded-xl p-4 border border-slate-200">
                  {loading ? <Skeleton /> : menuResult ? (
                     <div className="markdown-body prose prose-sm prose-green max-w-none text-slate-700">
                       <Markdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>{menuResult}</Markdown>
                     </div>
                  ) : <div className="h-full flex items-center justify-center text-slate-400 text-sm">Nhấn nút để tạo thực đơn</div>}
              </div>
           </div>
        )}

        {activeTab === 'report' && (
           <div className="space-y-6 flex-1 flex flex-col">
              <div className="flex justify-between items-center">
                  <p className="text-sm text-slate-600">Từ động tạo báo cáo văn xuôi chuyên nghiệp gửi cho Ban Giám Hiệu.</p>
                  <Button onClick={handleReportGenerate} disabled={loading}>{loading ? 'Đang viết...' : 'Viết báo cáo'}</Button>
              </div>
              <div className="flex-1 bg-slate-50 rounded-xl p-4 border border-slate-200 relative">
                  {loading ? <Skeleton /> : reportResult ? (
                     <>
                        <div className="markdown-body prose prose-sm prose-green max-w-none text-slate-700 mb-10">
                           <Markdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>{reportResult}</Markdown>
                        </div>
                        <Button variant="outline" size="sm" className="absolute bottom-4 right-4 bg-white" onClick={() => navigator.clipboard.writeText(reportResult)}>Copy</Button>
                     </>
                  ) : <div className="h-full flex items-center justify-center text-slate-400 text-sm">Nhấn nút để AI viết báo cáo</div>}
              </div>
           </div>
        )}
      </Card>
    </div>
  );
}

function Skeleton() {
    return (
        <div className="space-y-4 animate-pulse pt-2">
            <div className="h-4 bg-slate-200 rounded w-3/4"></div>
            <div className="h-4 bg-slate-200 rounded w-full"></div>
            <div className="h-4 bg-slate-200 rounded w-5/6"></div>
            <div className="h-4 bg-slate-200 rounded w-1/2 mt-6"></div>
            <div className="h-4 bg-slate-200 rounded w-full"></div>
        </div>
    )
}

function ActivityIcon() {
    return <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
}
