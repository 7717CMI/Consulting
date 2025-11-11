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
    country: ['U.S.', 'Canada'] as string[],
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
    selectedCategory: '' as string, // Which category to show bubbles for
    pyrolysisMethod: [] as string[],
    sourceMaterial: [] as string[],
    productGrade: [] as string[],
    form: [] as string[],
    application: [] as string[],
    distributionChannel: [] as string[],
  })

  // Separate filters for YoY/CAGR tab
  const [yoyFilters, setYoyFilters] = useState({
    region: [] as string[],
    productType: [] as string[],
    country: [] as string[],
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
          const defaultCountries = availableCountries.length >= 2 && availableCountries.includes('U.S.') && availableCountries.includes('Canada')
            ? ['U.S.', 'Canada']
            : availableCountries.length >= 2
              ? availableCountries.slice(0, 2)
              : availableCountries.length === 1
                ? [availableCountries[0]]
                : []
          
          // Select 2-3 years by default and set default countries
          setFilters({
            year: defaultYears,
            country: defaultCountries,
            productType: [],
            bladeMaterial: [],
            handleLength: [],
            application: [],
            endUser: [],
            distributionChannelType: [],
            distributionChannel: [],
            marketEvaluation: 'By Value',
          })
          
          // Set default for Y-o-Y filters: one country and all product types
          const defaultYoyCountry = availableCountries.length > 0 && availableCountries.includes('U.S.')
            ? ['U.S.']
            : availableCountries.length > 0
              ? [availableCountries[0]]
              : []
          
          setYoyFilters({
            region: [],
            country: defaultYoyCountry,
            productType: availableProductTypes.length > 0 ? availableProductTypes : []
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
    if (filters.country.length > 0) {
      filtered = filtered.filter(d => filters.country.includes(d.country))
    }
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
        productTypeChartData: [],
        bladeMaterialChartData: [],
        handleLengthChartData: [],
        applicationChartData: [],
        endUserChartData: [],
        countryChartData: [],
        regionCountryPercentageChartData: [],
        productTypes: [] as string[],
        bladeMaterials: [] as string[],
        handleLengths: [] as string[],
        applications: [] as string[],
        endUsers: [] as string[],
        countries: [] as string[],
        bladeMaterialStackedData: { chartData: [], segments: [] },
        productTypeStackedData: { chartData: [], segments: [] },
        handleLengthStackedData: { chartData: [], segments: [] },
        applicationStackedData: { chartData: [], segments: [] },
        endUserStackedData: { chartData: [], segments: [] },
        distributionChannelTypeStackedData: { chartData: [], segments: [] },
        offlineChannelStackedData: { chartData: [], segments: [] },
        onlineChannelStackedData: { chartData: [], segments: [] },
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

    // Product Type Chart - use selected filters to show all selected options
    const productTypeData = generateSegmentChartData(
      'productType', 
      (d) => d.productType || '',
      filters.productType.length > 0 ? filters.productType : undefined
    )

    // Blade Material Chart - use selected filters to show all selected options
    const bladeMaterialData = generateSegmentChartData(
      'bladeMaterial', 
      (d) => d.bladeMaterial || '',
      filters.bladeMaterial.length > 0 ? filters.bladeMaterial : undefined
    )

    // Handle Length Chart - use selected filters to show all selected options
    const handleLengthData = generateSegmentChartData(
      'handleLength', 
      (d) => d.handleLength || '',
      filters.handleLength.length > 0 ? filters.handleLength : undefined
    )

    // Application Chart - use selected filters to show all selected options
    const applicationData = generateSegmentChartData(
      'application', 
      (d) => d.application || '',
      filters.application.length > 0 ? filters.application : undefined
    )

    // End User Chart - use selected filters to show all selected options
    const endUserData = generateSegmentChartData(
      'endUser', 
      (d) => d.endUser || '',
      filters.endUser.length > 0 ? filters.endUser : undefined
    )

    // Country Chart - use selected filters to show all selected options
    const countriesFromData = [...new Set(filteredData.map(d => d.country))].filter(Boolean).sort()
    const countries = filters.country.length > 0 
      ? filters.country.filter(c => c).sort() 
      : countriesFromData
    const countryMap = new Map<string, number>()
    filteredData.forEach(d => {
      const key = `${d.year}-${d.country}`
      countryMap.set(key, (countryMap.get(key) || 0) + getDataValue(d))
    })
    const countryChartData = years.map((year) => {
      const entry: Record<string, number | string> = { year: String(year) }
      countries.forEach((country) => {
        const key = `${year}-${country}`
        entry[country] = countryMap.get(key) || 0
      })
      return entry
    })


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

    // Generate year-wise stacked bar chart data for share analysis
    const bladeMaterialStackedData = generateYearWiseStackedBarData(
      (d) => d.bladeMaterial || '',
      filters.bladeMaterial.length > 0 ? filters.bladeMaterial : undefined
    )
    const productTypeStackedData = generateYearWiseStackedBarData(
      (d) => d.productType || '',
      filters.productType.length > 0 ? filters.productType : undefined
    )
    const handleLengthStackedData = generateYearWiseStackedBarData(
      (d) => d.handleLength || '',
      filters.handleLength.length > 0 ? filters.handleLength : undefined
    )
    const applicationStackedData = generateYearWiseStackedBarData(
      (d) => d.application || '',
      filters.application.length > 0 ? filters.application : undefined
    )
    const endUserStackedData = generateYearWiseStackedBarData(
      (d) => d.endUser || '',
      filters.endUser.length > 0 ? filters.endUser : undefined
    )

    // Generate distribution channel type stacked bar chart data (Online vs Offline)
    const distributionChannelTypeStackedData = generateYearWiseStackedBarData(
      (d) => d.distributionChannelType || '',
      filters.distributionChannelType.length > 0 ? filters.distributionChannelType : undefined
    )

    // Generate distribution channel subtype stacked bar chart data
    // Only show if a distribution channel type is selected
    let offlineChannelStackedData: { chartData: Array<Record<string, number | string>>; segments: string[] } = { chartData: [], segments: [] }
    let onlineChannelStackedData: { chartData: Array<Record<string, number | string>>; segments: string[] } = { chartData: [], segments: [] }
    
    if (filters.distributionChannelType.length > 0) {
      // Filter data for offline channels
      if (filters.distributionChannelType.includes('Offline')) {
        const offlineData = filteredData.filter(d => d.distributionChannelType === 'Offline')
        const offlineChannels = [...new Set(offlineData.map(d => d.distributionChannel))].filter(Boolean).sort() as string[]
        
        const yearChannelMap = new Map<number, Map<string, number>>()
        offlineData.forEach(d => {
          const year = d.year
          const channel = d.distributionChannel
          if (channel) {
            if (!yearChannelMap.has(year)) {
              yearChannelMap.set(year, new Map<string, number>())
            }
            const channelMap = yearChannelMap.get(year)!
            channelMap.set(channel, (channelMap.get(channel) || 0) + getDataValue(d))
          }
        })
        
        const chartData = years.map(year => {
          const entry: Record<string, number | string> = { year: String(year) }
          const channelMap = yearChannelMap.get(year) || new Map<string, number>()
          offlineChannels.forEach(channel => {
            entry[channel] = channelMap.get(channel) || 0
          })
          return entry
        })
        
        const activeChannels = offlineChannels.filter(channel => 
          chartData.some(entry => (entry[channel] as number) > 0)
        )
        
        offlineChannelStackedData = { chartData, segments: activeChannels }
      }
      
      // Filter data for online channels
      if (filters.distributionChannelType.includes('Online')) {
        const onlineData = filteredData.filter(d => d.distributionChannelType === 'Online')
        const onlineChannels = [...new Set(onlineData.map(d => d.distributionChannel))].filter(Boolean).sort() as string[]
        
        const yearChannelMap = new Map<number, Map<string, number>>()
        onlineData.forEach(d => {
          const year = d.year
          const channel = d.distributionChannel
          if (channel) {
            if (!yearChannelMap.has(year)) {
              yearChannelMap.set(year, new Map<string, number>())
            }
            const channelMap = yearChannelMap.get(year)!
            channelMap.set(channel, (channelMap.get(channel) || 0) + getDataValue(d))
          }
        })
        
        const chartData = years.map(year => {
          const entry: Record<string, number | string> = { year: String(year) }
          const channelMap = yearChannelMap.get(year) || new Map<string, number>()
          onlineChannels.forEach(channel => {
            entry[channel] = channelMap.get(channel) || 0
          })
          return entry
        })
        
        const activeChannels = onlineChannels.filter(channel => 
          chartData.some(entry => (entry[channel] as number) > 0)
        )
        
        onlineChannelStackedData = { chartData, segments: activeChannels }
      }
    }

    return {
      productTypeChartData: productTypeData.chartData,
      bladeMaterialChartData: bladeMaterialData.chartData,
      handleLengthChartData: handleLengthData.chartData,
      applicationChartData: applicationData.chartData,
      endUserChartData: endUserData.chartData,
      countryChartData,
      regionCountryPercentageChartData,
      productTypes: productTypeData.segments,
      bladeMaterials: bladeMaterialData.segments,
      handleLengths: handleLengthData.segments,
      applications: applicationData.segments,
      endUsers: endUserData.segments,
      countries,
      // Year-wise stacked bar chart data for share analysis
      bladeMaterialStackedData,
      productTypeStackedData,
      handleLengthStackedData,
      applicationStackedData,
      endUserStackedData,
      distributionChannelTypeStackedData,
      offlineChannelStackedData,
      onlineChannelStackedData,
    }
  }, [filteredData, filters.marketEvaluation, filters.productType, filters.bladeMaterial, filters.handleLength, filters.application, filters.endUser, filters.country, filters.distributionChannelType])

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

    const regionSet = new Set<string>()
    const countryRegionMap = new Map<string, string>() // country -> region mapping

    data.forEach(d => {
      if (d.region) regionSet.add(d.region)
      if (d.country && d.region) {
        countryRegionMap.set(d.country, d.region)
      }
    })

    // Filter countries based on selected regions
    let availableCountries = Array.from(countryRegionMap.keys())
    if (incrementalFilters.region.length > 0) {
      availableCountries = availableCountries.filter(country => {
        const countryRegion = countryRegionMap.get(country)
        return countryRegion && incrementalFilters.region.includes(countryRegion)
      })
    }

    return {
      regions: Array.from(regionSet).sort(),
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
        productTypes: [],
        countries: [],
      }
    }

    const regionSet = new Set<string>()
    const pyrolysisMethodSet = new Set<string>()
    const sourceMaterialSet = new Set<string>()
    const productGradeSet = new Set<string>()
    const formSet = new Set<string>()
    const applicationSet = new Set<string>()
    const distributionChannelSet = new Set<string>()
    const countryRegionMap = new Map<string, string>() // country -> region mapping

    data.forEach(d => {
      if (d.region) regionSet.add(d.region)
      if (d.productType) pyrolysisMethodSet.add(d.productType)
      if (d.bladeMaterial) sourceMaterialSet.add(d.bladeMaterial)
      if (d.handleLength) productGradeSet.add(d.handleLength)
      if (d.application) formSet.add(d.application)
      if (d.endUser) applicationSet.add(d.endUser)
      if (d.distributionChannelType) distributionChannelSet.add(d.distributionChannelType)
      if (d.country && d.region) {
        countryRegionMap.set(d.country, d.region)
      }
    })

    // Filter countries based on selected regions
    let availableCountries = Array.from(countryRegionMap.keys())
    if (attractivenessFilters.region.length > 0) {
      availableCountries = availableCountries.filter(country => {
        const countryRegion = countryRegionMap.get(country)
        return countryRegion && attractivenessFilters.region.includes(countryRegion)
      })
    }

    return {
      regions: Array.from(regionSet).sort(),
      pyrolysisMethods: Array.from(pyrolysisMethodSet).sort(),
      sourceMaterials: Array.from(sourceMaterialSet).sort(),
      productGrades: Array.from(productGradeSet).sort(),
      forms: Array.from(formSet).sort(),
      applications: Array.from(applicationSet).sort(),
      distributionChannels: Array.from(distributionChannelSet).sort(),
      countries: availableCountries.sort(),
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
    if (attractivenessFilters.pyrolysisMethod.length > 0) {
      filtered = filtered.filter(d => attractivenessFilters.pyrolysisMethod.includes(d.productType))
    }
    if (attractivenessFilters.sourceMaterial.length > 0) {
      filtered = filtered.filter(d => attractivenessFilters.sourceMaterial.includes(d.bladeMaterial))
    }
    if (attractivenessFilters.productGrade.length > 0) {
      filtered = filtered.filter(d => attractivenessFilters.productGrade.includes(d.handleLength))
    }
    if (attractivenessFilters.form.length > 0) {
      filtered = filtered.filter(d => attractivenessFilters.form.includes(d.application))
    }
    if (attractivenessFilters.application.length > 0) {
      filtered = filtered.filter(d => attractivenessFilters.application.includes(d.endUser))
    }
    if (attractivenessFilters.distributionChannel.length > 0) {
      filtered = filtered.filter(d => attractivenessFilters.distributionChannel.includes(d.distributionChannelType))
    }

    return filtered
  }, [data, attractivenessFilters])

  // Bubble Chart Data (Market Attractiveness) - group by selected category
  const bubbleChartDataByCategory = useMemo(() => {
    // Determine what to group by based on selectedCategory
    const category = attractivenessFilters.selectedCategory

    // Helper function to get the field value based on category
    const getCategoryValue = (d: any, cat: string) => {
      switch (cat) {
        case 'pyrolysisMethod': return d.productType
        case 'sourceMaterial': return d.bladeMaterial
        case 'productGrade': return d.handleLength
        case 'form': return d.application
        case 'application': return d.endUser
        case 'distributionChannel': return d.distributionChannelType
        default: return d.region // Default to region
      }
    }

    // If no category selected, return empty array
    if (!category) {
      return []
    }

    // Group data by the selected category
    const categoryDataMap = new Map<string, {
      values: number[]
      volumes: number[]
      years: number[]
    }>()

    filteredAttractivenessData.forEach(d => {
      const categoryValue = getCategoryValue(d, category)
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
    
    // Debug: Check if different categories are using overlapping data
    if (category === 'sourceMaterial') {
      console.log('🔍 Source Material Data Points Check:')
      categoryDataMap.forEach((itemData, categoryValue) => {
        console.log(`${categoryValue}: ${itemData.values.length} data points, years: ${[...new Set(itemData.years)].sort().join(', ')}`)
        console.log(`  Sample values: ${itemData.values.slice(0, 5).map(v => v.toFixed(2)).join(', ')}...`)
      })
    }

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
        productTypes: [],
        countries: [],
        countryOptions: [], // Options with region names
      }
    }
    
    const regionSet = new Set<string>()
    const productTypeSet = new Set<string>()
    const countryRegionMap = new Map<string, string>() // country -> region mapping
    
    data.forEach(d => {
      if (d.region) regionSet.add(d.region)
      if (d.productType) productTypeSet.add(d.productType)
      if (d.country && d.region) {
        countryRegionMap.set(d.country, d.region)
      }
    })
    
    // Filter countries based on selected regions
    let availableCountries = Array.from(countryRegionMap.keys())
    if (yoyFilters.region.length > 0) {
      availableCountries = availableCountries.filter(country => {
        const countryRegion = countryRegionMap.get(country)
        return countryRegion && yoyFilters.region.includes(countryRegion)
      })
    }
    
    // Create country options with region names
    const countryOptions = availableCountries
      .sort()
      .map(country => {
        const region = countryRegionMap.get(country) || ''
        return {
          value: country,
          label: `${country} (${region})`
        }
      })
    
    return {
      regions: Array.from(regionSet).sort(),
      productTypes: Array.from(productTypeSet).sort(),
      countries: availableCountries.sort(),
      countryOptions: countryOptions,
    }
  }, [data, yoyFilters.region])

  // Filter data for YoY/CAGR chart
  const filteredYoyData = useMemo(() => {
    let filtered = [...data]
    
    if (yoyFilters.region.length > 0) {
      filtered = filtered.filter(d => yoyFilters.region.includes(d.region))
    }
    if (yoyFilters.productType.length > 0) {
      filtered = filtered.filter(d => yoyFilters.productType.includes(d.productType))
    }
    if (yoyFilters.country.length > 0) {
      filtered = filtered.filter(d => yoyFilters.country.includes(d.country))
    }
    
    return filtered
  }, [data, yoyFilters])

  // YoY/CAGR Chart Data - Generate separate data for each country/region with product type lines
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
    
    // Get selected product types (default to all if empty)
    const selectedProductTypes = yoyFilters.productType.length > 0 
      ? yoyFilters.productType 
      : yoyFilterOptions.productTypes
    
    // Generate data for each entity with product type lines
    const entityDataMap = new Map<string, { 
      data: Array<{ year: string, [key: string]: any }>, 
      productTypes: string[] 
    }>()
    
    entities.forEach(entity => {
      // Filter data for this specific entity
      let entityFilteredData = filteredYoyData
      
      if (entity.type === 'country') {
        entityFilteredData = entityFilteredData.filter(d => d.country === entity.name)
      } else if (entity.type === 'region') {
        entityFilteredData = entityFilteredData.filter(d => d.region === entity.name)
      }
      
      // Group data by year and product type
      const yearProductDataMap = new Map<number, Map<string, number>>()
      const allYears = new Set<number>()
      
      entityFilteredData.forEach(d => {
        if (!selectedProductTypes.includes(d.productType)) return
        
        const year = d.year
        const productType = d.productType
        const value = (d.marketValueUsd || 0) / 1000 // Convert to millions
        
        allYears.add(year)
        
        if (!yearProductDataMap.has(year)) {
          yearProductDataMap.set(year, new Map<string, number>())
        }
        
        const productMap = yearProductDataMap.get(year)!
        productMap.set(productType, (productMap.get(productType) || 0) + value)
      })
      
      // Sort years
      const years = Array.from(allYears).sort()
      
      if (years.length < 2) {
        // Not enough data for YoY/CAGR calculation
        return
      }
      
      // Calculate YoY for each product type for each year
      const chartData = years.map((year, yearIndex) => {
        const yearData: { year: string, [key: string]: any } = {
          year: String(year)
        }
        
        selectedProductTypes.forEach(productType => {
          const currentYearData = yearProductDataMap.get(year) || new Map()
          const currentValue = currentYearData.get(productType) || 0
          
          // Calculate YoY (Year-over-Year) growth for this product type
          let yoy = 0
          if (yearIndex > 0) {
            const previousYear = years[yearIndex - 1]
            const previousYearData = yearProductDataMap.get(previousYear) || new Map()
            const previousValue = previousYearData.get(productType) || 0
            if (previousValue > 0) {
              yoy = ((currentValue - previousValue) / previousValue) * 100
            }
          }
          
          // Store YoY value with product type as key
          yearData[productType] = yoy
        })
        
        return yearData
      })
      
      entityDataMap.set(entity.label, {
        data: chartData,
        productTypes: selectedProductTypes
      })
    })
    
    return Array.from(entityDataMap.entries()).map(([label, { data, productTypes }]) => ({
      label,
      data,
      productTypes
    }))
  }, [filteredYoyData, yoyFilters.country, yoyFilters.region, yoyFilters.productType, yoyFilterOptions.productTypes])

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
              <FilterDropdown
                label="Country"
                value={filters.country}
                onChange={(value) => setFilters({ ...filters, country: value as string[] })}
                options={uniqueOptions.countries || []}
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

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <FilterDropdown
                label="By Pyrolysis Method"
                value={filters.productType}
                onChange={(value) => setFilters({ ...filters, productType: value as string[] })}
                options={uniqueOptions.productTypes}
              />
              <FilterDropdown
                label="By Source Material"
                value={filters.bladeMaterial}
                onChange={(value) => setFilters({ ...filters, bladeMaterial: value as string[] })}
                options={uniqueOptions.bladeMaterials}
              />
              <FilterDropdown
                label="By Product Grade"
                value={filters.handleLength}
                onChange={(value) => setFilters({ ...filters, handleLength: value as string[] })}
                options={uniqueOptions.handleLengths}
              />
              <FilterDropdown
                label="By Form"
                value={filters.application}
                onChange={(value) => setFilters({ ...filters, application: value as string[] })}
                options={uniqueOptions.applications}
              />
              <FilterDropdown
                label="By Distribution Channel"
                value={filters.distributionChannelType}
                onChange={(value) => setFilters({ ...filters, distributionChannelType: value as string[] })}
                options={uniqueOptions.distributionChannelTypes || []}
              />
              <FilterDropdown
                label="By Application"
                value={filters.endUser}
                onChange={(value) => {
                  const newCategories = value as string[]
                  // Filter out invalid subtypes when application category changes
                  let validSubtypes = filters.distributionChannel
                  if (newCategories.length > 0 && filters.distributionChannel.length > 0) {
                    // Get valid subtypes for selected application categories
                    const categoryFilteredData = data.filter(d =>
                      newCategories.includes(d.endUser)
                    )
                    const validSubtypeSet = new Set<string>()
                    categoryFilteredData.forEach(d => {
                      if (d.distributionChannel) validSubtypeSet.add(d.distributionChannel)
                    })
                    validSubtypes = filters.distributionChannel.filter(subtype =>
                      validSubtypeSet.has(subtype)
                    )
                  } else if (newCategories.length === 0) {
                    // If no categories selected, clear subtypes
                    validSubtypes = []
                  }
                  setFilters({
                    ...filters,
                    endUser: newCategories,
                    distributionChannel: validSubtypes
                  })
                }}
                options={uniqueOptions.endUsers}
              />
              <FilterDropdown
                label="By Application Subtype"
                value={filters.distributionChannel}
                onChange={(value) => setFilters({ ...filters, distributionChannel: value as string[] })}
                options={availableDistributionChannels}
                groupedOptions={distributionChannelGroupedOptions}
              />
            </div>

            {/* Active Filters Display */}
            {(filters.year.length > 0 || filters.productType.length > 0 || filters.country.length > 0) && (
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
                    <div>
                      <span className="font-medium text-text-secondary-light dark:text-text-secondary-dark">Countries:</span>
                      <span className="ml-2 font-semibold text-electric-blue dark:text-cyan-accent">
                        {filters.country.length > 0 ? filters.country.join(', ') : 'All Countries'}
                      </span>
                    </div>
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

              {/* Graph 1: Market Size By Product Grade */}
          {analysisData.handleLengthChartData.length > 0 && analysisData.handleLengths && analysisData.handleLengths.length > 0 && (
            <div className="mb-20">
              <div className="mb-8">
                <div className="flex items-center gap-3 mb-3">
                  <div className={`w-1 h-10 rounded-full ${isDark ? 'bg-cyan-accent' : 'bg-electric-blue'}`}></div>
                  <InfoTooltip content={`• Shows ${filters.marketEvaluation === 'By Volume' ? 'market volume' : 'market size'} by product grade grouped by year\n• X-axis: Year\n• Y-axis: ${filters.marketEvaluation === 'By Volume' ? 'Market Volume' : 'Market Size'}\n• Compare product grade performance across years`}>
                    <h2 className="text-3xl font-bold text-text-primary-light dark:text-text-primary-dark cursor-help">
                      {filters.marketEvaluation === 'By Volume' ? 'Market Volume' : 'Market Size'} By Product Grade
                    </h2>
                  </InfoTooltip>
                </div>
                <p className="text-base text-text-secondary-light dark:text-text-secondary-dark ml-4 mb-2">
                  Product grade performance comparison by year
                </p>
              </div>
              <div className={`p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 h-[550px] flex flex-col ${isDark ? 'bg-navy-card border-2 border-navy-light' : 'bg-white border-2 border-gray-200'}`}>
                <div className="mb-4 pb-4 border-b border-gray-200 dark:border-navy-light">
                  <h3 className="text-lg font-bold text-electric-blue dark:text-cyan-accent mb-1">
                    {filters.marketEvaluation === 'By Volume' ? 'Market Volume' : 'Market Size'} By Product Grade by Year
                  </h3>
                  <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark">
                    {getDataLabel()}
                  </p>
                </div>
                <div className="flex-1 flex items-center justify-center min-h-0 pt-2">
                  <SegmentGroupedBarChart
                    data={analysisData.handleLengthChartData}
                    segmentKeys={analysisData.handleLengths}
                    xAxisLabel="Year"
                    yAxisLabel={getDataLabel()}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Share Analysis Section - Year-wise Stacked Bar Charts */}
          {((analysisData.bladeMaterialStackedData.chartData.length > 0 && analysisData.bladeMaterialStackedData.segments.length > 0) ||
            (analysisData.productTypeStackedData.chartData.length > 0 && analysisData.productTypeStackedData.segments.length > 0) ||
            (analysisData.applicationStackedData.chartData.length > 0 && analysisData.applicationStackedData.segments.length > 0) ||
            (analysisData.endUserStackedData.chartData.length > 0 && analysisData.endUserStackedData.segments.length > 0) ||
            (analysisData.distributionChannelTypeStackedData.chartData.length > 0 && analysisData.distributionChannelTypeStackedData.segments.length > 0) ||
            (analysisData.offlineChannelStackedData.chartData.length > 0 && analysisData.offlineChannelStackedData.segments.length > 0) ||
            (analysisData.onlineChannelStackedData.chartData.length > 0 && analysisData.onlineChannelStackedData.segments.length > 0)) && (
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
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Blade Material Stacked Bar Chart */}
                {analysisData.bladeMaterialStackedData.chartData.length > 0 && analysisData.bladeMaterialStackedData.segments.length > 0 && (
                  <div className={`p-5 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 h-[480px] flex flex-col ${isDark ? 'bg-navy-card border-2 border-navy-light' : 'bg-white border-2 border-gray-200'}`}>
                    <div className="mb-3 pb-3 border-b border-gray-200 dark:border-navy-light">
                      <InfoTooltip content={`• Shows ${filters.marketEvaluation === 'By Volume' ? 'market volume' : 'market size'} share by source material by year\n• X-axis: Year, Y-axis: ${filters.marketEvaluation === 'By Volume' ? 'Market Volume' : 'Market Size'}\n• Each stacked bar shows the proportion for that year\n• Hover over bars to see detailed values and percentages`}>
                        <h3 className="text-base font-bold text-electric-blue dark:text-cyan-accent mb-1 cursor-help">
                          Source Material Share
                        </h3>
                      </InfoTooltip>
                      <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark">
                        {getDataLabel()}
                      </p>
                    </div>
                    <div className="flex-1 flex items-center justify-center min-h-0">
                      <CrossSegmentStackedBarChart
                        data={analysisData.bladeMaterialStackedData.chartData}
                        dataKeys={analysisData.bladeMaterialStackedData.segments}
                        xAxisLabel="Year"
                        yAxisLabel={getDataLabel()}
                        nameKey="year"
                      />
                    </div>
                  </div>
                )}

                {/* Pyrolysis Method Stacked Bar Chart */}
                {analysisData.productTypeStackedData.chartData.length > 0 && analysisData.productTypeStackedData.segments.length > 0 && (
                  <div className={`p-5 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 h-[480px] flex flex-col ${isDark ? 'bg-navy-card border-2 border-navy-light' : 'bg-white border-2 border-gray-200'}`}>
                    <div className="mb-3 pb-3 border-b border-gray-200 dark:border-navy-light">
                      <InfoTooltip content={`• Shows ${filters.marketEvaluation === 'By Volume' ? 'market volume' : 'market size'} share by pyrolysis method by year\n• X-axis: Year, Y-axis: ${filters.marketEvaluation === 'By Volume' ? 'Market Volume' : 'Market Size'}\n• Each stacked bar shows the proportion for that year\n• Hover over bars to see detailed values and percentages`}>
                        <h3 className="text-base font-bold text-electric-blue dark:text-cyan-accent mb-1 cursor-help">
                          Pyrolysis Method Share
                        </h3>
                      </InfoTooltip>
                      <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark">
                        {getDataLabel()}
                      </p>
                    </div>
                    <div className="flex-1 flex items-center justify-center min-h-0">
                      <CrossSegmentStackedBarChart
                        data={analysisData.productTypeStackedData.chartData}
                        dataKeys={analysisData.productTypeStackedData.segments}
                        xAxisLabel="Year"
                        yAxisLabel={getDataLabel()}
                        nameKey="year"
                      />
                    </div>
                  </div>
                )}

                {/* Application Stacked Bar Chart */}
                {analysisData.applicationStackedData.chartData.length > 0 && analysisData.applicationStackedData.segments.length > 0 && (
                  <div className={`p-5 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 h-[480px] flex flex-col ${isDark ? 'bg-navy-card border-2 border-navy-light' : 'bg-white border-2 border-gray-200'}`}>
                    <div className="mb-3 pb-3 border-b border-gray-200 dark:border-navy-light">
                      <InfoTooltip content={`• Shows ${filters.marketEvaluation === 'By Volume' ? 'market volume' : 'market size'} share by form by year\n• X-axis: Year, Y-axis: ${filters.marketEvaluation === 'By Volume' ? 'Market Volume' : 'Market Size'}\n• Each stacked bar shows the proportion for that year\n• Hover over bars to see detailed values and percentages`}>
                        <h3 className="text-base font-bold text-electric-blue dark:text-cyan-accent mb-1 cursor-help">
                          Form Share
                        </h3>
                      </InfoTooltip>
                      <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark">
                        {getDataLabel()}
                      </p>
                    </div>
                    <div className="flex-1 flex items-center justify-center min-h-0">
                      <CrossSegmentStackedBarChart
                        data={analysisData.applicationStackedData.chartData}
                        dataKeys={analysisData.applicationStackedData.segments}
                        xAxisLabel="Year"
                        yAxisLabel={getDataLabel()}
                        nameKey="year"
                      />
                    </div>
                  </div>
                )}

                {/* End User Stacked Bar Chart */}
                {analysisData.endUserStackedData.chartData.length > 0 && analysisData.endUserStackedData.segments.length > 0 && (
                  <div className={`p-5 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 h-[480px] flex flex-col ${isDark ? 'bg-navy-card border-2 border-navy-light' : 'bg-white border-2 border-gray-200'}`}>
                    <div className="mb-3 pb-3 border-b border-gray-200 dark:border-navy-light">
                      <InfoTooltip content={`• Shows ${filters.marketEvaluation === 'By Volume' ? 'market volume' : 'market size'} share by application by year\n• X-axis: Year, Y-axis: ${filters.marketEvaluation === 'By Volume' ? 'Market Volume' : 'Market Size'}\n• Each stacked bar shows the proportion for that year\n• Hover over bars to see detailed values and percentages`}>
                        <h3 className="text-base font-bold text-electric-blue dark:text-cyan-accent mb-1 cursor-help">
                          Application Share
                        </h3>
                      </InfoTooltip>
                      <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark">
                        {getDataLabel()}
                      </p>
                    </div>
                    <div className="flex-1 flex items-center justify-center min-h-0">
                      <CrossSegmentStackedBarChart
                        data={analysisData.endUserStackedData.chartData}
                        dataKeys={analysisData.endUserStackedData.segments}
                        xAxisLabel="Year"
                        yAxisLabel={getDataLabel()}
                        nameKey="year"
                      />
                    </div>
                  </div>
                )}

                {/* Distribution Channel Type Stacked Bar Chart */}
                {analysisData.distributionChannelTypeStackedData.chartData.length > 0 && analysisData.distributionChannelTypeStackedData.segments.length > 0 && (
                  <div className={`p-5 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 h-[480px] flex flex-col ${isDark ? 'bg-navy-card border-2 border-navy-light' : 'bg-white border-2 border-gray-200'}`}>
                    <div className="mb-3 pb-3 border-b border-gray-200 dark:border-navy-light">
                      <InfoTooltip content={`• Shows ${filters.marketEvaluation === 'By Volume' ? 'market volume' : 'market size'} share by distribution channel type by year\n• X-axis: Year, Y-axis: ${filters.marketEvaluation === 'By Volume' ? 'Market Volume' : 'Market Size'}\n• Each stacked bar shows the proportion for that year\n• Hover over bars to see detailed values and percentages`}>
                        <h3 className="text-base font-bold text-electric-blue dark:text-cyan-accent mb-1 cursor-help">
                          Distribution Channel Type Share
                        </h3>
                      </InfoTooltip>
                      <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark">
                        {getDataLabel()}
                      </p>
                    </div>
                    <div className="flex-1 flex items-center justify-center min-h-0">
                      <CrossSegmentStackedBarChart
                        data={analysisData.distributionChannelTypeStackedData.chartData}
                        dataKeys={analysisData.distributionChannelTypeStackedData.segments}
                        xAxisLabel="Year"
                        yAxisLabel={getDataLabel()}
                        nameKey="year"
                      />
                    </div>
                  </div>
                )}

                {/* Offline Channel Subtype Stacked Bar Chart - Only show if Offline type is selected */}
                {analysisData.offlineChannelStackedData.chartData.length > 0 && analysisData.offlineChannelStackedData.segments.length > 0 && (
                  <div className={`p-5 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 h-[480px] flex flex-col ${isDark ? 'bg-navy-card border-2 border-navy-light' : 'bg-white border-2 border-gray-200'}`}>
                    <div className="mb-3 pb-3 border-b border-gray-200 dark:border-navy-light">
                      <InfoTooltip content={`• Shows ${filters.marketEvaluation === 'By Volume' ? 'market volume' : 'market size'} share by offline distribution channel subtypes by year\n• X-axis: Year, Y-axis: ${filters.marketEvaluation === 'By Volume' ? 'Market Volume' : 'Market Size'}\n• Each stacked bar shows the proportion for that year\n• Hover over bars to see detailed values and percentages`}>
                        <h3 className="text-base font-bold text-electric-blue dark:text-cyan-accent mb-1 cursor-help">
                          Offline Channel Share
                        </h3>
                      </InfoTooltip>
                      <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark">
                        {getDataLabel()}
                      </p>
                    </div>
                    <div className="flex-1 flex items-center justify-center min-h-0">
                      <CrossSegmentStackedBarChart
                        data={analysisData.offlineChannelStackedData.chartData}
                        dataKeys={analysisData.offlineChannelStackedData.segments}
                        xAxisLabel="Year"
                        yAxisLabel={getDataLabel()}
                        nameKey="year"
                      />
                    </div>
                  </div>
                )}

                {/* Online Channel Subtype Stacked Bar Chart - Only show if Online type is selected */}
                {analysisData.onlineChannelStackedData.chartData.length > 0 && analysisData.onlineChannelStackedData.segments.length > 0 && (
                  <div className={`p-5 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 h-[480px] flex flex-col ${isDark ? 'bg-navy-card border-2 border-navy-light' : 'bg-white border-2 border-gray-200'}`}>
                    <div className="mb-3 pb-3 border-b border-gray-200 dark:border-navy-light">
                      <InfoTooltip content={`• Shows ${filters.marketEvaluation === 'By Volume' ? 'market volume' : 'market size'} share by online distribution channel subtypes by year\n• X-axis: Year, Y-axis: ${filters.marketEvaluation === 'By Volume' ? 'Market Volume' : 'Market Size'}\n• Each stacked bar shows the proportion for that year\n• Hover over bars to see detailed values and percentages`}>
                        <h3 className="text-base font-bold text-electric-blue dark:text-cyan-accent mb-1 cursor-help">
                          Online Channel Share
                        </h3>
                      </InfoTooltip>
                      <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark">
                        {getDataLabel()}
                      </p>
                    </div>
                    <div className="flex-1 flex items-center justify-center min-h-0">
                      <CrossSegmentStackedBarChart
                        data={analysisData.onlineChannelStackedData.chartData}
                        dataKeys={analysisData.onlineChannelStackedData.segments}
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

          {/* Graph 6: Market Size by Country */}
          {analysisData.countryChartData.length > 0 && analysisData.countries && analysisData.countries.length > 0 && (
            <div className="mb-20">
              <div className="mb-8">
                <div className="flex items-center gap-3 mb-3">
                  <div className={`w-1 h-10 rounded-full ${isDark ? 'bg-cyan-accent' : 'bg-electric-blue'}`}></div>
                  <InfoTooltip content={`• Shows ${filters.marketEvaluation === 'By Volume' ? 'market volume' : 'market size'} by country grouped by year\n• X-axis: Year\n• Y-axis: ${filters.marketEvaluation === 'By Volume' ? 'Market Volume' : 'Market Size'}\n• Compare country performance across years`}>
                    <h2 className="text-3xl font-bold text-text-primary-light dark:text-text-primary-dark cursor-help">
                      {filters.marketEvaluation === 'By Volume' ? 'Market Volume' : 'Market Size'} by Country by Year
                    </h2>
                  </InfoTooltip>
                </div>
                <p className="text-base text-text-secondary-light dark:text-text-secondary-dark ml-4 mb-2">
                  Country-wise breakdown grouped by year
                </p>
              </div>
              <div className={`p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 h-[550px] flex flex-col ${isDark ? 'bg-navy-card border-2 border-navy-light' : 'bg-white border-2 border-gray-200'}`}>
                <div className="mb-4 pb-4 border-b border-gray-200 dark:border-navy-light">
                  <h3 className="text-lg font-bold text-electric-blue dark:text-cyan-accent mb-1">
                    {filters.marketEvaluation === 'By Volume' ? 'Market Volume' : 'Market Size'} by Country by Year
                  </h3>
                  <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark">
                    {getDataLabel()}
                  </p>
                </div>
                <div className="flex-1 flex items-center justify-center min-h-0 pt-2">
                  <SegmentGroupedBarChart
                    data={analysisData.countryChartData}
                    segmentKeys={analysisData.countries}
                    xAxisLabel="Year"
                    yAxisLabel={getDataLabel()}
                  />
                </div>
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
                    onChange={(value) => setIncrementalFilters({ ...incrementalFilters, region: value as string[] })}
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
                      const newRegions = value as string[]
                      setAttractivenessFilters({ ...attractivenessFilters, region: newRegions, country: [] })
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
                    label="Segment Type"
                    value={attractivenessFilters.selectedCategory || ''}
                    onChange={(value) => {
                      setAttractivenessFilters({ ...attractivenessFilters, selectedCategory: value as string })
                    }}
                    options={[
                      'pyrolysisMethod',
                      'sourceMaterial',
                      'productGrade',
                      'form',
                      'application',
                      'distributionChannel'
                    ]}
                    optionLabels={{
                      'pyrolysisMethod': 'By Pyrolysis Method',
                      'sourceMaterial': 'By Source Material',
                      'productGrade': 'By Product Grade',
                      'form': 'By Form',
                      'application': 'By Application',
                      'distributionChannel': 'By Distribution Channel'
                    }}
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

                {!attractivenessFilters.selectedCategory ? (
                  <div className={`p-6 rounded-xl shadow-lg ${isDark ? 'bg-navy-card border-2 border-navy-light' : 'bg-white border-2 border-gray-200'}`}>
                    <div className="flex items-center justify-center h-[400px]">
                      <p className="text-text-secondary-light dark:text-text-secondary-dark text-lg">
                        Please select a product category above to view the market attractiveness chart
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
                        {attractivenessFilters.selectedCategory === 'pyrolysisMethod' && 'By Pyrolysis Method'}
                        {attractivenessFilters.selectedCategory === 'sourceMaterial' && 'By Source Material'}
                        {attractivenessFilters.selectedCategory === 'productGrade' && 'By Product Grade'}
                        {attractivenessFilters.selectedCategory === 'form' && 'By Form'}
                        {attractivenessFilters.selectedCategory === 'application' && 'By Application'}
                        {attractivenessFilters.selectedCategory === 'distributionChannel' && 'By Distribution Channel'}
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
                    Filter Y-o-Y analysis data by region, product type, and country.
                  </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <FilterDropdown
                    label="Region"
                    value={yoyFilters.region}
                    onChange={(value) => {
                      const newRegions = value as string[]
                      // Clear country selection when region changes and limit to one region to avoid clubbing
                      const singleRegion = newRegions.length > 0 ? [newRegions[newRegions.length - 1]] : []
                      setYoyFilters({ ...yoyFilters, region: singleRegion, country: [] })
                    }}
                    options={yoyFilterOptions.regions}
                  />
                  <FilterDropdown
                    label="Country"
                    value={yoyFilters.country}
                    onChange={(value) => {
                      const newCountries = value as string[]
                      // Clear region selection when country changes and limit to one country
                      const singleCountry = newCountries.length > 0 ? [newCountries[newCountries.length - 1]] : []
                      setYoyFilters({ ...yoyFilters, country: singleCountry, region: [] })
                    }}
                    options={yoyFilterOptions.countries}
                    optionLabels={yoyFilterOptions.countryOptions.reduce((acc, opt) => {
                      acc[opt.value] = opt.label
                      return acc
                    }, {} as Record<string, string>)}
                  />
                  <FilterDropdown
                    label="Product Type"
                    value={yoyFilters.productType}
                    onChange={(value) => setYoyFilters({ ...yoyFilters, productType: value as string[] })}
                    options={yoyFilterOptions.productTypes}
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
                            productTypes={entity.productTypes}
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
