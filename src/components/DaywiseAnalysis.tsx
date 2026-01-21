import React, { useEffect, useState } from "react";
import { getDaywiseAnalysis } from "../services/apiService";
import type { DaywiseAnalysis } from "../services/apiService";
// You can use any chart library. Here, we use 'recharts' for donut charts.
import {
  PieChart,
  Pie,
  Cell,
  Legend,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const COLORS = ["#ff4d4f", "#ffa940", "#52c41a"]; // Red, Orange, Green
const LABELS = ["Will Not Recommend", "May Recommend", "Will Recommend"];

interface Props {
  start: string; // YYYY-MM-DD
  end: string; // YYYY-MM-DD
}

const DaywiseAnalysis: React.FC<Props> = ({ start, end }) => {
  const [data, setData] = useState<DaywiseAnalysis[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    console.log("Fetching day-wise analysis for:", start, "to", end);
    getDaywiseAnalysis(start, end)
      .then((res) => {
        console.log("API Response:", res);
        if (res.success && res.data) {
          setData(res.data);
          if (res.data.length === 0) {
            setError("No feedback data available for the selected week");
          }
        } else {
          setError(res.message || "Failed to fetch data");
        }
      })
      .catch((e) => {
        console.error("Fetch error:", e);
        setError(e.message || "Error fetching data");
      })
      .finally(() => setLoading(false));
  }, [start, end]);

  if (loading)
    return <div className="text-center p-4">Loading day-wise analysis...</div>;
  if (error)
    return (
      <div style={{ color: "red" }} className="p-4 text-center">
        {error}
      </div>
    );
  if (data.length === 0)
    return (
      <div className="p-4 text-center text-gray-500">No data to display</div>
    );

  return (
    <div>
      <h2 className="text-4xl font-bold mb-8 text-center text-gray-800">
        Day Wise Analysis
      </h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {data.map((dayData) => {
          const chartData = [
            { name: LABELS[0], value: parseFloat(dayData.willNotRecommend) },
            { name: LABELS[1], value: parseFloat(dayData.mayRecommend) },
            { name: LABELS[2], value: parseFloat(dayData.willRecommend) },
          ];
          const dayDate = new Date(dayData.day);
          const dayName = dayDate.toLocaleDateString("en-US", {
            weekday: "long",
          });
          const formattedDate = dayDate.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          });

          return (
            <div
              key={dayData.day}
              className="bg-white rounded-xl shadow-lg p-6 flex flex-col items-center hover:shadow-xl transition-shadow duration-300"
            >
              <h3 className="font-bold text-xl mb-1 text-gray-800">
                {dayName}
              </h3>
              <p className="text-sm text-gray-500 mb-4">{formattedDate}</p>
              <ResponsiveContainer width="100%" height={400}>
                <PieChart>
                  <Pie
                    data={chartData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={80}
                    outerRadius={130}
                    paddingAngle={5}
                    label={({ percent }: { percent?: number }) =>
                      percent !== undefined
                        ? `${(percent * 100).toFixed(1)}%`
                        : ""
                    }
                  >
                    {chartData.map((_, idx) => (
                      <Cell key={`cell-${idx}`} fill={COLORS[idx]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number | undefined) =>
                      value !== undefined ? `${value.toFixed(1)}%` : ""
                    }
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
              <div className="mt-4 text-center">
                <p className="text-sm font-semibold text-gray-600">
                  Total Responses:{" "}
                  <span className="text-lg text-blue-600">{dayData.total}</span>
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default DaywiseAnalysis;
