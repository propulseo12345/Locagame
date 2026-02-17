interface MonthData {
  month: string;
  amount: number;
}

interface RevenueChartProps {
  byMonth: MonthData[];
}

export default function RevenueChart({ byMonth }: RevenueChartProps) {
  const revenueValues = byMonth.map(m => m.amount);
  const maxRevenue = Math.max(...revenueValues, 1);
  const minRevenue = Math.min(...revenueValues, 0);

  return (
    <div className="lg:col-span-2 bg-white rounded-xl shadow-sm p-6 border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Évolution du chiffre d'affaires
      </h3>
      <div className="space-y-2">
        {/* Valeur max */}
        <div className="text-xs text-gray-500 text-right pr-2">
          {maxRevenue.toLocaleString()}€
        </div>

        {/* Conteneur du graphique */}
        <div className="relative h-56 border-b-2 border-l-2 border-gray-200 bg-white">
          {/* Grille horizontale */}
          <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
            <div className="border-b border-gray-100"></div>
            <div className="border-b border-gray-100"></div>
            <div className="border-b border-gray-100"></div>
            <div className="border-b border-gray-100"></div>
          </div>

          {/* SVG de la courbe */}
          <svg
            className="absolute inset-0 w-full h-full"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            style={{ overflow: 'visible' }}
          >
            <defs>
              <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#33ffcc" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#33ffcc" stopOpacity="0.05" />
              </linearGradient>
            </defs>

            {/* Zone sous la courbe */}
            <path
              d={(() => {
                const points = byMonth.map((monthData, i) => {
                  const x = (i / (byMonth.length - 1)) * 100;
                  const normalizedValue = (monthData.amount - minRevenue) / (maxRevenue - minRevenue);
                  const y = (1 - normalizedValue) * 100;
                  return `${x},${y}`;
                });
                return `M 0,100 L ${points.join(' L ')} L 100,100 Z`;
              })()}
              fill="url(#chartGradient)"
            />

            {/* Ligne de la courbe */}
            <polyline
              points={byMonth.map((monthData, i) => {
                const x = (i / (byMonth.length - 1)) * 100;
                const normalizedValue = (monthData.amount - minRevenue) / (maxRevenue - minRevenue);
                const y = (1 - normalizedValue) * 100;
                return `${x},${y}`;
              }).join(' ')}
              fill="none"
              stroke="#33ffcc"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              vectorEffect="non-scaling-stroke"
            />
          </svg>

          {/* Points sur la courbe avec tooltips */}
          {byMonth.map((monthData, i) => {
            const x = (i / (byMonth.length - 1)) * 100;
            const normalizedValue = (monthData.amount - minRevenue) / (maxRevenue - minRevenue);
            const y = (1 - normalizedValue) * 100;
            return (
              <div
                key={i}
                className="absolute group cursor-pointer"
                style={{
                  left: `${x}%`,
                  top: `${y}%`,
                  transform: 'translate(-50%, -50%)',
                  width: '16px',
                  height: '16px'
                }}
              >
                {/* Point visible */}
                <div className="absolute inset-0 rounded-full border-2 border-[#33ffcc] bg-white group-hover:scale-125 transition-transform"></div>
                <div className="absolute inset-0 m-auto w-2 h-2 rounded-full bg-[#33ffcc]"></div>

                {/* Tooltip */}
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-6 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-20 shadow-xl">
                  <div className="font-semibold text-white">{monthData.month}</div>
                  <div className="text-[#33ffcc] font-bold">{monthData.amount.toLocaleString()}€</div>
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2">
                    <div className="border-4 border-transparent border-t-gray-900"></div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Valeur min */}
        <div className="text-xs text-gray-500 text-right pr-2">
          {minRevenue.toLocaleString()}€
        </div>

        {/* Labels des mois */}
        <div className="flex justify-between text-xs text-gray-600 font-medium pt-2 pl-2">
          {byMonth.map((monthData, i) => (
            <span key={i} className="flex-1 text-center">{monthData.month}</span>
          ))}
        </div>
      </div>
    </div>
  );
}
