import React from 'react'
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

interface CrossSegmentStackedBarChartProps {
  data: Array<Record<string, number | string>>
  dataKeys: string[]
  xAxisLabel?: string
  yAxisLabel?: string
  nameKey?: string
}

export function CrossSegmentStackedBarChart({ 
  data, 
  dataKeys, 
  xAxisLabel = 'Category', 
  yAxisLabel = 'Value',
  nameKey = 'name'
}: CrossSegmentStackedBarChartProps) {
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  // Safety check for empty data
  if (!data || data.length === 0 || !dataKeys || dataKeys.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-text-secondary-light dark:text-text-secondary-dark text-lg">
        No data available
      </div>
    )
  }

  // Get colors for each segment
  const colors = getChartColors(dataKeys.length)
  const segmentColors: Record<string, string> = {}
  dataKeys.forEach((key, index) => {
    segmentColors[key] = colors[index]
  })

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const total = payload.reduce((sum: number, entry: any) => sum + (entry.value || 0), 0)
      
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
          <div className="space-y-1 max-h-48 overflow-y-auto">
            {payload
              .filter((entry: any) => entry.value > 0)
              .map((entry: any) => {
                const percentage = total > 0 ? ((entry.value || 0) / total) * 100 : 0
                return (
                  <div key={entry.dataKey} className="flex items-start gap-2 text-xs">
                    <div 
                      className="w-2.5 h-2.5 rounded flex-shrink-0 mt-0.5" 
                      style={{ backgroundColor: entry.color }}
                    />
                    <div className="flex-1 min-w-0">
                      <span className="font-medium block break-words text-xs">{entry.name}:</span>
                      <div className="flex items-baseline gap-1.5 mt-0.5 flex-wrap">
                        <span className="font-bold text-xs">{formatWithCommas(entry.value, 2)}</span>
                        <span className="text-[10px] opacity-75">({percentage.toFixed(1)}%)</span>
                      </div>
                    </div>
                  </div>
                )
              })
            }
          </div>
          <div className="mt-2 pt-2 border-t border-gray-400 flex items-center justify-between">
            <span className="font-semibold text-xs">Total:</span>
            <span className="font-bold text-xs">{formatWithCommas(total, 2)}</span>
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
      >
        <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#4A5568' : '#EAEAEA'} />
        <XAxis 
          dataKey={nameKey}
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
        {dataKeys.map((key) => (
          <Bar
            key={key}
            dataKey={key}
            stackId="a"
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

