import { useEffect, useState } from 'react';
import { useGoals } from '../context/GoalsContext';
import { getMonthlyTotals, formatCurrency } from '../utils';

function useWindowWidth() {
  const [width, setWidth] = useState(window.innerWidth);
  useEffect(() => {
    const handler = () => setWidth(window.innerWidth);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);
  return width;
}

export default function MonthlyChart() {
  const { state } = useGoals();
  const windowWidth = useWindowWidth();
  const allData = getMonthlyTotals(state.goals);

  const maxMonths = windowWidth < 700 ? 6 : 12;
  const data = allData.length > maxMonths ? allData.slice(-maxMonths) : allData;

  if (data.length === 0) return null;

  const maxVal = Math.max(...data.map(d => d.total));
  const chartAreaHeight = 202;

  return (
    <div className="monthly-chart-section">
      <p className="monthly-chart-title">Monthly deposits</p>
      <div className="chart-container">
        {data.map((d) => {
          const barPct = maxVal > 0 ? (d.total / maxVal) * 100 : 0;
          return (
            <div key={d.month} className="chart-col">
              <div className="chart-bar-area" style={{ height: chartAreaHeight }}>
                <div className="chart-bar" style={{ height: `${barPct}%` }} />
              </div>
              <div className="chart-label">
                <span className="chart-label-value">
                  {d.total > 0 ? formatCurrency(d.total) : '\u2014'}
                </span>
                <span className="chart-label-month">{d.month}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
