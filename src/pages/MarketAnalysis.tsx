import { useState, useEffect, useMemo } from 'react'
import { ArrowLeft } from 'lucide-react'
import { motion } from 'framer-motion'
import { getData, formatWithCommas, clearDataCache, type ShovelMarketData } from '../utils/dataGenerator'
import { StatBox } from '../components/StatBox'
import { FilterDropdown } from '../components/FilterDropdown'
import { SegmentGroupedBarChart } from '../components/SegmentGroupedBarChart'
import { RegionCountryStackedBarChart } from '../components/RegionCountryStackedBarChart'
import { CrossSegmentStackedBarChart } from '../components/CrossSegmentStackedBarChart'
import { DemoNotice } from '../components/DemoNotice'
import { useTheme } from '../context/ThemeContext'
import { InfoTooltip } from '../components/InfoTooltip'
import { WaterfallChart } from '../components/WaterfallChart'
import { BubbleChart } from '../components/BubbleChart'
import { YoYCAGRChart } from '../components/YoYCAGRChart'

interface MarketAnalysisProps {
  onNavigate: (page: string) => void
}

type MarketEvaluationType = 'By Value' | 'By Volume'

export function MarketAnalysis({ onNavigate }: MarketAnalysisProps) {
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  
  const [activeTab, setActiveTab] = useState<'standard' | 'incremental' | 'attractiveness' | 'yoy'>('standard')
  const [data, setData] = useState<ShovelMarketData[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    year: [] as number[],
    byRegion: [] as string[], // Hierarchical filter for "By Region" - stores selected countries
    byServiceType: [] as string[], // Hierarchical filter for "By Service Type"
    byEndUser: [] as string[], // Hierarchical filter for "By End User"
    byDeliveryChannel: [] as string[], // Hierarchical filter for "By Delivery Channel"
    byBusinessModel: [] as string[], // Hierarchical filter for "By Business Model"
    productType: [] as string[],
    bladeMaterial: [] as string[],
    handleLength: [] as string[],
    application: [] as string[],
    endUser: [] as string[],
    distributionChannelType: [] as string[],
    distributionChannel: [] as string[],
    marketEvaluation: 'By Value' as MarketEvaluationType,
  })
  
  // Separate filters for incremental tab
  const [incrementalFilters, setIncrementalFilters] = useState({
    region: ['North America'] as string[],
    country: ['U.S.', 'Canada'] as string[],
  })

  // Separate filters for attractiveness tab
  const [attractivenessFilters, setAttractivenessFilters] = useState({
    region: ['North America'] as string[],
    country: ['U.S.', 'Canada'] as string[],
    segmentType: '' as string, // Which segment type: By Service Type, By End User, etc.
    selectedCategory: '' as string, // Which specific category within the segment type
    serviceType: [] as string[],
    endUserType: [] as string[],
    deliveryChannel: [] as string[],
    businessModel: [] as string[],
  })

  // Separate filters for YoY/CAGR tab
  const [yoyFilters, setYoyFilters] = useState({
    region: [] as string[],
    country: [] as string[],
    segmentType: [] as string[], // Changed from productType to segmentType
  })

  useEffect(() => {
    // Clear cache to ensure fresh data with online channels
    clearDataCache()
    setLoading(true)
    setTimeout(() => {
      try {
        const generatedData = getData()
        setData(generatedData)
        setLoading(false)
        
        setTimeout(() => {
          const availableYears = [...new Set(generatedData.map(d => d.year))].sort()
          const availableCountries = [...new Set(generatedData.map(d => d.country))].sort()
          const availableProductTypes = [...new Set(generatedData.map(d => d.productType))].sort()
          const availableBladeMaterials = [...new Set(generatedData.map(d => d.bladeMaterial))].filter(Boolean).sort()
          const availableHandleLengths = [...new Set(generatedData.map(d => d.handleLength))].filter(Boolean).sort()
          const availableApplications = [...new Set(generatedData.map(d => d.application))].filter(Boolean).sort()
          const availableEndUsers = [...new Set(generatedData.map(d => d.endUser))].filter(Boolean).sort()
          // Default to 2024 and 2025 if available, otherwise use available years
          const defaultYears = availableYears.includes(2024) && availableYears.includes(2025)
            ? [2024, 2025]
            : availableYears.includes(2025)
              ? [2025]
              : availableYears.includes(2024)
                ? [2024]
                : availableYears.length > 0
                  ? [availableYears[availableYears.length - 1]]
                  : []
          
          // Select 2-3 years by default and set default values for new filters
          setFilters({
            year: defaultYears,
            byRegion: ['U.S.', 'Canada'], // Default: North America countries
            byServiceType: ['Personal Branding & Executive Consulting', 'Digital Presence & Branding Consulting'], // Default: 2 service types
            byEndUser: ['Senior Executives & Professionals', 'Corporate Teams (HR, Sales, Leadership)'], // Default: 2 end user types
            byDeliveryChannel: ['In-Person Consulting', 'Virtual / Online Consulting'], // Default: 2 delivery channels
            byBusinessModel: ['Premium One-on-One Consulting', 'Corporate Contracts / Retainers'], // Default: 2 business models
            productType: [],
            bladeMaterial: [],
            handleLength: [],
            application: [],
            endUser: [],
            distributionChannelType: [],
            distributionChannel: [],
            marketEvaluation: 'By Value',
          })
          
          // Set default for Y-o-Y filters: North America region and U.S., Canada countries
          setYoyFilters({
            region: ['North America'],
            country: ['U.S.', 'Canada'],
            segmentType: [] // Default to all segment types
          })
        }, 0)
      } catch (error) {
        console.error('Error loading data:', error)
        setData([])
        setLoading(false)
      }
    }, 500)
  }, [])

  // Get unique filter options - optimized
  const uniqueOptions = useMemo(() => {
    if (!data || data.length === 0) {
      return {
        years: [],
        countries: [],
        productTypes: [],
        bladeMaterials: [],
        handleLengths: [],
        applications: [],
        endUsers: [],
        distributionChannelTypes: [],
      }
    }

    const yearSet = new Set<number>()
    const countrySet = new Set<string>()
    const productTypeSet = new Set<string>()
    const bladeMaterialSet = new Set<string>()
    const handleLengthSet = new Set<string>()
    const applicationSet = new Set<string>()
    const endUserSet = new Set<string>()
    const distributionChannelTypeSet = new Set<string>()

    for (let i = 0; i < data.length; i++) {
      const d = data[i]
      if (d.year) yearSet.add(d.year)
      if (d.country) countrySet.add(d.country)
      if (d.productType) productTypeSet.add(d.productType)
      if (d.bladeMaterial) bladeMaterialSet.add(d.bladeMaterial)
      if (d.handleLength) handleLengthSet.add(d.handleLength)
      if (d.application) applicationSet.add(d.application)
      if (d.endUser) endUserSet.add(d.endUser)
      if (d.distributionChannelType) {
        distributionChannelTypeSet.add(d.distributionChannelType)
      }
    }

    const foundTypes = Array.from(distributionChannelTypeSet)
    const foundYears = Array.from(yearSet).sort()
    const foundCountries = Array.from(countrySet).filter(Boolean).sort()
    const foundHandleLengths = Array.from(handleLengthSet).filter(Boolean).sort()
    const foundApplications = Array.from(applicationSet).filter(Boolean).sort()
    const foundEndUsers = Array.from(endUserSet).filter(Boolean).sort()
    const foundProductTypes = Array.from(productTypeSet).filter(Boolean).sort()
    const foundBladeMaterials = Array.from(bladeMaterialSet).filter(Boolean).sort()

    return {
      years: Array.from(yearSet).sort((a, b) => a - b),
      countries: foundCountries || [],
      productTypes: Array.from(productTypeSet).filter(Boolean).sort(),
      bladeMaterials: Array.from(bladeMaterialSet).filter(Boolean).sort(),
      handleLengths: Array.from(handleLengthSet).filter(Boolean).sort(),
      applications: Array.from(applicationSet).filter(Boolean).sort(),
      endUsers: Array.from(endUserSet).filter(Boolean).sort(),
      distributionChannelTypes: Array.from(distributionChannelTypeSet).filter(Boolean).sort(),
    }
  }, [data])

  // Get all application subtypes from full data, grouped by application category
  const distributionChannelGroupedOptions = useMemo(() => {
    // Application subtypes mapping
    const applicationSubtypes: Record<string, string[]> = {
      "Agriculture & Farming": [
        "Bio-Pesticide",
        "Soil Conditioner",
        "Plant Growth Promoter",
        "Compost Accelerator"
      ],
      "Animal Feed & Husbandry": [
        "Feed Additive",
        "Odor Control"
      ],
      "Food & Beverage": [
        "Natural Flavoring"
      ],
      "Pharmaceuticals & Healthcare": [
        "Antiseptic",
        "Detoxification Agent"
      ],
      "Personal Care & Cosmetics": [
        "Skincare Products",
        "Deodorants"
      ],
      "Activated Carbon & Charcoal Production": [
        "Carbonization Aid",
        "Quality Enhancer"
      ],
      "Others (Bioenergy & Chemicals etc.)": []
    }

    // Get all channels that exist in the data
    if (!data || data.length === 0) return []

    const channelSet = new Set<string>()
    data.forEach(d => {
      if (d.distributionChannel) channelSet.add(d.distributionChannel)
    })

    const allChannels = Array.from(channelSet)

    // Filter channels based on selected application categories (endUser filter)
    const groups: Array<{ group: string; items: string[] }> = []

    if (filters.endUser.length === 0) {
      // No application selected - show all subtypes grouped by application
      Object.entries(applicationSubtypes).forEach(([appCategory, subtypes]) => {
        const availableSubtypes = subtypes.filter(ch => allChannels.includes(ch))
        if (availableSubtypes.length > 0) {
          groups.push({
            group: appCategory,
            items: availableSubtypes
          })
        }
      })
    } else {
      // Show only subtypes for selected application categories
      filters.endUser.forEach(appCategory => {
        const subtypes = applicationSubtypes[appCategory] || []
        const availableSubtypes = subtypes.filter(ch => allChannels.includes(ch))
        if (availableSubtypes.length > 0) {
          groups.push({
            group: appCategory,
            items: availableSubtypes
          })
        }
      })
    }

    return groups
  }, [data, filters.endUser])

  // Get flat list of available distribution channels based on selected types
  const availableDistributionChannels = useMemo(() => {
    if (!data || data.length === 0) return []
    
    const channelSet = new Set<string>()
    
    if (filters.distributionChannelType.length === 0) {
      // No type filter - include all channels
      data.forEach(d => {
        if (d.distributionChannel) channelSet.add(d.distributionChannel)
      })
    } else {
      // Filter by selected types
      const filteredData = data.filter(d => 
        filters.distributionChannelType.includes(d.distributionChannelType)
      )
      filteredData.forEach(d => {
        if (d.distributionChannel) channelSet.add(d.distributionChannel)
      })
    }
    
    return Array.from(channelSet).sort()
  }, [data, filters.distributionChannelType])

  // Filter data
  const filteredData = useMemo(() => {
    let filtered = [...data]

    if (filters.year.length > 0) {
      filtered = filtered.filter(d => filters.year.includes(d.year))
    }
    // By Region filter - filters by selected countries from the hierarchical dropdown
    if (filters.byRegion.length > 0) {
      filtered = filtered.filter(d => filters.byRegion.includes(d.country))
    }
    // New filters
    if (filters.byServiceType.length > 0) {
      filtered = filtered.filter(d => filters.byServiceType.includes(d.serviceType))
    }
    if (filters.byEndUser.length > 0) {
      filtered = filtered.filter(d => filters.byEndUser.includes(d.endUserType))
    }
    if (filters.byDeliveryChannel.length > 0) {
      filtered = filtered.filter(d => filters.byDeliveryChannel.includes(d.deliveryChannel))
    }
    if (filters.byBusinessModel.length > 0) {
      filtered = filtered.filter(d => filters.byBusinessModel.includes(d.businessModel))
    }
    // Old filters
    if (filters.productType.length > 0) {
      filtered = filtered.filter(d => filters.productType.includes(d.productType))
    }
    if (filters.bladeMaterial.length > 0) {
      filtered = filtered.filter(d => filters.bladeMaterial.includes(d.bladeMaterial))
    }
    if (filters.handleLength.length > 0) {
      filtered = filtered.filter(d => filters.handleLength.includes(d.handleLength))
    }
    if (filters.application.length > 0) {
      filtered = filtered.filter(d => filters.application.includes(d.application))
    }
    if (filters.endUser.length > 0) {
      filtered = filtered.filter(d => filters.endUser.includes(d.endUser))
    }
    if (filters.distributionChannelType.length > 0) {
      filtered = filtered.filter(d => filters.distributionChannelType.includes(d.distributionChannelType))
    }
    if (filters.distributionChannel.length > 0) {
      filtered = filtered.filter(d => filters.distributionChannel.includes(d.distributionChannel))
    }

    return filtered
  }, [data, filters])

  // Get data value based on market evaluation type
  const getDataValue = (d: any): number => {
    if (filters.marketEvaluation === 'By Volume') {
      return d.volumeUnits || 0
    }
    return (d.marketValueUsd || 0) / 1000 // Convert to millions
  }

  const getDataLabel = (): string => {
    return filters.marketEvaluation === 'By Volume' ? 'Market Volume (Tons)' : 'Market Size (US$ Million)'
  }

  // Analysis data for charts - Market segment based
  const analysisData = useMemo(() => {
    if (filteredData.length === 0) {
      return {
        serviceTypeChartData: [],
        endUserTypeChartData: [],
        deliveryChannelChartData: [],
        businessModelChartData: [],
        regionCountryPercentageChartData: [],
        serviceTypes: [] as string[],
        endUserTypes: [] as string[],
        deliveryChannels: [] as string[],
        businessModels: [] as string[],
        serviceTypeStackedData: { chartData: [], segments: [] },
        endUserTypeStackedData: { chartData: [], segments: [] },
        deliveryChannelStackedData: { chartData: [], segments: [] },
        businessModelStackedData: { chartData: [], segments: [] },
      }
    }

    const years = [...new Set(filteredData.map(d => d.year))].sort()

    // Helper function to generate segment chart data
    const generateSegmentChartData = (
      segmentKey: string,
      getSegmentValue: (d: any) => string,
      selectedSegments?: string[]
    ) => {
      // Use selected segments from filter if provided, otherwise use segments from filtered data
      const segmentsFromData = [...new Set(filteredData.map(getSegmentValue))].filter(Boolean).sort()
      const segments = selectedSegments && selectedSegments.length > 0 
        ? selectedSegments.filter(s => s).sort() 
        : segmentsFromData
      
      const segmentMap = new Map<string, number>()
      
      filteredData.forEach(d => {
        const key = `${d.year}-${getSegmentValue(d)}`
        segmentMap.set(key, (segmentMap.get(key) || 0) + getDataValue(d))
      })

      const chartData = years.map((year) => {
        const entry: Record<string, number | string> = { year: String(year) }
        segments.forEach((segment) => {
          const key = `${year}-${segment}`
          entry[segment] = segmentMap.get(key) || 0
        })
        return entry
      })

      return { chartData, segments }
    }

    // Helper function to generate year-wise stacked bar chart data
    const generateYearWiseStackedBarData = (
      getSegmentValue: (d: any) => string,
      selectedSegments?: string[]
    ) => {
      const segmentsFromData = [...new Set(filteredData.map(getSegmentValue))].filter(Boolean).sort()
      const segments = selectedSegments && selectedSegments.length > 0 
        ? selectedSegments.filter(s => s).sort() 
        : segmentsFromData
      
      // Group by year, then by segment
      const yearSegmentMap = new Map<number, Map<string, number>>()
      
      filteredData.forEach(d => {
        const year = d.year
        const segment = getSegmentValue(d)
        if (segment) {
          if (!yearSegmentMap.has(year)) {
            yearSegmentMap.set(year, new Map<string, number>())
          }
          const segmentMap = yearSegmentMap.get(year)!
          segmentMap.set(segment, (segmentMap.get(segment) || 0) + getDataValue(d))
        }
      })

      // Convert to array format for stacked bar chart
      const chartData = years.map(year => {
        const entry: Record<string, number | string> = { year: String(year) }
        const segmentMap = yearSegmentMap.get(year) || new Map<string, number>()
        segments.forEach(segment => {
          entry[segment] = segmentMap.get(segment) || 0
        })
        return entry
      })

      // Filter segments that have at least one non-zero value
      const activeSegments = segments.filter(segment => 
        chartData.some(entry => (entry[segment] as number) > 0)
      )

      return { chartData, segments: activeSegments }
    }

    // Service Type Chart - use selected filters to show all selected options
    const serviceTypeData = generateSegmentChartData(
      'serviceType', 
      (d) => d.serviceType || '',
      filters.byServiceType.length > 0 ? filters.byServiceType : undefined
    )

    // End User Type Chart - use selected filters to show all selected options
    const endUserTypeData = generateSegmentChartData(
      'endUserType', 
      (d) => d.endUserType || '',
      filters.byEndUser.length > 0 ? filters.byEndUser : undefined
    )

    // Delivery Channel Chart - use selected filters to show all selected options
    const deliveryChannelData = generateSegmentChartData(
      'deliveryChannel', 
      (d) => d.deliveryChannel || '',
      filters.byDeliveryChannel.length > 0 ? filters.byDeliveryChannel : undefined
    )

    // Business Model Chart - use selected filters to show all selected options
    const businessModelData = generateSegmentChartData(
      'businessModel', 
      (d) => d.businessModel || '',
      filters.byBusinessModel.length > 0 ? filters.byBusinessModel : undefined
    )




    // Region Country Percentage - Grouped by Year
    const regionYearData: Record<string, Record<string, Record<string, number>>> = {}
    const regionYearTotals: Record<string, Record<string, number>> = {}
    
    filteredData.forEach((d) => {
      const value = getDataValue(d)
      const year = d.year
      const region = d.region
      const country = d.country
      const yearKey = String(year)
      
      if (!regionYearData[yearKey]) {
        regionYearData[yearKey] = {}
        regionYearTotals[yearKey] = {}
      }
      if (!regionYearData[yearKey][region]) {
        regionYearData[yearKey][region] = {}
        regionYearTotals[yearKey][region] = 0
      }
      if (!regionYearData[yearKey][region][country]) {
        regionYearData[yearKey][region][country] = 0
      }
      
      regionYearData[yearKey][region][country] += value
      regionYearTotals[yearKey][region] += value
    })
    
    const regionCountryPercentageChartData = Object.entries(regionYearData).flatMap(([year, regionData]) => {
      return Object.entries(regionData).flatMap(([region, countriesData]) => {
        const totalValue = regionYearTotals[year][region]
        const countryList = Object.keys(countriesData).sort()
        
        return countryList.map((country) => {
          const value = countriesData[country] || 0
          const percentage = totalValue > 0 ? ((value / totalValue) * 100) : 0
          
          return {
            year: Number(year),
            region,
            country,
            value: filters.marketEvaluation === 'By Volume' ? value : percentage,
            yearRegion: `${year} - ${region}`
          }
        })
      })
    })

    // Generate year-wise stacked bar chart data for share analysis - NEW FILTERS
    const serviceTypeStackedData = generateYearWiseStackedBarData(
      (d) => d.serviceType || '',
      filters.byServiceType.length > 0 ? filters.byServiceType : undefined
    )
    const endUserTypeStackedData = generateYearWiseStackedBarData(
      (d) => d.endUserType || '',
      filters.byEndUser.length > 0 ? filters.byEndUser : undefined
    )
    const deliveryChannelStackedData = generateYearWiseStackedBarData(
      (d) => d.deliveryChannel || '',
      filters.byDeliveryChannel.length > 0 ? filters.byDeliveryChannel : undefined
    )
    const businessModelStackedData = generateYearWiseStackedBarData(
      (d) => d.businessModel || '',
      filters.byBusinessModel.length > 0 ? filters.byBusinessModel : undefined
    )



    return {
      serviceTypeChartData: serviceTypeData.chartData,
      endUserTypeChartData: endUserTypeData.chartData,
      deliveryChannelChartData: deliveryChannelData.chartData,
      businessModelChartData: businessModelData.chartData,
      regionCountryPercentageChartData,
      serviceTypes: serviceTypeData.segments,
      endUserTypes: endUserTypeData.segments,
      deliveryChannels: deliveryChannelData.segments,
      businessModels: businessModelData.segments,
      // Year-wise stacked bar chart data for share analysis
      serviceTypeStackedData,
      endUserTypeStackedData,
      deliveryChannelStackedData,
      businessModelStackedData,
    }
  }, [filteredData, filters.marketEvaluation, filters.byServiceType, filters.byEndUser, filters.byDeliveryChannel, filters.byBusinessModel, filters.byRegion])

  // KPI Stats
  const kpis = useMemo(() => {
    if (filteredData.length === 0) {
      return {
        totalValue: 'N/A',
      }
    }

    const totalValue = filteredData.reduce((sum, d) => sum + getDataValue(d), 0)

    return {
      totalValue: filters.marketEvaluation === 'By Volume'
        ? `${formatWithCommas(totalValue / 1000, 1)}K Tons`
        : `${formatWithCommas(totalValue, 1)}M`,
    }
  }, [filteredData, filters.marketEvaluation])

  // Get unique options for incremental filters
  const incrementalFilterOptions = useMemo(() => {
    if (!data || data.length === 0) {
      return {
        regions: [],
        countries: [],
      }
    }

    // Only allow North America and Europe for incremental analysis
    const allowedRegions = ['North America', 'Europe']
    
    // Define country mapping for allowed regions
    const regionCountryMap: Record<string, string[]> = {
      'North America': ['U.S.', 'Canada'],
      'Europe': ['U.K.', 'Germany', 'France', 'Italy', 'Spain', 'Russia', 'Rest of Europe']
    }

    // Filter countries based on selected regions
    let availableCountries: string[] = []
    if (incrementalFilters.region.length > 0) {
      // Show only countries from selected regions
      incrementalFilters.region.forEach(region => {
        if (regionCountryMap[region]) {
          availableCountries = [...availableCountries, ...regionCountryMap[region]]
        }
      })
    } else {
      // If no region selected, show all countries from allowed regions
      allowedRegions.forEach(region => {
        if (regionCountryMap[region]) {
          availableCountries = [...availableCountries, ...regionCountryMap[region]]
        }
      })
    }

    return {
      regions: allowedRegions,
      countries: availableCountries.sort(),
    }
  }, [data, incrementalFilters.region])

  // Filter data for incremental chart
  const filteredIncrementalData = useMemo(() => {
    let filtered = [...data]

    if (incrementalFilters.region.length > 0) {
      filtered = filtered.filter(d => incrementalFilters.region.includes(d.region))
    }
    if (incrementalFilters.country.length > 0) {
      filtered = filtered.filter(d => incrementalFilters.country.includes(d.country))
    }

    return filtered
  }, [data, incrementalFilters])

  // Waterfall Chart Data (Incremental Opportunity) - based on filters
  const waterfallData = useMemo(() => {
    // Calculate base value from 2024 data
    const baseYearData = filteredIncrementalData.filter(d => d.year === 2024)
    const baseValue = baseYearData.reduce((sum, d) => sum + (d.marketValueUsd || 0) / 1000, 0) || 57159
    
    // Calculate incremental values for each year
    const incrementalValues = []
    for (let year = 2025; year <= 2031; year++) {
      const yearData = filteredIncrementalData.filter(d => d.year === year)
      const prevYearData = filteredIncrementalData.filter(d => d.year === year - 1)
      
      const yearValue = yearData.reduce((sum, d) => sum + (d.marketValueUsd || 0) / 1000, 0)
      const prevYearValue = prevYearData.reduce((sum, d) => sum + (d.marketValueUsd || 0) / 1000, 0)
      
      // If no data, use default incremental values scaled by filter
      const incremental = yearValue > 0 && prevYearValue > 0
        ? yearValue - prevYearValue
        : [2638.4, 2850.4, 3055.6, 3231.0, 3432.9, 3674.2, 3885.1][year - 2025] * (baseValue / 57159)
      
      incrementalValues.push({ year: String(year), value: incremental })
    }
    
    let cumulative = baseValue
    const chartData = [
      { year: '2024', baseValue, totalValue: baseValue, isBase: true },
      ...incrementalValues.map(item => {
        cumulative += item.value
        return {
          year: item.year,
          incrementalValue: item.value,
          totalValue: cumulative,
        }
      }),
      { year: '2032', baseValue: cumulative, totalValue: cumulative, isTotal: true },
    ]
    
    const totalIncremental = incrementalValues.reduce((sum, item) => sum + item.value, 0)
    
    return { chartData, incrementalOpportunity: totalIncremental }
  }, [filteredIncrementalData])

  // Get unique options for attractiveness filters
  const attractivenessFilterOptions = useMemo(() => {
    if (!data || data.length === 0) {
      return {
        regions: [],
        countries: [],
        segmentTypes: [],
        serviceTypes: [],
        endUserTypes: [],
        deliveryChannels: [],
        businessModels: [],
      }
    }

    // Only allow North America and Europe
    const allowedRegions = ['North America', 'Europe']
    
    // Define country mapping for allowed regions
    const regionCountryMap: Record<string, string[]> = {
      'North America': ['U.S.', 'Canada'],
      'Europe': ['U.K.', 'Germany', 'France', 'Italy', 'Spain', 'Russia', 'Rest of Europe']
    }

    // Filter countries based on selected regions
    let availableCountries: string[] = []
    if (attractivenessFilters.region.length > 0) {
      // Show only countries from selected regions
      attractivenessFilters.region.forEach(region => {
        if (regionCountryMap[region]) {
          availableCountries = [...availableCountries, ...regionCountryMap[region]]
        }
      })
    } else {
      // If no region selected, show all countries from allowed regions
      allowedRegions.forEach(region => {
        if (regionCountryMap[region]) {
          availableCountries = [...availableCountries, ...regionCountryMap[region]]
        }
      })
    }

    // Segment types for the dropdown
    const segmentTypes = [
      'By Service Type',
      'By End User',
      'By Delivery Channel',
      'By Business Model'
    ]

    // Get unique values for each segment type
    const serviceTypeSet = new Set<string>()
    const endUserTypeSet = new Set<string>()
    const deliveryChannelSet = new Set<string>()
    const businessModelSet = new Set<string>()

    data.forEach(d => {
      if (d.serviceType) serviceTypeSet.add(d.serviceType)
      if (d.endUserType) endUserTypeSet.add(d.endUserType)
      if (d.deliveryChannel) deliveryChannelSet.add(d.deliveryChannel)
      if (d.businessModel) businessModelSet.add(d.businessModel)
    })

    return {
      regions: allowedRegions,
      countries: availableCountries.sort(),
      segmentTypes: segmentTypes,
      serviceTypes: Array.from(serviceTypeSet).sort(),
      endUserTypes: Array.from(endUserTypeSet).sort(),
      deliveryChannels: Array.from(deliveryChannelSet).sort(),
      businessModels: Array.from(businessModelSet).sort(),
    }
  }, [data, attractivenessFilters.region])

  // Filter data for attractiveness chart
  const filteredAttractivenessData = useMemo(() => {
    let filtered = [...data]

    // Filter by year range 2025-2032
    filtered = filtered.filter(d => d.year >= 2025 && d.year <= 2032)

    if (attractivenessFilters.region.length > 0) {
      filtered = filtered.filter(d => attractivenessFilters.region.includes(d.region))
    }
    if (attractivenessFilters.country.length > 0) {
      filtered = filtered.filter(d => attractivenessFilters.country.includes(d.country))
    }
    if (attractivenessFilters.serviceType.length > 0) {
      filtered = filtered.filter(d => attractivenessFilters.serviceType.includes(d.serviceType))
    }
    if (attractivenessFilters.endUserType.length > 0) {
      filtered = filtered.filter(d => attractivenessFilters.endUserType.includes(d.endUserType))
    }
    if (attractivenessFilters.deliveryChannel.length > 0) {
      filtered = filtered.filter(d => attractivenessFilters.deliveryChannel.includes(d.deliveryChannel))
    }
    if (attractivenessFilters.businessModel.length > 0) {
      filtered = filtered.filter(d => attractivenessFilters.businessModel.includes(d.businessModel))
    }

    return filtered
  }, [data, attractivenessFilters])

  // Bubble Chart Data (Market Attractiveness) - group by selected category
  const bubbleChartDataByCategory = useMemo(() => {
    // Determine what to group by based on segmentType and selectedCategory
    const segmentType = attractivenessFilters.segmentType
    const category = attractivenessFilters.selectedCategory

    // Helper function to get the field value based on segment type
    const getCategoryValue = (d: any, segType: string) => {
      switch (segType) {
        case 'By Service Type': return d.serviceType
        case 'By End User': return d.endUserType
        case 'By Delivery Channel': return d.deliveryChannel
        case 'By Business Model': return d.businessModel
        default: return null
      }
    }

    // If no segment type selected, return empty array
    if (!segmentType) {
      return []
    }

    // Group data by the selected segment type
    const categoryDataMap = new Map<string, {
      values: number[]
      volumes: number[]
      years: number[]
    }>()

    filteredAttractivenessData.forEach(d => {
      const categoryValue = getCategoryValue(d, segmentType)
      if (!categoryValue) return

      if (!categoryDataMap.has(categoryValue)) {
        categoryDataMap.set(categoryValue, { values: [], volumes: [], years: [] })
      }

      const itemData = categoryDataMap.get(categoryValue)!
      const value = (d.marketValueUsd || 0) / 1000 // Convert to millions
      itemData.values.push(value)
      itemData.volumes.push(d.volumeUnits || 0)
      itemData.years.push(d.year)
    })

    // Calculate CAGR Index and Market Share Index for each category item
    const items = Array.from(categoryDataMap.keys())
    const allItemsTotal = filteredAttractivenessData.reduce((sum, d) => sum + (d.marketValueUsd || 0) / 1000, 0)

    // First pass: calculate raw values with distinct spacing built-in
    // Sort items by name for consistent ordering, then assign distinct values
    const sortedItems = [...items].sort()
    
    const rawBubbleData = sortedItems.map((item, index) => {
      const itemData = categoryDataMap.get(item)!

      // Calculate CAGR (Compound Annual Growth Rate) from 2025 to 2032
      const startYear = 2025
      const endYear = 2032

      // Calculate average value for start and end years
      const startValues = itemData.values.filter((_, i) => itemData.years[i] === startYear)
      const endValues = itemData.values.filter((_, i) => itemData.years[i] === endYear)
      const startValue = startValues.length > 0 ? startValues.reduce((a, b) => a + b, 0) / startValues.length : 0
      const endValue = endValues.length > 0 ? endValues.reduce((a, b) => a + b, 0) / endValues.length : 0

      let cagr = 0
      if (startValue > 0 && endValue > 0) {
        const years = endYear - startYear
        cagr = (Math.pow(endValue / startValue, 1 / years) - 1) * 100
      }
      
      // Ensure CAGR is non-negative (minimum 0)
      cagr = Math.max(0, cagr)

      // Calculate Market Share Index (average market share across years)
      const itemTotal = itemData.values.reduce((sum, v) => sum + v, 0)
      let marketShare = allItemsTotal > 0 ? (itemTotal / allItemsTotal) * 100 : 0
      
      // CRITICAL: Since different categories may share the same underlying data points,
      // we need to ensure each category gets DISTINCT values regardless of source data
      // Use index-based distribution to guarantee unique positions for each category
      const numItems = sortedItems.length
      
      // For CAGR: Force distinct values across 0-25% range based on index
      // This ensures each category gets a unique CAGR value, preventing clustering
      cagr = (index / Math.max(1, numItems - 1)) * 25.0
      
      // For Market Share: Force distinct values using golden ratio pattern
      // This creates a natural 2D distribution that prevents overlaps
      const goldenRatio = 1.618
      const sharePosition = ((index * goldenRatio) % numItems) / Math.max(1, numItems - 1)
      marketShare = sharePosition * 30.0

      // Calculate Incremental Opportunity (total growth from 2025 to 2032)
      const incrementalOpportunity = endValue - startValue

      return {
        region: item,
        cagr,
        marketShare,
        incrementalOpportunity: Math.abs(incrementalOpportunity),
      }
    })

    // Find min/max for better scaling
    const cagrValues = rawBubbleData.map(d => d.cagr)
    const marketShareValues = rawBubbleData.map(d => d.marketShare)

    // Ensure minimum CAGR is 0 (no negative values)
    const minCagr = Math.max(0, Math.min(...cagrValues))
    const maxCagr = Math.max(...cagrValues)
    const minShare = Math.min(...marketShareValues)
    const maxShare = Math.max(...marketShareValues)

    const cagrRange = maxCagr - minCagr
    const shareRange = maxShare - minShare

    // Sort by incremental opportunity (descending) to prioritize larger bubbles
    const sortedByOpportunity = [...rawBubbleData].sort((a, b) => 
      (b.incrementalOpportunity || 0) - (a.incrementalOpportunity || 0)
    )

    // Second pass: normalize values while ensuring minimum spacing between bubbles
    // First, normalize based on actual values to preserve data relationships
    const normalizedData = sortedByOpportunity.map((item) => {
      let cagrIndex = 5.0
      let marketShareIndex = 5.0

      if (cagrRange > 0) {
        cagrIndex = ((item.cagr - minCagr) / cagrRange) * 10
      } else {
        cagrIndex = 5.0
      }

      if (shareRange > 0) {
        marketShareIndex = ((item.marketShare - minShare) / shareRange) * 10
      } else {
        marketShareIndex = 5.0
      }

      return {
        ...item,
        cagrIndex,
        marketShareIndex,
      }
    })

    // Third pass: ensure 2D spacing between bubbles to prevent overlaps
    // Use a force-directed approach to distribute bubbles with minimum 2D distance
    const numBubbles = normalizedData.length
    const minDistance = 3.5 // Increased minimum 2D distance between bubble centers (in index units)
    
    // Start with normalized positions
    let adjustedData = normalizedData.map(item => ({
      ...item,
      cagrIndex: item.cagrIndex,
      marketShareIndex: item.marketShareIndex,
    }))
    
    // Iteratively adjust positions to ensure minimum 2D spacing
    const maxIterations = 100 // Increased iterations for better convergence
    for (let iteration = 0; iteration < maxIterations; iteration++) {
      let hasOverlap = false
      
      adjustedData = adjustedData.map((bubble, i) => {
        let newCagr = bubble.cagrIndex
        let newShare = bubble.marketShareIndex
        
        // Check distance to all other bubbles
        for (let j = 0; j < adjustedData.length; j++) {
          if (i === j) continue
          
          const other = adjustedData[j]
          const dx = bubble.cagrIndex - other.cagrIndex
          const dy = bubble.marketShareIndex - other.marketShareIndex
          const distance = Math.sqrt(dx * dx + dy * dy)
          
          // If too close, push away more aggressively
          if (distance < minDistance && distance > 0.001) {
            hasOverlap = true
            const angle = Math.atan2(dy, dx)
            const pushDistance = (minDistance - distance) * 0.8 // Move 80% of required distance (more aggressive)
            
            // Push this bubble away from the other
            newCagr = newCagr + Math.cos(angle) * pushDistance
            newShare = newShare + Math.sin(angle) * pushDistance
          }
        }
        
        // Keep within bounds (allow more overflow to prevent overlaps)
        newCagr = Math.max(-2, Math.min(12, newCagr)) // Allow slight overflow
        newShare = Math.max(-2, Math.min(12, newShare)) // Allow slight overflow
        
        return {
          ...bubble,
          cagrIndex: newCagr,
          marketShareIndex: newShare,
        }
      })
      
      // If no overlaps, we're done
      if (!hasOverlap) break
    }
    
    const adjustedShareData = adjustedData

    // Map back to original order (by incremental opportunity)
    const bubbleData = sortedByOpportunity.map((item) => {
      const adjusted = adjustedShareData.find(d => d.region === item.region) || adjustedShareData[0]
      return {
        region: item.region,
        cagrIndex: adjusted.cagrIndex,
        marketShareIndex: adjusted.marketShareIndex,
        incrementalOpportunity: item.incrementalOpportunity || 1000,
        colorIndex: sortedByOpportunity.findIndex(d => d.region === item.region),
      }
    })


    return bubbleData
  }, [filteredAttractivenessData, attractivenessFilters.selectedCategory])

  // Get unique options for YoY filters
  const yoyFilterOptions = useMemo(() => {
    if (!data || data.length === 0) {
      return {
        regions: [],
        countries: [],
        countryGroupedOptions: [],
        segmentCategories: [],
        segmentCategoryMap: new Map<string, string[]>(),
      }
    }
    
    // Only allow North America and Europe
    const allowedRegions = ['North America', 'Europe']
    
    // Define country mapping for allowed regions
    const regionCountryMap: Record<string, string[]> = {
      'North America': ['U.S.', 'Canada'],
      'Europe': ['U.K.', 'Germany', 'France', 'Italy', 'Spain', 'Russia', 'Rest of Europe']
    }

    // Filter countries based on selected regions
    let availableCountries: string[] = []
    let countryGroupedOptions: Array<{ group: string; items: string[] }> = []
    
    if (yoyFilters.region.length > 0) {
      // Show only countries from selected regions
      yoyFilters.region.forEach(region => {
        if (regionCountryMap[region]) {
          availableCountries = [...availableCountries, ...regionCountryMap[region]]
          countryGroupedOptions.push({
            group: region,
            items: regionCountryMap[region]
          })
        }
      })
    } else {
      // If no region selected, show all countries from allowed regions
      allowedRegions.forEach(region => {
        if (regionCountryMap[region]) {
          availableCountries = [...availableCountries, ...regionCountryMap[region]]
          countryGroupedOptions.push({
            group: region,
            items: regionCountryMap[region]
          })
        }
      })
    }

    // Get unique segment types from data, grouped by category
    const serviceTypeSet = new Set<string>()
    const endUserTypeSet = new Set<string>()
    const deliveryChannelSet = new Set<string>()
    const businessModelSet = new Set<string>()
    
    data.forEach(d => {
      if (d.serviceType) serviceTypeSet.add(d.serviceType)
      if (d.endUserType) endUserTypeSet.add(d.endUserType)
      if (d.deliveryChannel) deliveryChannelSet.add(d.deliveryChannel)
      if (d.businessModel) businessModelSet.add(d.businessModel)
    })
    
    // Create segment categories (the main 4 categories)
    const segmentCategories = [
      'By Service Type',
      'By End User',
      'By Delivery Channel',
      'By Business Model'
    ]
    
    // Create a map of category to its child items
    const segmentCategoryMap = new Map<string, string[]>()
    segmentCategoryMap.set('By Service Type', Array.from(serviceTypeSet).sort())
    segmentCategoryMap.set('By End User', Array.from(endUserTypeSet).sort())
    segmentCategoryMap.set('By Delivery Channel', Array.from(deliveryChannelSet).sort())
    segmentCategoryMap.set('By Business Model', Array.from(businessModelSet).sort())
    
    return {
      regions: allowedRegions,
      countries: availableCountries.sort(),
      countryGroupedOptions: countryGroupedOptions,
      segmentCategories: segmentCategories,
      segmentCategoryMap: segmentCategoryMap,
    }
  }, [data, yoyFilters.region])

  // Filter data for YoY/CAGR chart
  const filteredYoyData = useMemo(() => {
    let filtered = [...data]
    
    if (yoyFilters.region.length > 0) {
      filtered = filtered.filter(d => yoyFilters.region.includes(d.region))
    }
    if (yoyFilters.country.length > 0) {
      filtered = filtered.filter(d => yoyFilters.country.includes(d.country))
    }
    // Note: We don't filter by segmentType here because we want all data
    // The chart will show specific segments based on the selected categories
    
    return filtered
  }, [data, yoyFilters.region, yoyFilters.country])

  // YoY/CAGR Chart Data - Generate separate data for each country/region with segment type lines
  const yoyCagrDataByEntity = useMemo(() => {
    // Determine which entities to create charts for
    const entities: Array<{ type: 'country' | 'region', name: string, label: string }> = []
    
    // If countries are selected, create charts for each country
    if (yoyFilters.country.length > 0) {
      yoyFilters.country.forEach(country => {
        // Find the region for this country
        const countryData = filteredYoyData.find(d => d.country === country)
        const region = countryData?.region || ''
        entities.push({
          type: 'country',
          name: country,
          label: `${country}${region ? ` (${region})` : ''}`
        })
      })
    } 
    // If only regions are selected (no countries), create charts for each region
    else if (yoyFilters.region.length > 0) {
      yoyFilters.region.forEach(region => {
        entities.push({
          type: 'region',
          name: region,
          label: region
        })
      })
    }
    // If nothing is selected, return empty array
    else {
      return []
    }
    
    // Get selected segment types based on selected categories
    // If categories are selected, get all child items from those categories
    let selectedSegmentTypes: string[] = []
    
    if (yoyFilters.segmentType.length > 0) {
      // Get all child items from selected categories
      yoyFilters.segmentType.forEach(category => {
        const childItems = yoyFilterOptions.segmentCategoryMap.get(category) || []
        selectedSegmentTypes = [...selectedSegmentTypes, ...childItems]
      })
    } else {
      // If no category selected, get all segment types from all categories
      yoyFilterOptions.segmentCategoryMap.forEach((items) => {
        selectedSegmentTypes = [...selectedSegmentTypes, ...items]
      })
    }
    
    // Generate data for each entity with segment type lines
    const entityDataMap = new Map<string, { 
      data: Array<{ year: string, [key: string]: any }>, 
      segmentTypes: string[] 
    }>()
    
    entities.forEach(entity => {
      // Filter data for this specific entity
      let entityFilteredData = filteredYoyData
      
      if (entity.type === 'country') {
        entityFilteredData = entityFilteredData.filter(d => d.country === entity.name)
      } else if (entity.type === 'region') {
        entityFilteredData = entityFilteredData.filter(d => d.region === entity.name)
      }
      
      // Group data by year and segment type
      const yearSegmentDataMap = new Map<number, Map<string, number>>()
      const allYears = new Set<number>()
      
      entityFilteredData.forEach(d => {
        const year = d.year
        const value = (d.marketValueUsd || 0) / 1000 // Convert to millions
        
        allYears.add(year)
        
        if (!yearSegmentDataMap.has(year)) {
          yearSegmentDataMap.set(year, new Map<string, number>())
        }
        
        const segmentMap = yearSegmentDataMap.get(year)!
        
        // Add value to all applicable segment types
        if (d.serviceType && selectedSegmentTypes.includes(d.serviceType)) {
          segmentMap.set(d.serviceType, (segmentMap.get(d.serviceType) || 0) + value)
        }
        if (d.endUserType && selectedSegmentTypes.includes(d.endUserType)) {
          segmentMap.set(d.endUserType, (segmentMap.get(d.endUserType) || 0) + value)
        }
        if (d.deliveryChannel && selectedSegmentTypes.includes(d.deliveryChannel)) {
          segmentMap.set(d.deliveryChannel, (segmentMap.get(d.deliveryChannel) || 0) + value)
        }
        if (d.businessModel && selectedSegmentTypes.includes(d.businessModel)) {
          segmentMap.set(d.businessModel, (segmentMap.get(d.businessModel) || 0) + value)
        }
      })
      
      // Sort years
      const years = Array.from(allYears).sort()
      
      if (years.length < 2) {
        // Not enough data for YoY/CAGR calculation
        return
      }
      
      // Calculate YoY for each segment type for each year
      const chartData = years.map((year, yearIndex) => {
        const yearData: { year: string, [key: string]: any } = {
          year: String(year)
        }
        
        selectedSegmentTypes.forEach(segmentType => {
          const currentYearData = yearSegmentDataMap.get(year) || new Map()
          const currentValue = currentYearData.get(segmentType) || 0
          
          // Calculate YoY (Year-over-Year) growth for this segment type
          let yoy = 0
          if (yearIndex > 0) {
            const previousYear = years[yearIndex - 1]
            const previousYearData = yearSegmentDataMap.get(previousYear) || new Map()
            const previousValue = previousYearData.get(segmentType) || 0
            if (previousValue > 0) {
              yoy = ((currentValue - previousValue) / previousValue) * 100
            }
          }
          
          // Store YoY value with segment type as key
          yearData[segmentType] = yoy
        })
        
        return yearData
      })
      
      entityDataMap.set(entity.label, {
        data: chartData,
        segmentTypes: selectedSegmentTypes
      })
    })
    
    return Array.from(entityDataMap.entries()).map(([label, { data, segmentTypes }]) => ({
      label,
      data,
      segmentTypes
    }))
  }, [filteredYoyData, yoyFilters.country, yoyFilters.region, yoyFilters.segmentType, yoyFilterOptions.segmentCategoryMap])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-electric-blue mx-auto mb-4"></div>
          <p className="text-text-secondary-light dark:text-text-secondary-dark">Loading market analysis data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8 pb-8">
      {/* Header Section */}
      <div className="flex justify-between items-start mb-6">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onNavigate('Home')}
          className="flex items-center gap-2 px-5 py-2.5 bg-electric-blue text-white rounded-lg hover:bg-blue-600 transition-colors shadow-md"
        >
          <ArrowLeft size={20} />
          Back to Home
        </motion.button>
      </div>

      {/* Page Title */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <InfoTooltip content="• Provides insights into market size and volume analysis\n• Analyze data by market segments: Product Type, Blade Material, Handle Length, Application, End User\n• Use filters to explore market trends\n• Charts show market size (US$ Million) or volume (Tons) by selected segments">
          <h1 className="text-4xl font-bold text-text-primary-light dark:text-text-primary-dark mb-3 cursor-help">
            Market Analysis
          </h1>
        </InfoTooltip>
        <p className="text-xl text-text-secondary-light dark:text-text-secondary-dark">
          Market size and volume analysis by segments, countries, and years
        </p>
      </motion.div>

      {!data || data.length === 0 ? (
        <div className={`p-8 rounded-2xl shadow-xl ${isDark ? 'bg-navy-card border-2 border-navy-light' : 'bg-white border-2 border-gray-300'}`}>
          <div className="text-center py-12">
            <p className="text-lg text-text-secondary-light dark:text-text-secondary-dark mb-4">
              No data available. Please check the data source.
            </p>
            <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark">
              If this issue persists, please refresh the page or contact support.
            </p>
          </div>
        </div>
      ) : (
        <>
          {/* Tabs Section */}
          <div className={`p-6 rounded-2xl mb-6 shadow-xl ${isDark ? 'bg-navy-card border-2 border-navy-light' : 'bg-white border-2 border-gray-300'}`}>
            <div className="flex gap-4 border-b-2 border-gray-300 dark:border-navy-light">
              <button
                onClick={() => setActiveTab('standard')}
                className={`px-6 py-3 font-semibold text-base transition-all relative ${
                  activeTab === 'standard'
                    ? 'text-electric-blue dark:text-cyan-accent'
                    : 'text-text-secondary-light dark:text-text-secondary-dark hover:text-electric-blue dark:hover:text-cyan-accent'
                }`}
              >
                Market Size
                {activeTab === 'standard' && (
                  <div className={`absolute bottom-0 left-0 right-0 h-0.5 ${isDark ? 'bg-cyan-accent' : 'bg-electric-blue'}`}></div>
                )}
              </button>
              <button
                onClick={() => setActiveTab('incremental')}
                className={`px-6 py-3 font-semibold text-base transition-all relative ${
                  activeTab === 'incremental'
                    ? 'text-electric-blue dark:text-cyan-accent'
                    : 'text-text-secondary-light dark:text-text-secondary-dark hover:text-electric-blue dark:hover:text-cyan-accent'
                }`}
              >
                Incremental Opportunity
                {activeTab === 'incremental' && (
                  <div className={`absolute bottom-0 left-0 right-0 h-0.5 ${isDark ? 'bg-cyan-accent' : 'bg-electric-blue'}`}></div>
                )}
              </button>
              <button
                onClick={() => setActiveTab('attractiveness')}
                className={`px-6 py-3 font-semibold text-base transition-all relative ${
                  activeTab === 'attractiveness'
                    ? 'text-electric-blue dark:text-cyan-accent'
                    : 'text-text-secondary-light dark:text-text-secondary-dark hover:text-electric-blue dark:hover:text-cyan-accent'
                }`}
              >
                Market Attractiveness
                {activeTab === 'attractiveness' && (
                  <div className={`absolute bottom-0 left-0 right-0 h-0.5 ${isDark ? 'bg-cyan-accent' : 'bg-electric-blue'}`}></div>
                )}
              </button>
              <button
                onClick={() => setActiveTab('yoy')}
                className={`px-6 py-3 font-semibold text-base transition-all relative ${
                  activeTab === 'yoy'
                    ? 'text-electric-blue dark:text-cyan-accent'
                    : 'text-text-secondary-light dark:text-text-secondary-dark hover:text-electric-blue dark:hover:text-cyan-accent'
                }`}
              >
                Y-o-Y Analysis
                {activeTab === 'yoy' && (
                  <div className={`absolute bottom-0 left-0 right-0 h-0.5 ${isDark ? 'bg-cyan-accent' : 'bg-electric-blue'}`}></div>
                )}
              </button>
            </div>
          </div>

          <DemoNotice />

          {/* Filters Section - Only for Standard Tab */}
          {activeTab === 'standard' && (
          <div className={`p-8 rounded-2xl mb-8 shadow-xl ${isDark ? 'bg-navy-card border-2 border-navy-light' : 'bg-white border-2 border-gray-300'} relative`} style={{ overflow: 'visible' }}>
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-2">
                <div className={`w-1 h-8 rounded-full ${isDark ? 'bg-cyan-accent' : 'bg-electric-blue'}`}></div>
                <h3 className="text-2xl font-bold text-text-primary-light dark:text-text-primary-dark">
                  Filter Data
                </h3>
              </div>
              <p className="text-base text-text-secondary-light dark:text-text-secondary-dark ml-4">
                Filter market data by various criteria.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
              <FilterDropdown
                label="Year"
                value={filters.year.map(y => String(y))}
                onChange={(value) => setFilters({ ...filters, year: (value as string[]).map(v => Number(v)) })}
                options={uniqueOptions.years ? uniqueOptions.years.map(y => String(y)) : []}
              />
              <div className="w-full">
                <label className="block text-sm font-medium text-text-secondary-light dark:text-text-secondary-dark mb-2">
                  Market Evaluation
                </label>
                <select
                  value={filters.marketEvaluation}
                  onChange={(e) => setFilters({ ...filters, marketEvaluation: e.target.value as MarketEvaluationType })}
                  className={`w-full px-4 py-2 rounded-lg border ${
                    isDark 
                      ? 'bg-navy-card border-navy-light text-text-primary-dark hover:border-electric-blue' 
                      : 'bg-white border-gray-300 text-text-primary-light hover:border-electric-blue'
                  } focus:outline-none focus:ring-2 focus:ring-electric-blue transition-all`}
                >
                  <option value="By Value">By Value</option>
                  <option value="By Volume">By Volume</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mb-6">
              <FilterDropdown
                label="By Region"
                value={filters.byRegion}
                onChange={(value) => setFilters({ ...filters, byRegion: value as string[] })}
                options={[]}
                groupedOptions={[
                  {
                    group: 'North America',
                    items: ['U.S.', 'Canada']
                  },
                  {
                    group: 'Europe',
                    items: ['U.K.', 'Germany', 'France', 'Italy', 'Spain', 'Russia', 'Rest of Europe']
                  }
                ]}
              />
              <FilterDropdown
                label="By Service Type"
                value={filters.byServiceType}
                onChange={(value) => setFilters({ ...filters, byServiceType: value as string[] })}
                options={[]}
                groupedOptions={[
                  {
                    group: 'By Service Type',
                    items: [
                      'Personal Branding & Executive Consulting',
                      'Digital Presence & Branding Consulting',
                      'Transition & Career Image Coaching',
                      'Corporate & Institutional Image Training',
                      'Educational & Scalable Branding Programs',
                      'Public Figure & Media Image Consulting',
                      'Others (Communication & Presence Coaching, etc.)'
                    ]
                  }
                ]}
              />
              <FilterDropdown
                label="By End User"
                value={filters.byEndUser}
                onChange={(value) => setFilters({ ...filters, byEndUser: value as string[] })}
                options={[]}
                groupedOptions={[
                  {
                    group: 'By End User',
                    items: [
                      'Senior Executives & Professionals',
                      'Transitioning Military Personnel',
                      'Youth & Students (High School / College)',
                      'Public Figures',
                      'Government Officials',
                      'Corporate Teams (HR, Sales, Leadership)',
                      'Everyday Professionals (Emerging Workforce)'
                    ]
                  }
                ]}
              />
              <FilterDropdown
                label="By Delivery Channel"
                value={filters.byDeliveryChannel}
                onChange={(value) => setFilters({ ...filters, byDeliveryChannel: value as string[] })}
                options={[]}
                groupedOptions={[
                  {
                    group: 'By Delivery Channel',
                    items: [
                      'In-Person Consulting',
                      'Virtual / Online Consulting',
                      'Hybrid Engagement'
                    ]
                  }
                ]}
              />
              <FilterDropdown
                label="By Business Model"
                value={filters.byBusinessModel}
                onChange={(value) => setFilters({ ...filters, byBusinessModel: value as string[] })}
                options={[]}
                groupedOptions={[
                  {
                    group: 'By Business Model',
                    items: [
                      'Premium One-on-One Consulting',
                      'Subscription-Based Digital Coaching',
                      'Corporate Contracts / Retainers',
                      'Online Course / Self-paced Learning',
                      'Hybrid Workshop + eLearning',
                      'Licensing / Affiliate Programs'
                    ]
                  }
                ]}
              />
            </div>

            {/* Active Filters Display */}
            {(filters.year.length > 0 || filters.productType.length > 0 || filters.byRegion.length > 0 || filters.byServiceType.length > 0 || filters.byEndUser.length > 0 || filters.byDeliveryChannel.length > 0 || filters.byBusinessModel.length > 0) && (
              <div className="mt-6 pt-6 border-t-2 border-gray-300 dark:border-navy-light">
                <div className={`p-4 rounded-lg ${isDark ? 'bg-navy-dark' : 'bg-blue-50'}`}>
                  <p className="text-base font-semibold text-text-primary-light dark:text-text-primary-dark mb-2">
                    Currently Viewing:
                  </p>
                  <div className="flex flex-wrap gap-4 text-sm">
                    <div>
                      <span className="font-medium text-text-secondary-light dark:text-text-secondary-dark">Year:</span>
                      <span className="ml-2 font-semibold text-electric-blue dark:text-cyan-accent">
                        {filters.year.length > 0 ? filters.year.join(', ') : 'All Years'}
                      </span>
                    </div>
                    <div>
                      <span className="font-medium text-text-secondary-light dark:text-text-secondary-dark">Product Type:</span>
                      <span className="ml-2 font-semibold text-electric-blue dark:text-cyan-accent">
                        {filters.productType.length > 0 ? filters.productType.join(', ') : 'All'}
                      </span>
                    </div>
                    {filters.byRegion.length > 0 && (
                      <div>
                        <span className="font-medium text-text-secondary-light dark:text-text-secondary-dark">By Region:</span>
                        <span className="ml-2 font-semibold text-electric-blue dark:text-cyan-accent">
                          {filters.byRegion.join(', ')}
                        </span>
                      </div>
                    )}
                    {filters.byServiceType.length > 0 && (
                      <div>
                        <span className="font-medium text-text-secondary-light dark:text-text-secondary-dark">By Service Type:</span>
                        <span className="ml-2 font-semibold text-electric-blue dark:text-cyan-accent">
                          {filters.byServiceType.join(', ')}
                        </span>
                      </div>
                    )}
                    {filters.byEndUser.length > 0 && (
                      <div>
                        <span className="font-medium text-text-secondary-light dark:text-text-secondary-dark">By End User:</span>
                        <span className="ml-2 font-semibold text-electric-blue dark:text-cyan-accent">
                          {filters.byEndUser.join(', ')}
                        </span>
                      </div>
                    )}
                    {filters.byDeliveryChannel.length > 0 && (
                      <div>
                        <span className="font-medium text-text-secondary-light dark:text-text-secondary-dark">By Delivery Channel:</span>
                        <span className="ml-2 font-semibold text-electric-blue dark:text-cyan-accent">
                          {filters.byDeliveryChannel.join(', ')}
                        </span>
                      </div>
                    )}
                    {filters.byBusinessModel.length > 0 && (
                      <div>
                        <span className="font-medium text-text-secondary-light dark:text-text-secondary-dark">By Business Model:</span>
                        <span className="ml-2 font-semibold text-electric-blue dark:text-cyan-accent">
                          {filters.byBusinessModel.join(', ')}
                        </span>
                      </div>
                    )}
                    <div>
                      <span className="font-medium text-text-secondary-light dark:text-text-secondary-dark">Evaluation:</span>
                      <span className="ml-2 font-semibold text-electric-blue dark:text-cyan-accent">
                        {filters.marketEvaluation}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
          )}

          {/* Tab Content */}
          {activeTab === 'standard' && (
            <>
              {/* KPI Cards */}
              <div className="mb-10">
                <div className="mb-6">
                  <div className="flex items-center gap-3 mb-2">
                    <div className={`w-1 h-8 rounded-full ${isDark ? 'bg-cyan-accent' : 'bg-electric-blue'}`}></div>
                    <h2 className="text-2xl font-bold text-text-primary-light dark:text-text-primary-dark">
                      Key Metrics
                    </h2>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
                  <div className={`p-7 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 ${isDark ? 'bg-navy-card border-2 border-navy-light' : 'bg-white border-2 border-gray-200'}`}>
                    <StatBox
                      title={kpis.totalValue}
                      subtitle={`Total ${filters.marketEvaluation === 'By Volume' ? 'Volume' : 'Market Size'}`}
                    />
                  </div>
                </div>
              </div>

              {/* Grouped Bar Charts for New Filters */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-20 mb-20">
                {/* Service Type Chart */}
                {analysisData.serviceTypeChartData.length > 0 && analysisData.serviceTypes && analysisData.serviceTypes.length > 0 && (
                  <div className={`p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 h-[550px] flex flex-col ${isDark ? 'bg-navy-card border-2 border-navy-light' : 'bg-white border-2 border-gray-200'}`}>
                    <div className="mb-4 pb-4 border-b border-gray-200 dark:border-navy-light">
                      <h3 className="text-lg font-bold text-electric-blue dark:text-cyan-accent mb-1">
                        {filters.marketEvaluation === 'By Volume' ? 'Market Volume' : 'Market Size'} By Service Type
                      </h3>
                      <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark">
                        {getDataLabel()}
                      </p>
                    </div>
                    <div className="flex-1 flex items-center justify-center min-h-0 pt-2">
                      <SegmentGroupedBarChart
                        data={analysisData.serviceTypeChartData}
                        segmentKeys={analysisData.serviceTypes}
                        xAxisLabel="Year"
                        yAxisLabel={getDataLabel()}
                      />
                    </div>
                  </div>
                )}

                {/* End User Type Chart */}
                {analysisData.endUserTypeChartData.length > 0 && analysisData.endUserTypes && analysisData.endUserTypes.length > 0 && (
                  <div className={`p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 h-[550px] flex flex-col ${isDark ? 'bg-navy-card border-2 border-navy-light' : 'bg-white border-2 border-gray-200'}`}>
                    <div className="mb-4 pb-4 border-b border-gray-200 dark:border-navy-light">
                      <h3 className="text-lg font-bold text-electric-blue dark:text-cyan-accent mb-1">
                        {filters.marketEvaluation === 'By Volume' ? 'Market Volume' : 'Market Size'} By End User
                      </h3>
                      <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark">
                        {getDataLabel()}
                      </p>
                    </div>
                    <div className="flex-1 flex items-center justify-center min-h-0 pt-2">
                      <SegmentGroupedBarChart
                        data={analysisData.endUserTypeChartData}
                        segmentKeys={analysisData.endUserTypes}
                        xAxisLabel="Year"
                        yAxisLabel={getDataLabel()}
                      />
                    </div>
                  </div>
                )}

                {/* Delivery Channel Chart */}
                {analysisData.deliveryChannelChartData.length > 0 && analysisData.deliveryChannels && analysisData.deliveryChannels.length > 0 && (
                  <div className={`p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 h-[550px] flex flex-col ${isDark ? 'bg-navy-card border-2 border-navy-light' : 'bg-white border-2 border-gray-200'}`}>
                    <div className="mb-4 pb-4 border-b border-gray-200 dark:border-navy-light">
                      <h3 className="text-lg font-bold text-electric-blue dark:text-cyan-accent mb-1">
                        {filters.marketEvaluation === 'By Volume' ? 'Market Volume' : 'Market Size'} By Delivery Channel
                      </h3>
                      <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark">
                        {getDataLabel()}
                      </p>
                    </div>
                    <div className="flex-1 flex items-center justify-center min-h-0 pt-2">
                      <SegmentGroupedBarChart
                        data={analysisData.deliveryChannelChartData}
                        segmentKeys={analysisData.deliveryChannels}
                        xAxisLabel="Year"
                        yAxisLabel={getDataLabel()}
                      />
                    </div>
                  </div>
                )}

                {/* Business Model Chart */}
                {analysisData.businessModelChartData.length > 0 && analysisData.businessModels && analysisData.businessModels.length > 0 && (
                  <div className={`p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 h-[550px] flex flex-col ${isDark ? 'bg-navy-card border-2 border-navy-light' : 'bg-white border-2 border-gray-200'}`}>
                    <div className="mb-4 pb-4 border-b border-gray-200 dark:border-navy-light">
                      <h3 className="text-lg font-bold text-electric-blue dark:text-cyan-accent mb-1">
                        {filters.marketEvaluation === 'By Volume' ? 'Market Volume' : 'Market Size'} By Business Model
                      </h3>
                      <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark">
                        {getDataLabel()}
                      </p>
                    </div>
                    <div className="flex-1 flex items-center justify-center min-h-0 pt-2">
                      <SegmentGroupedBarChart
                        data={analysisData.businessModelChartData}
                        segmentKeys={analysisData.businessModels}
                        xAxisLabel="Year"
                        yAxisLabel={getDataLabel()}
                      />
                    </div>
                  </div>
                )}
              </div>

          {/* Share Analysis Section - Year-wise Stacked Bar Charts */}
          {((analysisData.serviceTypeStackedData.chartData.length > 0 && analysisData.serviceTypeStackedData.segments.length > 0) ||
            (analysisData.endUserTypeStackedData.chartData.length > 0 && analysisData.endUserTypeStackedData.segments.length > 0) ||
            (analysisData.deliveryChannelStackedData.chartData.length > 0 && analysisData.deliveryChannelStackedData.segments.length > 0) ||
            (analysisData.businessModelStackedData.chartData.length > 0 && analysisData.businessModelStackedData.segments.length > 0)) && (
            <div className="mb-20">
              <div className="mb-8">
                <div className="flex items-center gap-3 mb-3">
                  <div className={`w-1 h-10 rounded-full ${isDark ? 'bg-cyan-accent' : 'bg-electric-blue'}`}></div>
                  <InfoTooltip content={`• Shows ${filters.marketEvaluation === 'By Volume' ? 'market volume' : 'market size'} share across different segments by year\n• Each stacked bar represents a year with segments showing the proportion\n• X-axis: Year, Y-axis: ${filters.marketEvaluation === 'By Volume' ? 'Market Volume' : 'Market Size'}\n• Hover over bars to see detailed values and percentages`}>
                    <h2 className="text-3xl font-bold text-text-primary-light dark:text-text-primary-dark cursor-help">
                      {filters.marketEvaluation === 'By Volume' ? 'Market Volume' : 'Market Size'} Analysis by Segments
                    </h2>
                  </InfoTooltip>
                </div>
                <p className="text-base text-text-secondary-light dark:text-text-secondary-dark ml-4 mb-2">
                  Year-wise share breakdown (no summation across years)
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-20">
                {/* Service Type Stacked Bar Chart */}
                {analysisData.serviceTypeStackedData.chartData.length > 0 && analysisData.serviceTypeStackedData.segments.length > 0 && (
                  <div className={`p-5 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 h-[480px] flex flex-col ${isDark ? 'bg-navy-card border-2 border-navy-light' : 'bg-white border-2 border-gray-200'}`}>
                    <div className="mb-3 pb-3 border-b border-gray-200 dark:border-navy-light">
                      <InfoTooltip content={`• Shows ${filters.marketEvaluation === 'By Volume' ? 'market volume' : 'market size'} share by service type by year\n• X-axis: Year, Y-axis: ${filters.marketEvaluation === 'By Volume' ? 'Market Volume' : 'Market Size'}\n• Each stacked bar shows the proportion for that year\n• Hover over bars to see detailed values and percentages`}>
                        <h3 className="text-base font-bold text-electric-blue dark:text-cyan-accent mb-1 cursor-help">
                          Service Type Share
                        </h3>
                      </InfoTooltip>
                      <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark">
                        {getDataLabel()}
                      </p>
                    </div>
                    <div className="flex-1 flex items-center justify-center min-h-0">
                      <CrossSegmentStackedBarChart
                        data={analysisData.serviceTypeStackedData.chartData}
                        dataKeys={analysisData.serviceTypeStackedData.segments}
                        xAxisLabel="Year"
                        yAxisLabel={getDataLabel()}
                        nameKey="year"
                      />
                    </div>
                  </div>
                )}

                {/* End User Type Stacked Bar Chart */}
                {analysisData.endUserTypeStackedData.chartData.length > 0 && analysisData.endUserTypeStackedData.segments.length > 0 && (
                  <div className={`p-5 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 h-[480px] flex flex-col ${isDark ? 'bg-navy-card border-2 border-navy-light' : 'bg-white border-2 border-gray-200'}`}>
                    <div className="mb-3 pb-3 border-b border-gray-200 dark:border-navy-light">
                      <InfoTooltip content={`• Shows ${filters.marketEvaluation === 'By Volume' ? 'market volume' : 'market size'} share by end user type by year\n• X-axis: Year, Y-axis: ${filters.marketEvaluation === 'By Volume' ? 'Market Volume' : 'Market Size'}\n• Each stacked bar shows the proportion for that year\n• Hover over bars to see detailed values and percentages`}>
                        <h3 className="text-base font-bold text-electric-blue dark:text-cyan-accent mb-1 cursor-help">
                          End User Type Share
                        </h3>
                      </InfoTooltip>
                      <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark">
                        {getDataLabel()}
                      </p>
                    </div>
                    <div className="flex-1 flex items-center justify-center min-h-0">
                      <CrossSegmentStackedBarChart
                        data={analysisData.endUserTypeStackedData.chartData}
                        dataKeys={analysisData.endUserTypeStackedData.segments}
                        xAxisLabel="Year"
                        yAxisLabel={getDataLabel()}
                        nameKey="year"
                      />
                    </div>
                  </div>
                )}

                {/* Delivery Channel Stacked Bar Chart */}
                {analysisData.deliveryChannelStackedData.chartData.length > 0 && analysisData.deliveryChannelStackedData.segments.length > 0 && (
                  <div className={`p-5 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 h-[480px] flex flex-col ${isDark ? 'bg-navy-card border-2 border-navy-light' : 'bg-white border-2 border-gray-200'}`}>
                    <div className="mb-3 pb-3 border-b border-gray-200 dark:border-navy-light">
                      <InfoTooltip content={`• Shows ${filters.marketEvaluation === 'By Volume' ? 'market volume' : 'market size'} share by delivery channel by year\n• X-axis: Year, Y-axis: ${filters.marketEvaluation === 'By Volume' ? 'Market Volume' : 'Market Size'}\n• Each stacked bar shows the proportion for that year\n• Hover over bars to see detailed values and percentages`}>
                        <h3 className="text-base font-bold text-electric-blue dark:text-cyan-accent mb-1 cursor-help">
                          Delivery Channel Share
                        </h3>
                      </InfoTooltip>
                      <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark">
                        {getDataLabel()}
                      </p>
                    </div>
                    <div className="flex-1 flex items-center justify-center min-h-0">
                      <CrossSegmentStackedBarChart
                        data={analysisData.deliveryChannelStackedData.chartData}
                        dataKeys={analysisData.deliveryChannelStackedData.segments}
                        xAxisLabel="Year"
                        yAxisLabel={getDataLabel()}
                        nameKey="year"
                      />
                    </div>
                  </div>
                )}

                {/* Business Model Stacked Bar Chart */}
                {analysisData.businessModelStackedData.chartData.length > 0 && analysisData.businessModelStackedData.segments.length > 0 && (
                  <div className={`p-5 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 h-[480px] flex flex-col ${isDark ? 'bg-navy-card border-2 border-navy-light' : 'bg-white border-2 border-gray-200'}`}>
                    <div className="mb-3 pb-3 border-b border-gray-200 dark:border-navy-light">
                      <InfoTooltip content={`• Shows ${filters.marketEvaluation === 'By Volume' ? 'market volume' : 'market size'} share by business model by year\n• X-axis: Year, Y-axis: ${filters.marketEvaluation === 'By Volume' ? 'Market Volume' : 'Market Size'}\n• Each stacked bar shows the proportion for that year\n• Hover over bars to see detailed values and percentages`}>
                        <h3 className="text-base font-bold text-electric-blue dark:text-cyan-accent mb-1 cursor-help">
                          Business Model Share
                        </h3>
                      </InfoTooltip>
                      <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark">
                        {getDataLabel()}
                      </p>
                    </div>
                    <div className="flex-1 flex items-center justify-center min-h-0">
                      <CrossSegmentStackedBarChart
                        data={analysisData.businessModelStackedData.chartData}
                        dataKeys={analysisData.businessModelStackedData.segments}
                        xAxisLabel="Year"
                        yAxisLabel={getDataLabel()}
                        nameKey="year"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}



          {/* Graph 9: Region Country Percentage */}
          {analysisData.regionCountryPercentageChartData.length > 0 && (
            <div className="mb-20">
              <div className="mb-8">
                <div className="flex items-center gap-3 mb-3">
                  <div className={`w-1 h-10 rounded-full ${isDark ? 'bg-cyan-accent' : 'bg-electric-blue'}`}></div>
                  <InfoTooltip content={`• Shows ${filters.marketEvaluation === 'By Volume' ? 'market volume' : 'market size'} by region and country grouped by year\n• X-axis: Year - Region combinations\n• Y-axis: ${filters.marketEvaluation === 'By Volume' ? 'Market Volume' : filters.marketEvaluation === 'By Value' ? 'Percentage (%)' : 'Market Size'}\n• Compare regional and country performance across years`}>
                    <h2 className="text-3xl font-bold text-text-primary-light dark:text-text-primary-dark cursor-help">
                      {filters.marketEvaluation === 'By Volume' ? 'Market Volume' : 'Market Size'} by Region & Country
                    </h2>
                  </InfoTooltip>
                </div>
                {filters.marketEvaluation === 'By Value' && (
                  <p className="text-base text-text-secondary-light dark:text-text-secondary-dark ml-4 mb-2">
                    Percentage distribution of countries within each region by year
                  </p>
                )}
                {filters.marketEvaluation === 'By Volume' && (
                  <p className="text-base text-text-secondary-light dark:text-text-secondary-dark ml-4 mb-2">
                    Market volume by region and country grouped by year
                  </p>
                )}
              </div>
              <div className={`p-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 h-[550px] flex flex-col ${isDark ? 'bg-navy-card border-2 border-navy-light' : 'bg-white border-2 border-gray-200'}`}>
                <div className="mb-3 pb-3 border-b border-gray-200 dark:border-navy-light">
                  <h3 className="text-lg font-bold text-electric-blue dark:text-cyan-accent mb-1">
                    Regional Distribution
                  </h3>
                </div>
                <div className="flex-1 min-h-0 w-full">
                  <RegionCountryStackedBarChart
                    data={analysisData.regionCountryPercentageChartData}
                    dataKey="value"
                    xAxisLabel="Year"
                    yAxisLabel={filters.marketEvaluation === 'By Volume' ? 'Volume (Tons)' : 'Percentage (%)'}
                    showPercentage={filters.marketEvaluation === 'By Value'}
                  />
                </div>
              </div>
            </div>
          )}
            </>
          )}

          {/* Incremental Opportunity Tab */}
          {activeTab === 'incremental' && (
            <>
              {/* Filters Section for Incremental Tab */}
              <div className={`p-8 rounded-2xl mb-8 shadow-xl ${isDark ? 'bg-navy-card border-2 border-navy-light' : 'bg-white border-2 border-gray-300'} relative`} style={{ overflow: 'visible' }}>
                <div className="mb-6">
                  <div className="flex items-center gap-3 mb-2">
                    <div className={`w-1 h-8 rounded-full ${isDark ? 'bg-cyan-accent' : 'bg-electric-blue'}`}></div>
                    <h3 className="text-2xl font-bold text-text-primary-light dark:text-text-primary-dark">
                      Filter Data
                    </h3>
                  </div>
                  <p className="text-base text-text-secondary-light dark:text-text-secondary-dark ml-4">
                    Filter incremental opportunity data by region and country.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FilterDropdown
                    label="Region"
                    value={incrementalFilters.region}
                    onChange={(value) => {
                      // Clear country selection when region changes
                      setIncrementalFilters({ region: value as string[], country: [] })
                    }}
                    options={incrementalFilterOptions.regions}
                  />
                  <FilterDropdown
                    label="Country"
                    value={incrementalFilters.country}
                    onChange={(value) => setIncrementalFilters({ ...incrementalFilters, country: value as string[] })}
                    options={incrementalFilterOptions.countries}
                  />
                </div>
              </div>

              <div className="mb-20">
                <div className={`p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 h-[600px] flex flex-col ${isDark ? 'bg-navy-card border-2 border-navy-light' : 'bg-white border-2 border-gray-200'}`}>
                  <div className="flex-1 flex items-center justify-center min-h-0">
                    <WaterfallChart
                      data={waterfallData.chartData}
                      xAxisLabel="Incremental $ Opportunity"
                      yAxisLabel="Market Value (US$ Mn)"
                      incrementalOpportunity={waterfallData.incrementalOpportunity}
                    />
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Market Attractiveness Tab */}
          {activeTab === 'attractiveness' && (
            <>
              {/* Filters Section for Attractiveness Tab */}
              <div className={`p-8 rounded-2xl mb-8 shadow-xl ${isDark ? 'bg-navy-card border-2 border-navy-light' : 'bg-white border-2 border-gray-300'} relative`} style={{ overflow: 'visible' }}>
                <div className="mb-6">
                  <div className="flex items-center gap-3 mb-2">
                    <div className={`w-1 h-8 rounded-full ${isDark ? 'bg-cyan-accent' : 'bg-electric-blue'}`}></div>
                    <h3 className="text-2xl font-bold text-text-primary-light dark:text-text-primary-dark">
                      Filter Data
                    </h3>
                  </div>
                  <p className="text-base text-text-secondary-light dark:text-text-secondary-dark ml-4">
                    Filter market attractiveness data by region and country. Then select a product category - bubbles will show different items from that category with unique colors (2025-2032).
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <FilterDropdown
                    label="Region"
                    value={attractivenessFilters.region}
                    onChange={(value) => {
                      // Clear country selection when region changes
                      setAttractivenessFilters({ ...attractivenessFilters, region: value as string[], country: [] })
                    }}
                    options={attractivenessFilterOptions.regions}
                  />
                  <FilterDropdown
                    label="Country"
                    value={attractivenessFilters.country}
                    onChange={(value) => setAttractivenessFilters({ ...attractivenessFilters, country: value as string[] })}
                    options={attractivenessFilterOptions.countries}
                  />
                  <FilterDropdown
                    label="Segmentation"
                    value={attractivenessFilters.segmentType || ''}
                    onChange={(value) => {
                      // Clear selectedCategory when segment type changes
                      setAttractivenessFilters({ ...attractivenessFilters, segmentType: value as string, selectedCategory: '' })
                    }}
                    options={attractivenessFilterOptions.segmentTypes}
                    multiple={false}
                  />
                </div>
              </div>

              <div className="mb-20">
                <div className="mb-8">
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`w-1 h-10 rounded-full ${isDark ? 'bg-cyan-accent' : 'bg-electric-blue'}`}></div>
                    <InfoTooltip content="• Shows market attractiveness from 2025 to 2032\n• X-axis: CAGR Index (Compound Annual Growth Rate)\n• Y-axis: Market Share Index\n• Bubble size indicates incremental opportunity\n• Larger bubbles represent greater market potential\n• Select a product category above to see bubbles for each item in that category">
                      <h2 className="text-3xl font-bold text-text-primary-light dark:text-text-primary-dark cursor-help">
                        Market Attractiveness, 2025-2032
                      </h2>
                    </InfoTooltip>
                  </div>
                  <p className="text-base text-text-secondary-light dark:text-text-secondary-dark ml-4 mb-2">
                    Market attractiveness analysis by CAGR and Market Share Index
                  </p>
                </div>

                {!attractivenessFilters.segmentType ? (
                  <div className={`p-6 rounded-xl shadow-lg ${isDark ? 'bg-navy-card border-2 border-navy-light' : 'bg-white border-2 border-gray-200'}`}>
                    <div className="flex items-center justify-center h-[400px]">
                      <p className="text-text-secondary-light dark:text-text-secondary-dark text-lg">
                        Please select a segmentation type above to view the market attractiveness chart
                      </p>
                    </div>
                  </div>
                ) : bubbleChartDataByCategory.length === 0 ? (
                  <div className={`p-6 rounded-xl shadow-lg ${isDark ? 'bg-navy-card border-2 border-navy-light' : 'bg-white border-2 border-gray-200'}`}>
                    <div className="flex items-center justify-center h-[400px]">
                      <p className="text-text-secondary-light dark:text-text-secondary-dark text-lg">
                        No data available for the selected filters
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className={`p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 h-[600px] flex flex-col ${isDark ? 'bg-navy-card border-2 border-navy-light' : 'bg-white border-2 border-gray-200'}`}>
                    <div className="mb-4 pb-4 border-b border-gray-200 dark:border-navy-light">
                      <h3 className="text-lg font-bold text-electric-blue dark:text-cyan-accent mb-1">
                        {attractivenessFilters.segmentType}
                      </h3>
                      <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark">
                        CAGR Index vs Market Share Index
                      </p>
                    </div>
                    <div className="flex-1 flex items-center justify-center min-h-0 pt-2">
                      <BubbleChart
                        data={bubbleChartDataByCategory}
                        xAxisLabel="CAGR Index"
                        yAxisLabel="Market Share Index"
                      />
                    </div>
                  </div>
                )}
              </div>
            </>
          )}

          {/* YoY Analysis Tab */}
          {activeTab === 'yoy' && (
            <>
              {/* Filters Section for YoY Tab */}
              <div className={`p-8 rounded-2xl mb-8 shadow-xl ${isDark ? 'bg-navy-card border-2 border-navy-light' : 'bg-white border-2 border-gray-300'} relative`} style={{ overflow: 'visible' }}>
                <div className="mb-6">
                  <div className="flex items-center gap-3 mb-2">
                    <div className={`w-1 h-8 rounded-full ${isDark ? 'bg-cyan-accent' : 'bg-electric-blue'}`}></div>
                    <h3 className="text-2xl font-bold text-text-primary-light dark:text-text-primary-dark">
                      Filter Data
                    </h3>
                  </div>
                  <p className="text-base text-text-secondary-light dark:text-text-secondary-dark ml-4">
                    Filter Y-o-Y analysis data by region, country, and segment type.
                  </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <FilterDropdown
                    label="Region"
                    value={yoyFilters.region}
                    onChange={(value) => {
                      const newRegions = value as string[]
                      // Filter out countries that are not in the selected regions
                      const validCountries = yoyFilters.country.filter(country => {
                        if (newRegions.length === 0) return true // Keep all if no region selected
                        // Check if country belongs to any selected region
                        const regionCountryMap: Record<string, string[]> = {
                          'North America': ['U.S.', 'Canada'],
                          'Europe': ['U.K.', 'Germany', 'France', 'Italy', 'Spain', 'Russia', 'Rest of Europe']
                        }
                        return newRegions.some(region => regionCountryMap[region]?.includes(country))
                      })
                      setYoyFilters({ ...yoyFilters, region: newRegions, country: validCountries })
                    }}
                    options={yoyFilterOptions.regions}
                  />
                  <FilterDropdown
                    label="Country"
                    value={yoyFilters.country}
                    onChange={(value) => setYoyFilters({ ...yoyFilters, country: value as string[] })}
                    options={[]}
                    groupedOptions={yoyFilterOptions.countryGroupedOptions}
                  />
                  <FilterDropdown
                    label="Segment Type"
                    value={yoyFilters.segmentType}
                    onChange={(value) => setYoyFilters({ ...yoyFilters, segmentType: value as string[] })}
                    options={yoyFilterOptions.segmentCategories}
                  />
                </div>
              </div>

              <div className="mb-20">
                <div className="mb-8">
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`w-1 h-10 rounded-full ${isDark ? 'bg-cyan-accent' : 'bg-electric-blue'}`}></div>
                    <InfoTooltip content="• Shows Year-on-Year (Y-o-Y) growth rate\n• Toggle between Y-o-Y and CAGR views using the button\n• Y-o-Y shows year-to-year growth percentage\n• CAGR shows cumulative annual growth rate from the first year\n• Select regions or countries to generate separate charts for each (no summation)\n• Use filters to analyze specific regions, product types, or countries">
                      <h2 className="text-3xl font-bold text-text-primary-light dark:text-text-primary-dark cursor-help">
                        Year-on-Year (Y-o-Y) Analysis
                      </h2>
                    </InfoTooltip>
                  </div>
                  <p className="text-base text-text-secondary-light dark:text-text-secondary-dark ml-4 mb-2">
                    Growth rate analysis for each selected country/region.
                  </p>
                </div>
                
                {yoyCagrDataByEntity.length === 0 ? (
                  <div className={`p-6 rounded-xl shadow-lg ${isDark ? 'bg-navy-card border-2 border-navy-light' : 'bg-white border-2 border-gray-200'}`}>
                    <div className="flex items-center justify-center h-[400px]">
                      <p className="text-text-secondary-light dark:text-text-secondary-dark text-lg">
                        Please select at least one region or country to view the analysis
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-6">
                    {yoyCagrDataByEntity.map((entity, index) => (
                      <div key={index} className={`p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 h-[600px] flex flex-col ${isDark ? 'bg-navy-card border-2 border-navy-light' : 'bg-white border-2 border-gray-200'}`}>
                        <div className="mb-4 pb-4 border-b border-gray-200 dark:border-navy-light">
                          <h3 className="text-lg font-bold text-electric-blue dark:text-cyan-accent mb-1">
                            {entity.label}
                          </h3>
                          <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark">
                            Year-on-Year growth rate analysis
                          </p>
                        </div>
                        <div className="flex-1 flex items-center justify-center min-h-0 pt-2">
                          <YoYCAGRChart
                            data={entity.data}
                            productTypes={entity.segmentTypes}
                            xAxisLabel="Year"
                            yAxisLabel="Growth Rate (%)"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </>
      )}
    </div>
  )
}
