import { useEffect, useRef, useState } from 'react';
import { useGoals } from '../context/GoalsContext';
import { getMonthlyTotals, formatCurrency } from '../utils';

function useContainerWidth(ref: React.RefObject<HTMLDivElement | null>) {
  const [width, setWidth] = useState(0);
  useEffect(() => {
    if (!ref.current) return;
    const observer = new ResizeObserver(entries => {
      setWidth(entries[0].contentRect.width);
    });
    observer.observe(ref.current);
    setWidth(ref.current.getBoundingClientRect().width);
    return () => observer.disconnect();
  }, [ref]);
  return width;
}

export default function MonthlyChart() {
  const { state } = useGoals();
  const containerRef = useRef<HTMLDivElement>(null);
  const containerWidth = useContainerWidth(containerRef);
  const allData = getMonthlyTotals(state.goals);

  const maxMonths = containerWidth > 0 && containerWidth < 500 ? 6 : 12;
  const data = allData.length > maxMonths ? allData.slice(-maxMonths) : allData;

  if (data.length === 0) return null;

  const maxVal = Math.max(...data.map(d => d.total));
  const barAreaHeight = 144;

  return (
    <div className="monthly-chart-section">
      <p className="monthly-chart-title">Monthly deposits</p>
      <div className="chart-container" ref={containerRef}>
        {data.map((d) => {
          const barPct = maxVal > 0 ? (d.total / maxVal) * 100 : 0;
          return (
            <div key={d.month} className="chart-col">
              <div className="chart-bar-area" style={{ height: barAreaHeight }}>
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

