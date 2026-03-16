import React, { useMemo } from 'react';
import { Ticket } from '../hooks/useTickets';

interface Props {
  tickets: Ticket[];
}

const ComplaintHeatmap: React.FC<Props> = ({ tickets }) => {
  const data = useMemo(() => {
    const categories = Array.from(new Set(tickets.map((t) => t.issueCategory || 'Other'))).sort();
    const departments = Array.from(new Set(tickets.map((t) => t.department || 'Unknown'))).sort();

    let maxCount = 0;
    
    const matrix = departments.map((dept) => {
      const counts: Record<string, number> = {};
      categories.forEach((cat) => {
        const count = tickets.filter(
          (t) => (t.department || 'Unknown') === dept && (t.issueCategory || 'Other') === cat
        ).length;
        counts[cat] = count;
        if (count > maxCount) maxCount = count;
      });
      return { department: dept, counts };
    });

    return { categories, departments, matrix, maxCount };
  }, [tickets]);

  if (tickets.length === 0) return null;

  const getColor = (count: number, max: number) => {
    if (count === 0) return 'bg-gray-100 dark:bg-gray-800/50 text-gray-400 dark:text-gray-500';
    const intensity = Math.max(0.2, count / max);
    
    if (intensity < 0.3) return 'bg-red-200 dark:bg-red-900/30 text-red-800 dark:text-red-300';
    if (intensity < 0.6) return 'bg-red-400 dark:bg-red-700/60 text-white';
    if (intensity < 0.8) return 'bg-red-500 dark:bg-red-600/80 text-white';
    return 'bg-red-600 dark:bg-red-500 text-white';
  };

  return (
    <div className="bg-white dark:bg-gray-900/40 border border-gray-200 dark:border-gray-700 rounded-3xl p-6 mb-8 shadow-sm">
      <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-6 flex items-center gap-2">
        <div className="w-2 h-2 bg-red-500 rounded-full"></div>
        Complaint Heatmap
      </h3>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
        Shows where complaints occur most across departments and issue categories.
      </p>
      
      <div className="overflow-x-auto">
        <table className="w-full text-sm border-separate border-spacing-1">
          <thead>
            <tr>
              <th className="p-2 text-left font-bold text-gray-500 dark:text-gray-400 min-w-[150px]">
                Department
              </th>
              {data.categories.map((cat) => (
                <th key={cat} className="p-2 text-center font-bold text-gray-500 dark:text-gray-400 whitespace-nowrap">
                  {cat}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.matrix.map((row) => (
              <tr key={row.department}>
                <td className="p-2 font-semibold text-gray-700 dark:text-gray-300">
                  {row.department}
                </td>
                {data.categories.map((cat) => {
                  const count = row.counts[cat];
                  return (
                    <td key={cat} className="p-1">
                      <div
                        className={`w-full h-10 flex items-center justify-center rounded-xl font-bold transition-all duration-300 hover:scale-105 hover:shadow-md cursor-pointer ${getColor(
                          count,
                          data.maxCount
                        )}`}
                        title={`${count} complaints for ${cat} in ${row.department}`}
                      >
                        {count > 0 ? count : ''}
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Legend */}
      <div className="mt-8 flex items-center justify-end gap-3 text-xs text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider">
        <span>Less</span>
        <div className="flex gap-1">
          <div className="w-6 h-6 rounded-md bg-gray-100 dark:bg-gray-800/50"></div>
          <div className="w-6 h-6 rounded-md bg-red-200 dark:bg-red-900/30"></div>
          <div className="w-6 h-6 rounded-md bg-red-400 dark:bg-red-700/60"></div>
          <div className="w-6 h-6 rounded-md bg-red-500 dark:bg-red-600/80"></div>
          <div className="w-6 h-6 rounded-md bg-red-600 dark:bg-red-500"></div>
        </div>
        <span>More</span>
      </div>
    </div>
  );
};

export default ComplaintHeatmap;
