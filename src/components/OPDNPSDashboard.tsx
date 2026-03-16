import React, { useState } from "react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ComposedChart,
  Legend,
  Cell
} from "recharts";
import {
  ArrowLeft,
  Users,
  Activity,
  Clock,
  AlertTriangle,
  TrendingUp,
  Filter
} from "lucide-react";

interface OPDNPSDashboardProps {
  onBack: () => void;
}

// --- Mock Data ---

// 1. Top Panel KPIs
const kpiData = {
  nps: { score: 68, weekly: 65, mtd: 68, ytd: 72, trend: "+3%" },
  breakdown: { promoters: 75, passives: 18, detractors: 7 },
  responses: { total: 1245, trend: "+12%" },
  tat: { avgHours: 4.2, target: 8, trend: "-1.5h" }
};

// 2. Trends
const npsTrendData = [
  { date: 'Mon', score: 62 },
  { date: 'Tue', score: 65 },
  { date: 'Wed', score: 68 },
  { date: 'Thu', score: 64 },
  { date: 'Fri', score: 71 },
  { date: 'Sat', score: 73 },
  { date: 'Sun', score: 70 },
];

const doctorNPSData = [
  { name: 'Dr. Smith', nps: 85, responses: 120 },
  { name: 'Dr. Jones', nps: 78, responses: 95 },
  { name: 'Dr. Patel', nps: 72, responses: 150 },
  { name: 'Dr. Lee', nps: 65, responses: 80 },
  { name: 'Dr. Garcia', nps: 58, responses: 110 },
];

// Time of Day Heatmap (Waiting Impact)
// x: hour of day, y: generic Y value to spread points, z: waiting time (mins) to determine bubble size/color
const heatmapData = [
  { hour: '08:00', waitInfo: 15, responses: 45, impact: 'Low' },
  { hour: '09:00', waitInfo: 25, responses: 85, impact: 'Medium' },
  { hour: '10:00', waitInfo: 45, responses: 120, impact: 'High' },
  { hour: '11:00', waitInfo: 55, responses: 150, impact: 'High' },
  { hour: '12:00', waitInfo: 30, responses: 90, impact: 'Medium' },
  { hour: '14:00', waitInfo: 20, responses: 60, impact: 'Low' },
  { hour: '15:00', waitInfo: 35, responses: 80, impact: 'Medium' },
  { hour: '16:00', waitInfo: 40, responses: 100, impact: 'High' },
  { hour: '17:00', waitInfo: 25, responses: 70, impact: 'Low' },
];

// 3. Action Panel
const openAlerts = [
  { id: 'TKT-102', patient: 'Rahul S.', nps: 4, issue: 'Wait time > 1hr', age: '4h', dept: 'Cardiology' },
  { id: 'TKT-105', patient: 'Priya M.', nps: 2, issue: 'Staff rude behavior', age: '12h', dept: 'Front Desk' },
  { id: 'TKT-108', patient: 'Amit K.', nps: 5, issue: 'Billing discrepancy', age: '24h', dept: 'Billing' },
  { id: 'TKT-112', patient: 'Sneha R.', nps: 3, issue: 'Pharmacy queue', age: '2h', dept: 'Pharmacy' },
];

const topReasonsData = [
  { reason: 'Waiting time', count: 45 },
  { reason: 'Staff behaviour', count: 28 },
  { reason: 'Billing issues', count: 18 },
  { reason: 'Pharmacy queue', count: 12 },
  { reason: 'Facilities', count: 8 },
];

// 4. Governance View
const footfallNpsData = [
  { week: 'W1', footfall: 850, nps: 65 },
  { week: 'W2', footfall: 920, nps: 63 },
  { week: 'W3', footfall: 880, nps: 68 },
  { week: 'W4', footfall: 1050, nps: 61 }, // Higher footfall -> drop in NPS
  { week: 'W5', footfall: 950, nps: 66 },
];

const deptAccountabilityData = [
  { dept: 'Cardiology', score: 92, target: 90 },
  { dept: 'Neurology', score: 88, target: 90 },
  { dept: 'Orthopedics', score: 85, target: 85 },
  { dept: 'Pediatrics', score: 95, target: 90 },
  { dept: 'ENT', score: 78, target: 85 }, // Needs attention
];

const repeatPatientsData = [
  { category: '1st Visit', nps: 62 },
  { category: '2nd Visit', nps: 68 },
  { category: '3-5 Visits', nps: 75 },
  { category: '>5 Visits', nps: 82 },
];

const COLORS = {
  promoter: "#10b981", // emerald-500
  passive: "#f59e0b",  // amber-500
  detractor: "#ef4444",// red-500
  brand: "#6366f1",    // indigo-500
  brandLight: "#818cf8", // indigo-400
  accent: "#8b5cf6"    // violet-500
};

