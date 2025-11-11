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

  // Find the bubble with maximum incremental opportunity (most attractive)
  const maxOpportunityIndex = data.findIndex(d => d.incrementalOpportunity === maxOpportunity)

  const transformedData = useMemo(() => {
    // Calculate current min/max for positioning (before transformation)
    const cagrMin = Math.min(...data.map(d => d.cagrIndex))
    const cagrMax = Math.max(...data.map(d => d.cagrIndex))
    const shareMin = Math.min(...data.map(d => d.marketShareIndex))
    const shareMax = Math.max(...data.map(d => d.marketShareIndex))
    const cagrRange = cagrMax - cagrMin
    const shareRange = shareMax - shareMin
    
    // Calculate base sizes for all bubbles (excluding the max opportunity one)
    // Increased by 40% from previous sizes
    const baseMaxSize = 35 // Maximum size for regular bubbles (25 * 1.4 = 35)
    const baseMinSize = 11 // Minimum size for regular bubbles (8 * 1.4 = 11.2, rounded to 11)
    
    // First pass: calculate sizes and initial positions
    const bubblesWithSizes = data.map((item, index) => {
      // Scale bubble size (min 11, max 35) - increased by 40%
      let normalizedSize = sizeRange > 0
        ? baseMinSize + ((item.incrementalOpportunity - minOpportunity) / sizeRange) * (baseMaxSize - baseMinSize)
        : 20
      
      let cagrIndex = item.cagrIndex
      let marketShareIndex = item.marketShareIndex
      
      // If this is the bubble with max opportunity, position it in upper right and make it larger
      if (index === maxOpportunityIndex) {
        // Position in upper right quadrant
        // Calculate position to be approximately 100 pixels to the right
        // Typical chart: ~800px container width, ~100px left margin, ~60px right margin = ~640px plot area
        // If range is cagrRange, then pixels per unit = 640 / cagrRange
        // For 100 pixels: chartUnits = 100 / (640 / cagrRange) = 100 * cagrRange / 640
        // Using a more conservative estimate: assume typical plot area of ~600px
        const typicalPlotWidth = 600 // pixels
        const pixelsToRight = 100
        const chartUnitsToRight = cagrRange > 0 
          ? (pixelsToRight * cagrRange) / typicalPlotWidth
          : 2.0 // Default to 2 units if range is 0
        
        // Position at max + offset to the right
        cagrIndex = cagrMax + chartUnitsToRight // Position 100px to the right of max
        marketShareIndex = shareMin + (shareRange * 0.85) // 85% towards max (upper side)
        
        // Make it larger (reduced by 30% from previous: was 4.5x, now 3.15x)
        // Previous: baseMaxSize * 4.5 = 35 * 4.5 = 157.5
        // Reduced by 30%: 157.5 * 0.7 = 110.25
        normalizedSize = Math.max(110, baseMaxSize * 3.15)
      }
      
      return {
        ...item,
        cagrIndex,
        marketShareIndex,
        size: normalizedSize,
        radius: normalizedSize / 2,
        originalIndex: index,
      }
    })
    
    // Second pass: adjust positions to prevent overlaps (iterative approach)
    let adjustedBubbles = bubblesWithSizes.map((bubble, index) => ({
      ...bubble,
      cagrIndex: bubble.cagrIndex,
      marketShareIndex: bubble.marketShareIndex,
      z: bubble.size,
    }))
    
    // Get the large bubble reference for special handling
    const largeBubble = adjustedBubbles[maxOpportunityIndex]
    
    // Initial pass: push smaller bubbles away from large bubble's area if they're too close
    adjustedBubbles = adjustedBubbles.map((bubble, index) => {
      if (index === maxOpportunityIndex) return bubble
      
      const dx = bubble.cagrIndex - largeBubble.cagrIndex
      const dy = bubble.marketShareIndex - largeBubble.marketShareIndex
      const distance = Math.sqrt(dx * dx + dy * dy)
      const minDistanceFromLarge = (bubble.radius + largeBubble.radius) * 1.6 // 60% buffer
      
      if (distance < minDistanceFromLarge && distance > 0.001) {
        // Push bubble away from large bubble towards lower-left
        const angle = Math.atan2(dy, dx)
        const pushDistance = minDistanceFromLarge - distance + 1.0 // Extra push
        return {
          ...bubble,
          cagrIndex: bubble.cagrIndex - Math.abs(Math.cos(angle)) * pushDistance * 0.8,
          marketShareIndex: bubble.marketShareIndex - Math.abs(Math.sin(angle)) * pushDistance * 0.8,
        }
      }
      return bubble
    })
    
    // Iterate multiple times to resolve all overlaps (minimal adjustment since data is pre-spaced)
    // Only adjust if there's a real overlap based on actual bubble sizes
    const maxIterations = 5 // Further reduced iterations since data is already well-spaced
    for (let iteration = 0; iteration < maxIterations; iteration++) {
      let hasOverlap = false
      
      adjustedBubbles = adjustedBubbles.map((bubble, index) => {
        // Don't adjust the large bubble position
        if (index === maxOpportunityIndex) {
          return bubble
        }
        
        let adjustedCagr = bubble.cagrIndex
        let adjustedShare = bubble.marketShareIndex
        const bubbleRadius = bubble.radius
        
        // Check for collisions with other bubbles
        for (let i = 0; i < adjustedBubbles.length; i++) {
          if (i === index) continue
          
          const otherBubble = adjustedBubbles[i]
          const otherRadius = otherBubble.radius
          
          // Use actual bubble sizes for collision detection (minimal buffer since data is pre-spaced)
          const isLargeBubble = i === maxOpportunityIndex
          const bufferMultiplier = isLargeBubble ? 1.15 : 1.05 // Very minimal buffer - only for actual overlaps
          const otherMinDistance = (bubbleRadius + otherRadius) * bufferMultiplier
          
          // Calculate distance between bubble centers
          const dx = adjustedCagr - otherBubble.cagrIndex
          const dy = adjustedShare - otherBubble.marketShareIndex
          const distance = Math.sqrt(dx * dx + dy * dy)
          
          // Only adjust if there's a real overlap (bubbles are actually touching/overlapping)
          // Use stricter threshold - only move if bubbles are actually overlapping
          if (distance < otherMinDistance && distance > 0.001) {
            hasOverlap = true
            
            // Calculate angle between bubbles
            const angle = Math.atan2(dy, dx)
            
            // Move this bubble away from the other bubble (very minimal since data is pre-spaced)
            const requiredDistance = otherMinDistance
            const moveMultiplier = isLargeBubble ? 0.30 : 0.25 // Very minimal movement
            const moveDistance = (requiredDistance - distance) * moveMultiplier
            
            // Adjust position away from the other bubble
            adjustedCagr = adjustedCagr + Math.cos(angle) * moveDistance
            adjustedShare = adjustedShare + Math.sin(angle) * moveDistance
            
            // Keep within reasonable bounds
            adjustedCagr = Math.max(cagrMin - cagrRange * 0.2, Math.min(cagrMax + cagrRange * 0.2, adjustedCagr))
            adjustedShare = Math.max(shareMin - shareRange * 0.2, Math.min(shareMax + shareRange * 0.2, adjustedShare))
          }
        }
        
        return {
          ...bubble,
          cagrIndex: adjustedCagr,
          marketShareIndex: adjustedShare,
        }
      })
      
      // If no overlaps found, we're done
      if (!hasOverlap) break
    }
    
    return adjustedBubbles
  }, [data, maxOpportunity, minOpportunity, sizeRange, maxOpportunityIndex])

  // Calculate padding needed for largest bubble to be fully visible
  // We need to add sufficient padding to ensure the largest bubble doesn't get cut off
  const cagrMin = Math.min(...transformedData.map(d => d.cagrIndex))
  const cagrMax = Math.max(...transformedData.map(d => d.cagrIndex))
  const cagrRange = cagrMax - cagrMin
  const shareMin = Math.min(...transformedData.map(d => d.marketShareIndex))
  const shareMax = Math.max(...transformedData.map(d => d.marketShareIndex))
  const shareRange = shareMax - shareMin
  
  // Find the largest bubble size to calculate proper padding
  const maxBubbleSize = Math.max(...transformedData.map(d => d.size || d.z || 60))
  const maxBubbleRadius = maxBubbleSize / 2
  
  // Calculate padding: use a percentage of the range plus bubble radius to ensure proper spacing
  // Increased padding to reduce overlap and ensure largest bubble is fully visible
  // Convert bubble radius to index units (approximate: 1 index unit ≈ chart width/10)
  // Use 70-80% of range plus buffer for bubble radius to ensure no clipping and better spacing
  // More padding needed for the very large bubble in upper right and to prevent overlaps
  const cagrPadding = Math.max(5.0, (cagrRange * 0.75) + (maxBubbleRadius / 35)) // 75% of range + bubble buffer
  const sharePadding = Math.max(3.0, (shareRange * 0.75) + (maxBubbleRadius / 35)) // 75% of range + bubble buffer

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

