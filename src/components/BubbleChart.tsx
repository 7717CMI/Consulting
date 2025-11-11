import { useMemo } from 'react'
import {
  ScatterChart as RechartsScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  Label,
} from 'recharts'
import { useTheme } from '../context/ThemeContext'
import { formatWithCommas } from '../utils/dataGenerator'
import { getChartColors } from '../utils/chartColors'

interface BubbleData {
  region: string
  cagrIndex: number
  marketShareIndex: number
  incrementalOpportunity: number
  colorIndex?: number
  description?: string
}

interface BubbleChartProps {
  data: BubbleData[]
  xAxisLabel?: string
  yAxisLabel?: string
}

export function BubbleChart({
  data,
  xAxisLabel = 'CAGR Index',
  yAxisLabel = 'Market Share Index'
}: BubbleChartProps) {
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-text-secondary-light dark:text-text-secondary-dark">
        No data available
      </div>
    )
  }

  // Get unique colors for each bubble
  const bubbleColors = useMemo(() => getChartColors(data.length), [data.length])

  // Normalize bubble sizes for visualization
  const maxOpportunity = Math.max(...data.map(d => d.incrementalOpportunity))
  const minOpportunity = Math.min(...data.map(d => d.incrementalOpportunity))
  const sizeRange = maxOpportunity - minOpportunity

  const transformedData = useMemo(() => {
    return data.map(item => {
      // Scale bubble size (min 30, max 200) - Recharts uses 'z' for bubble size
      const normalizedSize = sizeRange > 0
        ? 30 + ((item.incrementalOpportunity - minOpportunity) / sizeRange) * 170
        : 100
      
      return {
        ...item,
        z: normalizedSize, // Recharts uses 'z' for bubble size
        size: normalizedSize, // Keep for custom shape
      }
    })
  }, [data, maxOpportunity, minOpportunity, sizeRange])

  // Calculate padding needed for largest bubble to be fully visible
  // We need to add sufficient padding to ensure the largest bubble doesn't get cut off
  const cagrMin = Math.min(...transformedData.map(d => d.cagrIndex))
  const cagrMax = Math.max(...transformedData.map(d => d.cagrIndex))
  const cagrRange = cagrMax - cagrMin
  const shareMin = Math.min(...transformedData.map(d => d.marketShareIndex))
  const shareMax = Math.max(...transformedData.map(d => d.marketShareIndex))
  const shareRange = shareMax - shareMin
  
  // Calculate padding: use a percentage of the range to ensure proper padding
  // Very generous padding to account for largest bubble radius (up to 100px radius)
  // Use 40-45% of range to ensure largest bubbles are fully visible with no clipping
  const cagrPadding = Math.max(2.5, cagrRange * 0.45) // 45% of range, minimum 2.5
  const sharePadding = Math.max(1.2, shareRange * 0.45) // 45% of range, minimum 1.2

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className={`p-4 rounded-lg border-2 shadow-lg ${
          isDark 
            ? 'bg-navy-card border-electric-blue text-white' 
            : 'bg-white border-electric-blue text-gray-900'
        }`}>
          <p className="font-bold text-base mb-2">{data.region}</p>
          <p className="text-sm mb-1">
            <strong>CAGR Index:</strong> {data.cagrIndex.toFixed(2)}
          </p>
          <p className="text-sm mb-1">
            <strong>Market Share Index:</strong> {data.marketShareIndex.toFixed(2)}
          </p>
          <p className="text-sm">
            <strong>Incremental Opportunity:</strong> {formatWithCommas(data.incrementalOpportunity, 1)} US$ Mn
          </p>
          {data.description && (
            <p className="text-xs mt-2 italic text-text-secondary-light dark:text-text-secondary-dark">
              {data.description}
            </p>
          )}
        </div>
      )
    }
    return null
  }

  // Custom shape for 3D bubbles - each with unique color
  const CustomShape = (props: any): JSX.Element => {
    const { cx, cy, payload } = props
    const region = payload?.region || 'Unknown'
    const size = payload?.size || 50
    const colorIndex = payload?.colorIndex ?? 0

    // Ensure cx and cy are valid numbers, default to 0 if not
    const x = typeof cx === 'number' ? cx : 0
    const y = typeof cy === 'number' ? cy : 0

    // Get color for this bubble
    const bubbleColor = bubbleColors[colorIndex % bubbleColors.length]

    // Create unique ID for each bubble to avoid gradient conflicts
    const bubbleId = `bubble-${region.replace(/\s+/g, '-').toLowerCase()}-${colorIndex}`

    return (
      <g>
        {/* Shadow for 3D effect */}
        <circle
          cx={x}
          cy={y + 3}
          r={size / 2}
          fill="rgba(0, 0, 0, 0.2)"
          opacity={0.3}
        />
        {/* Main bubble with gradient for 3D effect */}
        <defs>
          <radialGradient id={`gradient-${bubbleId}`}>
            <stop offset="0%" stopColor={bubbleColor} stopOpacity={1} />
            <stop offset="50%" stopColor={bubbleColor} stopOpacity={0.9} />
            <stop offset="100%" stopColor={bubbleColor} stopOpacity={0.7} />
          </radialGradient>
          <filter id={`glow-${bubbleId}`}>
            <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        <circle
          cx={x}
          cy={y}
          r={size / 2}
          fill={`url(#gradient-${bubbleId})`}
          filter={`url(#glow-${bubbleId})`}
          stroke={bubbleColor}
          strokeWidth={2}
          style={{
            transition: 'all 0.3s ease',
          }}
        />
        {/* Highlight for 3D effect */}
        <circle
          cx={x - size / 6}
          cy={y - size / 6}
          r={size / 4}
          fill="rgba(255, 255, 255, 0.4)"
        />
      </g>
    )
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
        <RechartsScatterChart
          margin={{
            top: 60,
            right: 60,
            left: 100,
            bottom: 100,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#4A5568' : '#EAEAEA'} />
          <XAxis 
            type="number"
            dataKey="cagrIndex"
            stroke={isDark ? '#A0AEC0' : '#4A5568'}
            style={{ fontSize: '13px', fontWeight: 500 }}
            tick={{ fill: isDark ? '#E2E8F0' : '#2D3748', fontSize: 12 }}
            tickMargin={10}
            domain={[cagrMin - cagrPadding, cagrMax + cagrPadding]}
            tickFormatter={(value) => typeof value === 'number' ? value.toFixed(1) : value}
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
            type="number"
            dataKey="marketShareIndex"
            stroke={isDark ? '#A0AEC0' : '#4A5568'}
            style={{ fontSize: '13px', fontWeight: 500 }}
            tick={{ fill: isDark ? '#E2E8F0' : '#2D3748', fontSize: 12 }}
            tickMargin={10}
            domain={[shareMin - sharePadding, shareMax + sharePadding]}
            tickFormatter={(value) => typeof value === 'number' ? value.toFixed(1) : value}
            label={{
              value: yAxisLabel,
              angle: -90,
              position: 'insideLeft',
              offset: -10,
              style: { 
                fontSize: '14px', 
                fontWeight: 500,
                fill: isDark ? '#E2E8F0' : '#2D3748',
                textAnchor: 'middle'
              }
            }}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ strokeDasharray: '3 3' }} />
          <Scatter
            name="Items"
            data={transformedData}
            shape={CustomShape}
          >
            {transformedData.map((entry, index) => {
              const colorIndex = entry.colorIndex ?? index
              return (
                <Cell key={`cell-${index}`} fill={bubbleColors[colorIndex % bubbleColors.length]} />
              )
            })}
          </Scatter>
        </RechartsScatterChart>
      </ResponsiveContainer>

      {/* Legend */}
      <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 z-20 max-w-4xl">
        <div className={`px-4 py-2 rounded-lg border shadow-md ${
          isDark
            ? 'bg-navy-card/95 border-navy-light'
            : 'bg-white/95 border-gray-300'
        }`}>
          <div className="flex flex-wrap items-center justify-center gap-3 mb-1">
            {data.map((item, index) => {
              const colorIndex = item.colorIndex ?? index
              const color = bubbleColors[colorIndex % bubbleColors.length]
              return (
                <div key={index} className="flex items-center gap-1.5">
                  <div
                    className="w-3 h-3 rounded-full border"
                    style={{
                      backgroundColor: color,
                      borderColor: color,
                      boxShadow: `0 0 4px ${color}60`
                    }}
                  />
                  <span className="text-[10px] font-medium text-text-primary-light dark:text-text-primary-dark whitespace-nowrap">
                    {item.region}
                  </span>
                </div>
              )
            })}
          </div>
          <p className="text-[9px] text-center text-text-secondary-light dark:text-text-secondary-dark mt-1 pt-1 border-t border-gray-300 dark:border-navy-light">
            *Size of bubble indicates incremental opportunity (2025-2032)
          </p>
        </div>
      </div>
    </div>
  )
}

