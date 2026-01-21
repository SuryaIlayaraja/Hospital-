import React, { useState, useEffect } from "react";
import { 
  getDaywiseAnalysis, 
  getMonthlyAnalysis, 
  getYearlyAnalysis,
  DaywiseAnalysis,
  MonthlyAnalysis,
  YearlyAnalysis
} from "../services/apiService";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

interface DaywiseAnalysisPageProps {
  onBack: () => void;
}

const COLORS = ["#ff4d4f", "#eab308", "#52c41a"];
const LABELS = ["Will Not Recommend", "May Recommend", "Will Recommend"];

const DaywiseAnalysisPage: React.FC<DaywiseAnalysisPageProps> = ({
  onBack,
}) => {
  const [dayData, setDayData] = useState<DaywiseAnalysis[]>([]);
  const [monthData, setMonthData] = useState<MonthlyAnalysis[]>([]);
  const [yearData, setYearData] = useState<YearlyAnalysis[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [feedbackType, setFeedbackType] = useState<"all" | "opd" | "ipd">("all");
  const [analysisView, setAnalysisView] = useState<"day" | "monthDetail" | "month" | "year">("day");
  
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth() + 1);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        let startStr, endStr;

        if (analysisView === "day") {
          const today = new Date();
          const startDate = new Date(today);
          startDate.setDate(today.getDate() - 5);
          startStr = startDate.toISOString().split("T")[0];
          endStr = today.toISOString().split("T")[0];
        } else {
          // Both MonthDetail and MonthlyTrends (for the selected month's context) use full month days for daily breakdown if needed
          const firstDay = new Date(selectedYear, selectedMonth - 1, 1);
          const lastDay = new Date(selectedYear, selectedMonth, 0);
          startStr = firstDay.toISOString().split("T")[0];
          endStr = lastDay.toISOString().split("T")[0];
        }

        const [dayRes, monthRes, yearRes] = await Promise.all([
          getDaywiseAnalysis(startStr, endStr, feedbackType),
          getMonthlyAnalysis(selectedYear, feedbackType),
          getYearlyAnalysis(feedbackType)
        ]);

        if (dayRes.success && dayRes.data) setDayData(dayRes.data);
        if (monthRes.success && monthRes.data) setMonthData(monthRes.data);
        if (yearRes.success && yearRes.data) setYearData(yearRes.data);

        if (!dayRes.success && !monthRes.success && !yearRes.success) {
          setError("Failed to fetch analysis data");
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch data");
        console.error("Error fetching analysis:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [feedbackType, selectedYear, selectedMonth, analysisView]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] p-8 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full border-4 border-gray-800 border-t-indigo-500 animate-spin"></div>
          <div className="text-xl text-gray-400 font-bold tracking-widest animate-pulse">GENERATING ANALYTICS...</div>
        </div>
      </div>
    );
  }

  const currentMonthName = new Date(selectedYear, selectedMonth - 1).toLocaleString('default', { month: 'long' });

  return (
    <div className="min-h-screen bg-[#0a0a0a] p-8 text-white">
      <div className="max-w-7xl mx-auto">
        {/* Header with Back Button */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-black bg-gradient-to-r from-indigo-400 via-purple-400 to-indigo-500 bg-clip-text text-transparent">
              {analysisView === 'day' ? 'Daily Analysis (Recent)' : 
               analysisView === 'monthDetail' ? `${currentMonthName} ${selectedYear} Detail` :
               analysisView === 'month' ? `Monthly Trends (${selectedYear})` : 
               'Yearly Progress'}
            </h1>
            <p className="text-gray-400 mt-2 font-medium">
              {analysisView === 'day' ? 'Quick overview of sentiment from the past 6 days' : 
               analysisView === 'monthDetail' ? `Day-by-day analysis for the month of ${currentMonthName}` :
               analysisView === 'month' ? `Recommendation trends for each month in ${selectedYear}` : 
               'Long-term hospital performance tracking'}
            </p>
          </div>
          <button
            onClick={onBack}
            className="px-6 py-2 bg-gray-800/50 text-gray-300 border border-gray-700 rounded-lg hover:bg-gray-800 hover:text-white transition-all duration-200 font-medium backdrop-blur-sm"
          >
            ← Back to Admin
          </button>
        </div>

        {/* View Switcher, Selectors and Feedback Type Toggle */}
        <div className="mb-8 space-y-4">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between bg-gradient-to-r from-gray-800/50 to-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-2xl shadow-xl p-6">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex bg-black/40 p-1 rounded-xl border border-gray-700">
                <button
                  onClick={() => setAnalysisView("day")}
                  className={`px-4 py-2 rounded-lg font-bold transition-all duration-300 ${
                    analysisView === "day"
                      ? "bg-indigo-500 text-white shadow-lg"
                      : "text-gray-500 hover:text-gray-300"
                  }`}
                >
                  Recent
                </button>
                <button
                  onClick={() => setAnalysisView("monthDetail")}
                  className={`px-4 py-2 rounded-lg font-bold transition-all duration-300 ${
                    analysisView === "monthDetail"
                      ? "bg-indigo-500 text-white shadow-lg"
                      : "text-gray-500 hover:text-gray-300"
                  }`}
                >
                  Month Detail
                </button>
                <button
                  onClick={() => setAnalysisView("month")}
                  className={`px-4 py-2 rounded-lg font-bold transition-all duration-300 ${
                    analysisView === "month"
                      ? "bg-indigo-500 text-white shadow-lg"
                      : "text-gray-500 hover:text-gray-300"
                  }`}
                >
                  Yearly Trends
                </button>
                <button
                  onClick={() => setAnalysisView("year")}
                  className={`px-4 py-2 rounded-lg font-bold transition-all duration-300 ${
                    analysisView === "year"
                      ? "bg-indigo-500 text-white shadow-lg"
                      : "text-gray-500 hover:text-gray-300"
                  }`}
                >
                  Year-over-Year
                </button>
              </div>

              <div className="h-8 w-[1px] bg-gray-700 hidden sm:block"></div>

              <div className="flex items-center gap-2">
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                  className="bg-gray-800 border border-gray-700 text-white px-3 py-2 rounded-xl font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                >
                  {[2023, 2024, 2025, 2026].map((y) => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
                <select
                  value={selectedMonth}
                  onChange={(e) => {
                    setSelectedMonth(parseInt(e.target.value));
                    if (analysisView === "year") setAnalysisView("month");
                  }}
                  className="bg-gray-800 border border-gray-700 text-white px-3 py-2 rounded-xl font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                >
                  {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                    <option key={m} value={m}>
                      {new Date(2000, m - 1).toLocaleString('default', { month: 'long' })}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-gray-400 font-bold text-sm uppercase tracking-wider mr-2">Filter:</span>
              <div className="flex bg-black/40 p-1 rounded-xl border border-gray-700">
                <button
                  onClick={() => setFeedbackType("all")}
                  className={`px-4 py-2 rounded-lg font-bold transition-all duration-300 ${
                    feedbackType === "all"
                      ? "bg-blue-600 text-white"
                      : "text-gray-500 hover:text-gray-300"
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setFeedbackType("opd")}
                  className={`px-4 py-2 rounded-lg font-bold transition-all duration-300 ${
                    feedbackType === "opd"
                      ? "bg-cyan-600 text-white"
                      : "text-gray-500 hover:text-gray-300"
                  }`}
                >
                  OPD
                </button>
                <button
                  onClick={() => setFeedbackType("ipd")}
                  className={`px-4 py-2 rounded-lg font-bold transition-all duration-300 ${
                    feedbackType === "ipd"
                      ? "bg-purple-600 text-white"
                      : "text-gray-500 hover:text-gray-300"
                  }`}
                >
                  IPD
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-500/10 border border-red-500 text-red-500 px-6 py-4 rounded-xl mb-8 flex items-center gap-3">
             <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
             <p className="font-semibold">{error}</p>
          </div>
        )}

        {/* Charts Section */}
        {analysisView === "day" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {(() => {
              let displayDays: DaywiseAnalysis[] = [];
              const today = new Date();
              for (let i = 5; i >= 0; i--) {
                const date = new Date(today);
                date.setDate(today.getDate() - i);
                const dateStr = date.toISOString().split("T")[0];
                const dayFound = dayData.find((d) => d.day === dateStr);
                displayDays.push(dayFound || {
                  day: dateStr,
                  willRecommend: "0.0",
                  mayRecommend: "0.0",
                  willNotRecommend: "0.0",
                  total: 0,
                });
              }

              return displayDays.map((d) => {
                const chartData = [
                  { name: LABELS[0], value: parseFloat(d.willNotRecommend) },
                  { name: LABELS[1], value: parseFloat(d.mayRecommend) },
                  { name: LABELS[2], value: parseFloat(d.willRecommend) },
                ];
                const dateObj = new Date(d.day);
                return (
                  <div key={d.day} className="bg-gradient-to-br from-gray-800/40 to-gray-900/40 backdrop-blur-sm border border-gray-800 p-8 rounded-3xl shadow-2xl flex flex-col items-center group hover:border-indigo-500/30 transition-all duration-500">
                    <h3 className="text-2xl font-black text-white mb-1">{dateObj.toLocaleDateString('en-US', { weekday: 'long' })}</h3>
                    <p className="text-gray-500 font-bold mb-6">{dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                    
                    {d.total === 0 ? (
                      <div className="h-[250px] flex items-center justify-center">
                        <div className="text-gray-600 font-bold italic">No feedback today</div>
                      </div>
                    ) : (
                      <ResponsiveContainer width="100%" height={250}>
                        <PieChart>
                          <Pie
                            data={chartData}
                            innerRadius={60}
                            outerRadius={90}
                            paddingAngle={8}
                            dataKey="value"
                            stroke="none"
                          >
                            {chartData.map((_, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index]} />
                            ))}
                          </Pie>
                          <Tooltip 
                            contentStyle={{ backgroundColor: '#111', border: '1px solid #333', borderRadius: '12px' }}
                            itemStyle={{ fontWeight: 'bold' }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    )}
                    
                    <div className="w-full mt-6 pt-6 border-t border-gray-800">
                      <p className="text-center text-gray-400 font-bold mb-4">Responses: <span className="text-white">{d.total}</span></p>
                      <div className="space-y-2">
                        {LABELS.map((label, idx) => (
                          <div key={label} className="flex justify-between items-center text-sm">
                            <span className="text-gray-500 font-bold uppercase tracking-tighter text-xs">{label}</span>
                            <span className={`font-black ${idx === 0 ? 'text-red-400' : idx === 1 ? 'text-yellow-400' : 'text-green-400'}`}>
                              {idx === 0 ? d.willNotRecommend : idx === 1 ? d.mayRecommend : d.willRecommend}%
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              });
            })()}
          </div>
        )}

        {analysisView === "monthDetail" && (
          <div className="bg-gradient-to-br from-gray-800/40 to-gray-900/40 backdrop-blur-sm border border-gray-800 p-8 rounded-3xl shadow-2xl">
            <h2 className="text-2xl font-black text-white mb-8 flex items-center gap-3">
              <div className="w-2 h-8 bg-indigo-500 rounded-full"></div>
              {currentMonthName} {selectedYear} Daily Breakdown
            </h2>
            {(() => {
              const daysInMonth = new Date(selectedYear, selectedMonth, 0).getDate();
              const displayDays: DaywiseAnalysis[] = [];
              for (let i = 1; i <= daysInMonth; i++) {
                const dateStr = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
                const dayFound = dayData.find((d) => d.day === dateStr);
                displayDays.push(dayFound || {
                  day: dateStr,
                  willRecommend: "0.0",
                  mayRecommend: "0.0",
                  willNotRecommend: "0.0",
                  total: 0,
                });
              }

              const hasData = dayData.some(d => d.total > 0);

              return !hasData ? (
                <div className="h-[400px] flex items-center justify-center text-gray-500 font-bold border border-dashed border-gray-700 rounded-2xl">
                  No records found for {currentMonthName} {selectedYear}
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={500}>
                  <BarChart data={displayDays} margin={{ bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                    <XAxis 
                      dataKey="day" 
                      stroke="#999" 
                      tickFormatter={(v) => new Date(v).getDate().toString()} 
                      label={{ value: 'Day of Month', position: 'insideBottom', offset: -10, fill: '#666', fontWeight: 'bold' }}
                    />
                    <YAxis stroke="#999" unit="%" />
                    <Tooltip 
                      cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                      contentStyle={{ backgroundColor: '#111', border: '1px solid #333', borderRadius: '12px' }}
                      labelFormatter={(label) => new Date(label).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    />
                    <Bar dataKey="willRecommend" name="Will Recommend" fill={COLORS[2]} stackId="a" />
                    <Bar dataKey="mayRecommend" name="May Recommend" fill={COLORS[1]} stackId="a" />
                    <Bar dataKey="willNotRecommend" name="Will Not Recommend" fill={COLORS[0]} stackId="a" radius={[10, 10, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              );
            })()}
          </div>
        )}

        {analysisView === "month" && (
          <div className="bg-gradient-to-br from-gray-800/40 to-gray-900/40 backdrop-blur-sm border border-gray-800 p-8 rounded-3xl shadow-2xl">
             <h2 className="text-2xl font-black text-white mb-8 flex items-center gap-3">
               <div className="w-2 h-8 bg-indigo-500 rounded-full"></div>
               Monthly Trends for {selectedYear}
             </h2>
             {(() => {
                // Ensure all 12 months are present for the selected year
                const fullMonthData = Array.from({ length: 12 }, (_, i) => {
                  const m = String(i + 1).padStart(2, '0');
                  const monthKey = `${selectedYear}-${m}`;
                  const existing = monthData.find(d => d.month === monthKey);
                  return existing || {
                    month: monthKey,
                    willRecommend: "0.0",
                    mayRecommend: "0.0",
                    willNotRecommend: "0.0",
                    total: 0
                  };
                });

                const hasData = monthData.length > 0;

                return !hasData ? (
                  <div className="h-[400px] flex items-center justify-center text-gray-500 font-bold border border-dashed border-gray-700 rounded-2xl">
                    No records found for the year {selectedYear}
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={400}>
                    <BarChart data={fullMonthData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                      <XAxis dataKey="month" stroke="#999" tickFormatter={(v) => new Date(v).toLocaleDateString('en-US', { month: 'short' })} />
                      <YAxis stroke="#999" unit="%" />
                      <Tooltip 
                        cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                        contentStyle={{ backgroundColor: '#111', border: '1px solid #333', borderRadius: '12px' }}
                      />
                      <Bar dataKey="willRecommend" name="Will Recommend" fill={COLORS[2]} stackId="a" />
                      <Bar dataKey="mayRecommend" name="May Recommend" fill={COLORS[1]} stackId="a" />
                      <Bar dataKey="willNotRecommend" name="Will Not Recommend" fill={COLORS[0]} stackId="a" radius={[10, 10, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                );
             })()}
          </div>
        )}

        {analysisView === "year" && (
          <div className="bg-gradient-to-br from-gray-800/40 to-gray-900/40 backdrop-blur-sm border border-gray-800 p-8 rounded-3xl shadow-2xl">
             <h2 className="text-2xl font-black text-white mb-8 flex items-center gap-3">
               <div className="w-2 h-8 bg-purple-500 rounded-full"></div>
               Yearly Progress Comparison
             </h2>
             {yearData.length === 0 ? (
               <div className="h-[400px] flex items-center justify-center text-gray-500 font-bold">No yearly data available</div>
             ) : (
             <ResponsiveContainer width="100%" height={400}>
                <BarChart data={yearData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" horizontal={false} />
                  <XAxis type="number" stroke="#999" unit="%" />
                  <YAxis dataKey="year" type="category" stroke="#999" />
                  <Tooltip 
                    cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                    contentStyle={{ backgroundColor: '#111', border: '1px solid #333', borderRadius: '12px' }}
                  />
                  <Bar dataKey="willRecommend" name="Will Recommend" fill={COLORS[2]} radius={[0, 10, 10, 0]} />
                  <Bar dataKey="mayRecommend" name="May Recommend" fill={COLORS[1]} radius={[0, 10, 10, 0]} />
                  <Bar dataKey="willNotRecommend" name="Will Not Recommend" fill={COLORS[0]} radius={[0, 10, 10, 0]} />
                </BarChart>
             </ResponsiveContainer>
             )}
          </div>
        )}

        {/* Legend */}
        <div className="mt-8 bg-gradient-to-r from-gray-800/50 to-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-3xl shadow-lg p-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex flex-wrap justify-center gap-8">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 bg-green-500 rounded-lg shadow-lg shadow-green-500/20"></div>
                <span className="text-gray-300 font-bold">Excellent <span className="text-gray-500 font-normal">(Will Recommend)</span></span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 bg-yellow-500 rounded-lg shadow-lg shadow-yellow-500/20"></div>
                <span className="text-gray-300 font-bold">Good <span className="text-gray-500 font-normal">(May Recommend)</span></span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 bg-red-500 rounded-lg shadow-lg shadow-red-500/20"></div>
                <span className="text-gray-300 font-bold">Average/Poor <span className="text-gray-500 font-normal">(Will Not Recommend)</span></span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DaywiseAnalysisPage;
