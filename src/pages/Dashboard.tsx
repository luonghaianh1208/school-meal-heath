import { useState, useMemo } from 'react';
import { Card, Badge, Button } from '../components/ui';
import { useStudents } from '../hooks/useStudents';
import { useMealRecords, useAlerts } from '../hooks/useMealRecords';
import { analyzeClassHealth } from '../lib/gemini';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { format, subDays } from 'date-fns';
import { Sparkles, Users, Utensils, BellRing, TrendingUp, X } from 'lucide-react';
import Markdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';

export default function Dashboard() {
  const { students } = useStudents();
  const { alerts } = useAlerts();
  const todayStr = format(new Date(), 'yyyy-MM-dd');
  const { records: todayRecords } = useMealRecords(todayStr); // Only fetches today due to hook impl, 
  // Wait, useMealRecords can fetch all if no date provided. Let's fetch all to calc weekly stats.
  const { records: allRecords, loading } = useMealRecords();

  const [aiReport, setAiReport] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);

  // Compute metrics
  const totalStudents = students.length;
  const todayMealCount = allRecords.filter(r => r.date === todayStr).length;
  
  // Last 7 days data for charts
  const last7Days = useMemo(() => {
    const days = [];
    for(let i=6; i>=0; i--) {
      days.push(format(subDays(new Date(), i), 'yyyy-MM-dd'));
    }
    return days;
  }, []);

  const weeklyData = useMemo(() => {
    return last7Days.map(date => {
      const dayRecords = allRecords.filter(r => r.date === date);
      const sufficient = dayRecords.filter(r => r.eatLevel >= 75).length;
      return {
        date: date.substring(5), // MM-DD
        'Ăn đủ (%)': dayRecords.length ? Math.round((sufficient / dayRecords.length) * 100) : 0
      };
    });
  }, [allRecords, last7Days]);

  const weeklySufficiency = weeklyData.length ? Math.round(weeklyData.reduce((acc, curr) => acc + curr['Ăn đủ (%)'], 0) / 7) : 0;

  const todayPieData = useMemo(() => {
    const dayRecords = allRecords.filter(r => r.date === todayStr);
    const counts = { '100%': 0, '75%': 0, '50%': 0, '25%': 0, '0%': 0 };
    dayRecords.forEach(r => {
      if(r.eatLevel === 100) counts['100%']++;
      else if(r.eatLevel === 75) counts['75%']++;
      else if(r.eatLevel === 50) counts['50%']++;
      else if(r.eatLevel === 25) counts['25%']++;
      else counts['0%']++;
    });
    return [
      { name: 'Ăn hết', value: counts['100%'], color: '#16a34a' },
      { name: '75%', value: counts['75%'], color: '#86efac' },
      { name: '50%', value: counts['50%'], color: '#fcd34d' },
      { name: '25%', value: counts['25%'], color: '#fb923c' },
      { name: 'Không ăn', value: counts['0%'], color: '#ef4444' },
    ].filter(d => d.value > 0);
  }, [allRecords, todayStr]);

  const handleAiAnalysis = async () => {
    setIsAiLoading(true);
    try {
      // Analyze for the whole school/dashboard context. Default to 6A for demo or all.
      const report = await analyzeClassHealth(students, allRecords, "Toàn trường");
      setAiReport(report);
    } catch(e) {
      setAiReport("Có lỗi xảy ra khi gọi AI.");
    } finally {
      setIsAiLoading(false);
    }
  };

  if(loading) return <div className="p-8 animate-pulse space-y-4"><div className="h-32 bg-slate-200 rounded-xl"></div><div className="h-64 bg-slate-200 rounded-xl"></div></div>;

  return (
    <div className="flex flex-col h-full space-y-4">
      <header className="flex justify-between items-center shrink-0">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Tổng quan sức khỏe</h2>
          <p className="text-slate-500 mt-1">Hôm nay, {format(new Date(), 'dd/MM/yyyy')}</p>
        </div>
        <Button onClick={handleAiAnalysis} className="gap-2 shadow-sm font-medium h-auto py-2 px-4 shadow-green-600/20">
          <Sparkles className="w-4 h-4" />
          <span className="hidden sm:inline">Phân tích Gemini AI</span>
        </Button>
      </header>

      {/* Bento Grid Container */}
      <div className="grid grid-cols-1 md:grid-cols-12 lg:grid-rows-[auto_auto_auto] gap-4 mb-8">
        {/* Metric 1 */}
        <Card className="col-span-1 md:col-span-6 lg:col-span-3 flex flex-col justify-center">
          <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-2">Tổng học sinh</p>
          <p className="text-3xl font-black text-slate-900">{totalStudents}</p>
        </Card>

        {/* Metric 2 */}
        <Card className="col-span-1 md:col-span-6 lg:col-span-3 flex flex-col justify-center">
           <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-2">Đã điểm danh ăn</p>
           <p className="text-3xl font-black text-emerald-600">{todayMealCount}/{totalStudents}</p>
        </Card>

        {/* Metric 3 */}
        <Card className="col-span-1 md:col-span-6 lg:col-span-3 flex flex-col justify-center">
           <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-2">Cảnh báo mới</p>
           <p className="text-3xl font-black text-amber-500">{alerts.length}</p>
        </Card>

        {/* Metric 4 */}
        <Card className="col-span-1 md:col-span-6 lg:col-span-3 flex flex-col justify-center">
           <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-2">% Ăn đủ (tuần)</p>
           <p className="text-3xl font-black text-slate-900">{weeklySufficiency}%</p>
        </Card>

        {/* Chart Section */}
        <Card className="col-span-1 md:col-span-12 lg:col-span-8 lg:row-span-3 flex flex-col min-h-[300px]">
          <h3 className="text-sm font-bold text-slate-900 mb-4">Xu hướng Calo Tiêu thụ (7 ngày)</h3>
          <div className="flex-1 w-full min-h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <defs>
                   <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.2}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#64748b', fontWeight: 'bold'}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#64748b', fontWeight: 'bold'}} />
                <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{borderRadius: '12px', border: '1px solid #f1f5f9', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                <Bar dataKey="Ăn đủ (%)" fill="url(#colorUv)" radius={[4, 4, 0, 0]} maxBarSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Alerts List */}
        <Card className="col-span-1 md:col-span-6 lg:col-span-4 lg:row-span-3 flex flex-col min-h-[300px]">
           <div className="flex justify-between items-center mb-4">
             <h3 className="text-sm font-bold text-slate-900">Cảnh báo sức khỏe</h3>
             <Button variant="ghost" className="text-[10px] uppercase font-bold h-7 px-2">Xem tất cả</Button>
           </div>
           <div className="space-y-3 flex-1 overflow-y-auto pr-1">
             {alerts.slice(0, 5).map(alert => {
                 const isHigh = alert.severity === 'high';
                 const isMedium = alert.severity === 'medium';
                 return (
                   <div key={alert.id} className={`p-3 border-l-4 rounded-r-lg ${isHigh ? 'border-red-500 bg-red-50' : isMedium ? 'border-amber-500 bg-amber-50' : 'border-blue-500 bg-blue-50'}`}>
                      <div className="flex justify-between items-start mb-1">
                         <span className="font-bold text-xs text-slate-900">{alert.studentName}</span>
                         <span className={`text-[9px] font-bold uppercase ${isHigh ? 'text-red-600' : isMedium ? 'text-amber-600' : 'text-blue-600'}`}>
                             {alert.type === 'underweight' ? 'Thiếu cân' : alert.type === 'overweight' ? 'Thừa cân' : 'Theo dõi'}
                         </span>
                      </div>
                      <p className="text-[11px] text-slate-600 mt-0.5">{alert.message} (Lớp {alert.className})</p>
                   </div>
                 )
             })}
             {alerts.length === 0 && <p className="text-sm text-slate-500 py-4 text-center">Không có cảnh báo nào.</p>}
           </div>
        </Card>

        {/* Pie chart / Today's dist */}
        <Card className="col-span-1 md:col-span-6 lg:col-span-5 lg:row-span-2 flex flex-col min-h-[250px]">
          <h3 className="text-sm font-bold text-slate-900 mb-2">Đánh giá bữa trưa hôm nay</h3>
          {todayPieData.length > 0 ? (
             <div className="flex-1 min-h-[160px] flex items-center justify-center relative">
               <ResponsiveContainer width="100%" height="100%">
                 <PieChart>
                   <Pie data={todayPieData} innerRadius={50} outerRadius={70} paddingAngle={2} dataKey="value" stroke="none">
                     {todayPieData.map((entry, index) => (
                       <Cell key={`cell-${index}`} fill={entry.color} />
                     ))}
                   </Pie>
                   <Tooltip contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                 </PieChart>
               </ResponsiveContainer>
               <div className="absolute inset-0 flex flex-wrap items-end justify-center gap-x-3 gap-y-1 pb-2">
                 {todayPieData.map(d => (
                     <div key={d.name} className="flex items-center gap-1 text-[10px] font-bold text-slate-600">
                         <div className="w-2 h-2 rounded-full" style={{backgroundColor: d.color}}></div>
                         {d.name}
                     </div>
                 ))}
               </div>
             </div>
          ) : (
            <div className="flex-1 flex items-center justify-center text-sm text-slate-500">Chưa có dữ liệu hôm nay</div>
          )}
        </Card>

        {/* AI Insight Panel */}
        <div className="col-span-1 md:col-span-12 lg:col-span-7 lg:row-span-2 bg-gradient-to-br from-green-600 to-emerald-700 p-5 rounded-2xl shadow-lg relative overflow-hidden flex flex-col min-h-[200px]">
            <div className="absolute -right-4 -bottom-4 opacity-10 pointer-events-none">
              <svg width="120" height="120" viewBox="0 0 24 24" fill="white"><path d="M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71z"/></svg>
            </div>
            <div className="flex items-center gap-2 mb-3 text-white/90 z-10">
              <Sparkles className="w-5 h-5 fill-current" />
              <h3 className="font-bold">Gemini AI Nutrition Report</h3>
              {isAiLoading && <span className="ml-auto text-xs opacity-70 animate-pulse">Đang phân tích...</span>}
            </div>
            <div className="text-white/85 text-xs sm:text-sm flex-1 overflow-y-auto leading-relaxed pr-2 z-10">
                {aiReport ? (
                    <div className="markdown-body prose prose-invert prose-sm max-w-none">
                      <Markdown rehypePlugins={[rehypeRaw]}>{aiReport}</Markdown>
                    </div>
                ) : (
                    <div className="flex flex-col h-full justify-center">
                       <p className="mb-4">Hệ thống AI đã sẵn sàng tổng hợp số liệu và phân tích dinh dưỡng cho lớp học. Nhấn nút Phân tích phía trên để bắt đầu.</p>
                       <div className="flex gap-2">
                          <span className="bg-white/20 text-white text-[10px] px-3 py-1 rounded-full font-bold shadow-sm whitespace-nowrap">+15% Protein</span>
                          <span className="bg-white/20 text-white text-[10px] px-3 py-1 rounded-full font-bold shadow-sm whitespace-nowrap">-10% Tinh bột</span>
                       </div>
                    </div>
                )}
            </div>
        </div>
      </div>

      {/* Legacy AI Modal removed since report is embedded */}
    </div>
  );
}
