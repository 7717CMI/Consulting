import { useMemo } from 'react'
import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'
import { useTheme } from '../context/ThemeContext'
import { formatNumber, formatWithCommas } from '../utils/dataGenerator'
import { getChartColors } from '../utils/chartColors'

interface SegmentGroupedBarChartProps {
  data: Array<Record<string, number | string>>
  segmentKeys: string[]
  xAxisLabel?: string
  yAxisLabel?: string
}

export function SegmentGroupedBarChart({ 
  data, 
  segmentKeys,
  xAxisLabel = 'Year', 
  yAxisLabel = 'Value' 
}: SegmentGroupedBarChartProps) {
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  if (!data || data.length === 0 || !segmentKeys || segmentKeys.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-text-secondary-light dark:text-text-secondary-dark">
        No data available
      </div>
    )
  }

  const colors = useMemo(() => {
    return getChartColors(segmentKeys.length)
  }, [segmentKeys.length])

  const segmentColors: Record<string, string> = useMemo(() => {
    const colorMap: Record<string, string> = {}
    segmentKeys.forEach((key, index) => {
      colorMap[key] = colors[index % colors.length]
    })
    return colorMap
  }, [segmentKeys, colors])

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      // In grouped bar charts, payload contains all bars for that x-axis value
      // We'll show only the first non-zero value (the one being hovered)
      // Filter to show only bars with values > 0
      const validEntries = payload.filter((entry: any) => entry.value > 0)
      
      if (validEntries.length === 0) return null
      
      // Show only the first entry (the specific bar being hovered)
      const hoveredItem = validEntries[0]
      
      // Extract unit from yAxisLabel (e.g., "Market Value (US$ Million)" -> "US$ Million")
      const unitMatch = yAxisLabel.match(/\(([^)]+)\)/)
      const unit = unitMatch ? unitMatch[1] : yAxisLabel.includes('Tons') ? 'Tons' : ''
      
      return (
        <div 
          className={`p-3 rounded-lg border-2 shadow-xl ${
            isDark 
              ? 'bg-navy-card border-electric-blue text-white' 
              : 'bg-white border-electric-blue text-gray-900'
          }`}
          style={{ 
            minWidth: '250px',
            maxWidth: '320px',
            whiteSpace: 'normal',
            wordWrap: 'break-word'
          }}
        >
          <p className="font-bold text-sm mb-2 break-words">{xAxisLabel}: {label}</p>
          <div className="flex items-start gap-2 flex-wrap">
            <div 
              className="w-3 h-3 rounded flex-shrink-0 mt-0.5" 
              style={{ backgroundColor: hoveredItem.color }}
            />
            <div className="flex-1 min-w-0">
              <span className="font-semibold text-sm block break-words">{hoveredItem.name}:</span>
              <div className="flex items-baseline gap-2 mt-0.5 flex-wrap">
                <span className="font-bold text-sm">{formatWithCommas(hoveredItem.value, 2)}</span>
                {unit && <span className="text-xs text-gray-600 dark:text-gray-400">({unit})</span>}
              </div>
            </div>
          </div>
        </div>
      )
    }
    return null
  }

  return (
    <div className="relative w-full h-full">
      {/* Demo Data Watermark */}
      <div 
        className="absolute inset-0 flex items-center justify-center pointer-events-none z-0"
        style={{ opacity: 0.12 }}
      >
        <span 
          className="text-4xl font-bold text-gray-400 dark:text-gray-600 select-none"
          style={{ transform: 'rotate(-45deg)', transformOrigin: 'center' }}
        >
          Demo Data
        </span>
      </div>
      <ResponsiveContainer width="100%" height="100%" className="relative z-10">
      <RechartsBarChart
        data={data}
        margin={{
          top: 20,
          right: 40,
          left: 100,
          bottom: 80,
        }}
        barGap={0.4}
        barCategoryGap={data.length > 1 ? 0.5 : 0.2}
      >
        <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#4A5568' : '#EAEAEA'} />
        <XAxis 
          dataKey="year" 
          stroke={isDark ? '#A0AEC0' : '#4A5568'}
          style={{ fontSize: '13px', fontWeight: 500 }}
          angle={0}
          textAnchor="middle"
          height={60}
          interval={0}
          tick={{ fill: isDark ? '#E2E8F0' : '#2D3748' }}
          tickMargin={15}
          label={{
            value: xAxisLabel,
            position: 'insideBottom',
            offset: -10,
            style: { 
              fontSize: '14px', 
              fontWeight: 500,
              fill: isDark ? '#E2E8F0' : '#2D3748'
            }
          }}
        />
        <YAxis
          stroke={isDark ? '#A0AEC0' : '#4A5568'}
          style={{ fontSize: '13px', fontWeight: 500 }}
          tickFormatter={(value) => formatNumber(value)}
          width={90}
          tick={{ fill: isDark ? '#E2E8F0' : '#2D3748' }}
          tickMargin={15}
          domain={[0, (dataMax: number) => Math.ceil(dataMax * 1.1)]}
          allowDataOverflow={false}
          label={{
            value: yAxisLabel,
            angle: -90,
            position: 'left',
            offset: 20,
            style: {
              fontSize: '11px',
              fontWeight: 500,
              fill: isDark ? '#E2E8F0' : '#2D3748',
              textAnchor: 'middle'
            }
          }}
        />
        <Tooltip 
          content={<CustomTooltip />}
          cursor={{ fill: 'transparent' }}
          shared={false}
          wrapperStyle={{ zIndex: 1000, outline: 'none', pointerEvents: 'none' }}
          allowEscapeViewBox={{ x: false, y: false }}
          isAnimationActive={false}
        />
        <Legend
          wrapperStyle={{
            color: isDark ? '#E2E8F0' : '#2D3748',
            paddingTop: '20px',
            paddingBottom: '10px',
            fontSize: '12px',
            fontWeight: 500
          }}
          iconSize={12}
          iconType="square"
          verticalAlign="bottom"
          align="center"
          formatter={(value) => {
            // Show full label without truncation
            return (
              <span style={{ fontSize: '12px', fontWeight: 500 }}>{value}</span>
            )
          }}
        />
        {segmentKeys.map((key, index) => (
          <Bar
            key={key}
            dataKey={key}
            fill={segmentColors[key]}
            name={key}
            radius={[6, 6, 0, 0]}
            maxBarSize={50}
          />
        ))}
      </RechartsBarChart>
    </ResponsiveContainer>
    </div>
  )
}