const OPDNPSDashboard: React.FC<OPDNPSDashboardProps> = ({ onBack }) => {
  const [timeframe, setTimeframe] = useState<"weekly" | "mtd" | "ytd">("mtd");

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-[#0f172a] text-slate-900 dark:text-slate-100 p-4 md:p-8 font-sans">
      
      {/* --- HEADER --- */}
      <div className="max-w-[1600px] mx-auto flex flex-col md:flex-row items-start md:items-center justify-between mb-8 pb-6 border-b border-slate-200 dark:border-slate-800">
        <div>
          <button 
            onClick={onBack}
            className="flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 mb-2 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Admin Panel
          </button>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-3">
            <Activity className="w-8 h-8 text-indigo-500" />
            OPD NPS Dashboard
            <span className="bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 text-xs font-bold px-3 py-1 rounded-full align-middle ml-2 uppercase tracking-wide border border-indigo-200 dark:border-indigo-500/30">
              Leadership View
            </span>
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium">Comprehensive experience tracking and operational governance.</p>
        </div>

        <div className="mt-4 md:mt-0 flex bg-white dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <button 
            onClick={() => setTimeframe("weekly")}
            className={`px-4 py-2 rounded-lg font-bold text-sm transition-all ${timeframe === "weekly" ? "bg-indigo-500 text-white shadow" : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"}`}
          >
            Weekly
          </button>
          <button 
            onClick={() => setTimeframe("mtd")}
            className={`px-4 py-2 rounded-lg font-bold text-sm transition-all ${timeframe === "mtd" ? "bg-indigo-500 text-white shadow" : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"}`}
          >
            MTD
          </button>
          <button 
            onClick={() => setTimeframe("ytd")}
            className={`px-4 py-2 rounded-lg font-bold text-sm transition-all ${timeframe === "ytd" ? "bg-indigo-500 text-white shadow" : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"}`}
          >
            YTD
          </button>
        </div>
      </div>

      <div className="max-w-[1600px] mx-auto space-y-8">
        
        {/* --- 1. TOP PANEL (AT-A-GLANCE) --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* NPS Score Card */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm relative overflow-hidden group hover:border-indigo-400 transition-colors">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110"></div>
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider text-xs">OPD NPS Score</h3>
              <span className="flex items-center gap-1 text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-1 rounded text-xs font-bold">
                <TrendingUp className="w-3 h-3" /> {kpiData.nps.trend}
              </span>
            </div>
            <div className="flex items-baseline gap-2 mb-2">
              <span className="text-5xl font-black text-slate-900 dark:text-white">
                {timeframe === 'weekly' ? kpiData.nps.weekly : timeframe === 'mtd' ? kpiData.nps.mtd : kpiData.nps.ytd}
              </span>
              <span className="text-slate-400 font-medium">/ 100</span>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400">Excellent range (Target &gt; 65)</p>
          </div>

          {/* Breakdown Card */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm hover:border-slate-300 dark:hover:border-slate-600 transition-colors">
            <h3 className="text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider text-xs mb-4">Response Breakdown</h3>
            <div className="flex bg-slate-100 dark:bg-slate-700/50 h-3 rounded-full overflow-hidden mb-4">
              <div style={{ width: `${kpiData.breakdown.promoters}%` }} className="bg-emerald-500 h-full"></div>
              <div style={{ width: `${kpiData.breakdown.passives}%` }} className="bg-amber-500 h-full"></div>
              <div style={{ width: `${kpiData.breakdown.detractors}%` }} className="bg-red-500 h-full"></div>
            </div>
            <div className="flex justify-between text-xs font-bold">
              <div className="flex flex-col items-center"><span className="text-emerald-500">{kpiData.breakdown.promoters}%</span><span className="text-slate-400">Promoters</span></div>
              <div className="flex flex-col items-center"><span className="text-amber-500">{kpiData.breakdown.passives}%</span><span className="text-slate-400">Passives</span></div>
              <div className="flex flex-col items-center"><span className="text-red-500">{kpiData.breakdown.detractors}%</span><span className="text-slate-400">Detractors</span></div>
            </div>
          </div>

          {/* Total Responses */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm hover:border-slate-300 dark:hover:border-slate-600 transition-colors">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider text-xs">Total Responses</h3>
              <span className="flex items-center gap-1 text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-1 rounded text-xs font-bold">
                <TrendingUp className="w-3 h-3" /> {kpiData.responses.trend}
              </span>
            </div>
            <div className="flex items-center gap-4 mb-2">
              <div className="p-3 bg-blue-50 dark:bg-blue-500/10 text-blue-500 rounded-xl">
                <Users className="w-6 h-6" />
              </div>
              <span className="text-4xl font-black text-slate-900 dark:text-white">
                {kpiData.responses.total.toLocaleString()}
              </span>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400">Response rate: 24% of footfalls</p>
          </div>

          {/* TAT Card */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm hover:border-slate-300 dark:hover:border-slate-600 transition-colors">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider text-xs">Avg Complaint TAT</h3>
              <span className="flex items-center gap-1 text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-1 rounded text-xs font-bold">
                <TrendingUp className="w-3 h-3 transform rotate-180" /> {kpiData.tat.trend}
              </span>
            </div>
            <div className="flex items-center gap-4 mb-2">
              <div className="p-3 bg-purple-50 dark:bg-purple-500/10 text-purple-500 rounded-xl">
                <Clock className="w-6 h-6" />
              </div>
              <span className="text-4xl font-black text-slate-900 dark:text-white">
                {kpiData.tat.avgHours} <span className="text-xl text-slate-400 font-medium">hrs</span>
              </span>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400">Target: &lt; {kpiData.tat.target} hrs</p>
          </div>
        </div>

        {/* --- MAIN DASHBOARD GRID --- */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* LEFT COLUMN: Trends & Drill-down (2/3 width) */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* NPS Trend */}
            <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 md:p-8 border border-slate-200 dark:border-slate-700 shadow-sm">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                <Activity className="w-5 h-5 text-indigo-500" /> Date-wise NPS Trend
              </h2>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={npsTrendData} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.2} />
                    <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} domain={[0, 100]} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '12px', color: '#f8fafc', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                      itemStyle={{ color: '#818cf8', fontWeight: 'bold' }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="score" 
                      name="NPS Score"
                      stroke={COLORS.brand} 
                      strokeWidth={4} 
                      dot={{ r: 6, fill: COLORS.brand, strokeWidth: 2, stroke: '#fff' }} 
                      activeDot={{ r: 8, strokeWidth: 0, fill: COLORS.brandLight }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Doctor Wise NPS */}
              <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 md:p-8 border border-slate-200 dark:border-slate-700 shadow-sm">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                  <Users className="w-5 h-5 text-indigo-500" /> Doctor-wise NPS
                </h2>
                <div className="h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={doctorNPSData} layout="vertical" margin={{ top: 0, right: 0, left: -10, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#334155" opacity={0.1} />
                      <XAxis type="number" domain={[0, 100]} hide />
                      <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12, fontWeight: 600}} width={80} />
                      <Tooltip 
                        cursor={{fill: 'rgba(99, 102, 241, 0.05)'}}
                        contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#f8fafc' }}
                      />
                      <Bar dataKey="nps" name="NPS" radius={[0, 4, 4, 0]} barSize={20}>
                        {doctorNPSData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.nps >= 70 ? COLORS.promoter : entry.nps >= 60 ? COLORS.passive : COLORS.detractor} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Patient Wait Time Heatmap Context */}
              <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-indigo-500" /> Wait Time Impact
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">Time-of-day vs Wait Time (mins)</p>
                <div className="h-[230px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={heatmapData} margin={{ top: 10, right: 10, left: -30, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.1} />
                      <XAxis dataKey="hour" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 10}} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 10}} />
                      <Tooltip 
                        cursor={{fill: 'rgba(239, 68, 68, 0.05)'}}
                        contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#f8fafc' }}
                        formatter={(value: any) => [`${value} mins`, 'Avg Wait Time']}
                      />
                      <Bar dataKey="waitInfo" radius={[4, 4, 0, 0]}>
                        {heatmapData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.waitInfo >= 40 ? COLORS.detractor : entry.waitInfo >= 25 ? COLORS.passive : COLORS.promoter} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
            
            {/* Governance View: Full Width embedded inside left column */}
            <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 md:p-8 border border-slate-200 dark:border-slate-700 shadow-sm relative overflow-hidden">
               {/* Background subtle decoration */}
               <div className="absolute -right-20 -bottom-20 opacity-[0.03] pointer-events-none">
                <Users className="w-96 h-96" />
              </div>

              <h2 className="text-xl font-extrabold text-slate-900 dark:text-white mb-8 flex items-center gap-2">
                <Shield className="w-6 h-6 text-indigo-500" /> Governance & Correlation
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                {/* NPS vs Footfalls */}
                <div>
                  <h3 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-6">NPS vs OPD Footfalls</h3>
                  <div className="h-[250px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <ComposedChart data={footfallNpsData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.1} />
                        <XAxis dataKey="week" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
                        <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                        <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} domain={[0, 100]} />
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#f8fafc' }}
                        />
                        <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                        <Bar yAxisId="left" dataKey="footfall" name="OPD Footfalls" fill="#94a3b8" radius={[4, 4, 0, 0]} barSize={30} opacity={0.5} />
                        <Line yAxisId="right" type="monotone" dataKey="nps" name="NPS" stroke={COLORS.brand} strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                      </ComposedChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Repeat Patients & Dept Accountability */}
                <div className="space-y-6">
                  {/* Repeat Patients */}
                  <div>
                    <h3 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-4">Patient Loyalty (Visits vs NPS)</h3>
                    <div className="flex gap-2">
                      {repeatPatientsData.map((data, idx) => (
                        <div key={idx} className="flex-1 bg-slate-50 dark:bg-slate-900 rounded-xl p-3 border border-slate-100 dark:border-slate-800 text-center">
                          <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">{data.category}</p>
                          <p className={`text-lg font-black ${data.nps >= 70 ? 'text-emerald-500' : 'text-indigo-500'}`}>{data.nps}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Dept Accountability */}
                  <div>
                    <h3 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-4 flex justify-between items-center">
                      Departmental Accountability 
                      <span className="text-xs font-normal Normal normal-case bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded text-slate-500 dark:text-slate-300">Target vs Actual</span>
                    </h3>
                    <div className="space-y-3">
                      {deptAccountabilityData.slice(0, 3).map((dept, idx) => (
                        <div key={idx}>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="font-semibold text-slate-700 dark:text-slate-300">{dept.dept}</span>
                            <span className="font-bold text-slate-900 dark:text-white">{dept.score} <span className="text-xs text-slate-500 font-normal">/ {dept.target}</span></span>
                          </div>
                          <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden relative">
                            <div 
                              className={`h-full rounded-full ${dept.score >= dept.target ? 'bg-emerald-500' : dept.score >= dept.target - 5 ? 'bg-amber-500' : 'bg-red-500'}`} 
                              style={{ width: `${(dept.score / 100) * 100}%` }}
                            ></div>
                            {/* Target Marker */}
                            <div 
                              className="absolute top-0 bottom-0 w-1 bg-slate-900 dark:bg-white z-10"
                              style={{ left: `${dept.target}%` }}
                            ></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN: Action Panel (1/3 width) */}
          <div className="space-y-8">
            
            {/* Top 5 Issues */}
            <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm relative">
              <div className="absolute top-0 right-0 w-24 h-24 bg-red-500/5 rounded-bl-full rounded-tr-3xl -z-0"></div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2 relative z-10">
                <AlertTriangle className="w-5 h-5 text-red-500" /> Top Issue Drivers
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-6 relative z-10">Auto-tagged from negative feedback</p>
              
              <div className="space-y-4">
                {topReasonsData.map((item, idx) => (
                  <div key={idx} className="relative">
                    <div className="flex justify-between text-sm mb-1 z-10 relative">
                      <span className="font-semibold text-slate-700 dark:text-slate-300">{item.reason}</span>
                      <span className="font-bold text-slate-900 dark:text-white">{item.count}</span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-700/50 rounded-full h-2">
                      <div 
                        className="bg-red-400/80 h-2 rounded-full" 
                        style={{ width: `${(item.count / topReasonsData[0].count) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Open Alerts List */}
            <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col h-[calc(100%-400px)] min-h-[400px]">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Filter className="w-5 h-5 text-amber-500" /> Active Alerts
                </h2>
                <span className="bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400 text-xs font-bold px-2 py-1 rounded border border-red-200 dark:border-red-500/30">
                  {openAlerts.length} Critical
                </span>
              </div>
              
              <div className="flex-1 overflow-y-auto pr-2 space-y-3 custom-scrollbar">
                {openAlerts.map((alert) => (
                  <div key={alert.id} className="p-4 rounded-xl border border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors group">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono text-slate-500">{alert.id}</span>
                        <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">NPS: {alert.nps}</span>
                      </div>
                      <span className="text-xs font-bold text-red-500 flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {alert.age}
                      </span>
                    </div>
                    
                    <h4 className="font-bold text-slate-900 dark:text-white text-sm mb-1">{alert.issue}</h4>
                    
                    <div className="flex justify-between items-end mt-3">
                      <div className="text-xs text-slate-500 dark:text-slate-400">
                        Patient: <span className="text-slate-700 dark:text-slate-300 font-semibold">{alert.patient}</span>
                      </div>
                      <div className="text-[10px] uppercase font-bold tracking-wider text-indigo-500 bg-indigo-50 dark:bg-indigo-500/10 px-2 py-1 rounded">
                        {alert.dept}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <button className="w-full mt-4 py-3 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl font-bold text-slate-700 dark:text-slate-300 hover:border-indigo-500 dark:hover:border-indigo-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors text-sm">
                View All Unresolved Issues
              </button>
            </div>

          </div>
        </div>

      </div>

      {/* Internal CSS for custom scrollbar hidden mostly */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 4px;
        }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #334155;
        }
      `}</style>
    </div>
  );
};

// Hack to add an icon if missing from import list locally
const Shield = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
  </svg>
);

export default OPDNPSDashboard;
