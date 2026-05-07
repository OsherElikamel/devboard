import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

const COLORS: Record<string, string> = {
  idea: '#64748B',
  in_progress: '#38BDF8',
  testing: '#F59E0B',
  deployed: '#22C55E',
  archived: '#475569',
};

const LABELS: Record<string, string> = {
  idea: 'Idea',
  in_progress: 'In Progress',
  testing: 'Testing',
  deployed: 'Deployed',
  archived: 'Archived',
};

interface Props {
  data: Record<string, number>;
  activeStatus?: string | null;
  onStatusClick?: (statusKey: string) => void;
}

export default function DonutChart({ data, activeStatus, onStatusClick }: Props) {
  const chartData = Object.entries(data)
    .filter(([, v]) => v > 0)
    .map(([key, value]) => ({ key, name: LABELS[key] || key, value, color: COLORS[key] || '#64748B' }));

  const total = chartData.reduce((sum, d) => sum + d.value, 0);

  if (total === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-app-text-muted text-sm">
        No projects yet
      </div>
    );
  }

  return (
    <div className="flex items-center gap-6">
      <div className="w-48 h-48 relative">
        <ResponsiveContainer>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={80}
              paddingAngle={3}
              dataKey="value"
              stroke="none"
              cursor={onStatusClick ? 'pointer' : undefined}
              onClick={onStatusClick ? (_, index) => onStatusClick(chartData[index].key) : undefined}
            >
              {chartData.map((entry, i) => (
                <Cell
                  key={i}
                  fill={entry.color}
                  opacity={activeStatus && activeStatus !== entry.key ? 0.3 : 1}
                  strokeWidth={activeStatus === entry.key ? 2 : 0}
                  stroke={activeStatus === entry.key ? entry.color : 'none'}
                />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{ background: '#101624', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', fontSize: '13px' }}
              itemStyle={{ color: '#F8FAFC' }}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-2xl font-bold text-app-text">{total}</span>
        </div>
      </div>
      <div className="space-y-2">
        {chartData.map((d) => (
          <div
            key={d.name}
            onClick={() => onStatusClick?.(d.key)}
            className={`flex items-center gap-2 text-sm rounded-lg px-2 py-1 -mx-2 transition-all duration-200 ${
              onStatusClick ? 'cursor-pointer hover:bg-app-hover' : ''
            } ${activeStatus && activeStatus !== d.key ? 'opacity-40' : ''}`}
          >
            <div
              className="w-3 h-3 rounded-full shrink-0 transition-transform duration-200"
              style={{ backgroundColor: d.color, transform: activeStatus === d.key ? 'scale(1.3)' : undefined }}
            />
            <span className={`transition-colors duration-200 ${activeStatus === d.key ? 'text-app-text font-medium' : 'text-app-text-secondary'}`}>
              {d.name}
            </span>
            <span className="text-app-text font-medium ml-auto">{d.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
