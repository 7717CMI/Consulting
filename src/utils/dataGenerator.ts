interface ShovelMarketData {
  recordId: number
  year: number
  region: string
  country: string
  serviceType: string // By Service Type
  endUserType: string // By End User
  deliveryChannel: string // By Delivery Channel
  businessModel: string // By Business Model
  productType: string // By Pyrolysis Method
  bladeMaterial: string // By Source Material
  handleLength: string // By Product Grade
  application: string // By Form
  endUser: string // By Application (main category)
  distributionChannelType: string // By Distribution Channel (Direct/Indirect)
  distributionChannel: string // By Application Subtype (based on endUser/Application)
  brand: string
  company: string
  price: number
  volumeUnits: number
  qty: number
  revenue: number
  marketValueUsd: number
  value: number
  marketSharePct: number
  cagr: number
  yoyGrowth: number
}

const generateComprehensiveData = (): ShovelMarketData[] => {
  const years = Array.from({ length: 15 }, (_, i) => 2021 + i)
  const regions = ["North America", "Europe", "APAC", "Latin America", "Middle East", "Africa"]
  
  // New filter arrays
  const serviceTypes = [
    "Personal Branding & Executive Consulting",
    "Digital Presence & Branding Consulting",
    "Transition & Career Image Coaching",
    "Corporate & Institutional Image Training",
    "Educational & Scalable Branding Programs",
    "Public Figure & Media Image Consulting",
    "Others (Communication & Presence Coaching, etc.)"
  ]
  
  const endUserTypes = [
    "Senior Executives & Professionals",
    "Transitioning Military Personnel",
    "Youth & Students (High School / College)",
    "Public Figures",
    "Government Officials",
    "Corporate Teams (HR, Sales, Leadership)",
    "Everyday Professionals (Emerging Workforce)"
  ]
  
  const deliveryChannels = [
    "In-Person Consulting",
    "Virtual / Online Consulting",
    "Hybrid Engagement"
  ]
  
  const businessModels = [
    "Premium One-on-One Consulting",
    "Subscription-Based Digital Coaching",
    "Corporate Contracts / Retainers",
    "Online Course / Self-paced Learning",
    "Hybrid Workshop + eLearning",
    "Licensing / Affiliate Programs"
  ]
  
  // Old Wood Vinegar Market filters (keeping for compatibility)
  const productTypes = ["Slow Pyrolysis", "Fast Pyrolysis", "Intermediate Pyrolysis", "Dry Distillation"]
  const bladeMaterials = ["Hardwood", "Softwood", "Bamboo", "Coconut Shell / Palm Waste", "Fruitwood", "Others (Sawdust, Crop Residue, Mixed Biomass)"]
  const handleLengths = ["Agricultural Grade", "Industrial Grade", "Pharmaceutical / Food Grade"]
  const applications = ["Liquid", "Powder / Solid", "Concentrate / Distilled"] // By Form
  const endUsers = [
    "Agriculture & Farming",
    "Animal Feed & Husbandry",
    "Food & Beverage",
    "Pharmaceuticals & Healthcare",
    "Personal Care & Cosmetics",
    "Activated Carbon & Charcoal Production",
    "Others (Bioenergy & Chemicals etc.)"
  ] // By Application (main category)

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

  const distributionChannelTypes = ["Direct", "Indirect (Via Distributors)"]
  const offlineChannels = ["Direct"]
  const onlineChannels = ["Indirect (Via Distributors)"]

  const brands = [
    "Fiskars", "Bully Tools", "Razor-Back", "Truper", "Ames", 
    "Spear & Jackson", "Radius Garden", "Seymour", "Union Tools", "Garant"
  ]
  
  const companies = [
    "Fiskars Corporation", "Bully Tools Inc", "Razor-Back Tools", "Truper Herramientas",
    "Ames True Temper", "Spear & Jackson", "Radius Garden", "Seymour Manufacturing",
    "Union Tools", "Garant GP"
  ]
  
  const countryMap: Record<string, string[]> = {
    "North America": ["U.S.", "Canada"],
    "Europe": ["U.K.", "Germany", "Italy", "France", "Spain", "Russia"],
    "APAC": ["China", "India", "Japan", "South Korea", "Australia"],
    "Latin America": ["Brazil", "Argentina", "Mexico", "Peru"],
    "Middle East": ["GCC", "Israel"],
    "Africa": ["South Africa"]
  }
  
  // Product type multipliers for variation (By Pyrolysis Method)
  const productTypeMultipliers: Record<string, { price: number; volume: number; cagr: number }> = {
    'Slow Pyrolysis': { price: 1.0, volume: 1.2, cagr: 1.1 },
    'Fast Pyrolysis': { price: 1.1, volume: 1.3, cagr: 1.2 },
    'Intermediate Pyrolysis': { price: 1.05, volume: 1.1, cagr: 1.05 },
    'Dry Distillation': { price: 0.9, volume: 1.0, cagr: 1.0 }
  }

  // Blade material multipliers (By Source Material)
  const bladeMaterialMultipliers: Record<string, { price: number; volume: number }> = {
    'Hardwood': { price: 1.2, volume: 1.3 },
    'Softwood': { price: 1.0, volume: 1.4 },
    'Bamboo': { price: 1.1, volume: 1.2 },
    'Coconut Shell / Palm Waste': { price: 0.9, volume: 1.1 },
    'Fruitwood': { price: 1.3, volume: 0.9 },
    'Others (Sawdust, Crop Residue, Mixed Biomass)': { price: 0.8, volume: 1.0 }
  }

  // Application multipliers (By Form)
  const applicationMultipliers: Record<string, { volume: number; price: number }> = {
    'Liquid': { volume: 1.5, price: 1.2 },
    'Powder / Solid': { volume: 1.0, price: 0.9 },
    'Concentrate / Distilled': { volume: 0.8, price: 1.4 }
  }

  // End user multipliers (By Application category)
  const endUserMultipliers: Record<string, { volume: number; price: number }> = {
    'Agriculture & Farming': { volume: 1.5, price: 1.0 },
    'Animal Feed & Husbandry': { volume: 1.2, price: 1.1 },
    'Food & Beverage': { volume: 0.8, price: 1.4 },
    'Pharmaceuticals & Healthcare': { volume: 0.7, price: 1.6 },
    'Personal Care & Cosmetics': { volume: 1.0, price: 1.3 },
    'Activated Carbon & Charcoal Production': { volume: 1.3, price: 1.1 },
    'Others (Bioenergy & Chemicals etc.)': { volume: 1.0, price: 1.0 }
  }
  
  // Region-specific multipliers
  const regionMultipliers: Record<string, { volume: number; marketShare: number }> = {
    'North America': { volume: 1.5, marketShare: 1.4 },
    'Europe': { volume: 1.3, marketShare: 1.3 },
    'APAC': { volume: 1.8, marketShare: 1.5 },
    'Latin America': { volume: 1.1, marketShare: 0.9 },
    'Middle East': { volume: 0.9, marketShare: 1.1 },
    'Africa': { volume: 1.2, marketShare: 0.8 }
  }
  
  // Brand-specific multipliers
  const brandPremiumMap: Record<string, number> = {}
  brands.forEach((brand, idx) => {
    brandPremiumMap[brand] = 0.8 + (idx % 3) * 0.4 // Creates 3 tiers: 0.8, 1.2, 1.6
  })

  const data: ShovelMarketData[] = []
  let recordId = 100000
  
  let seed = 42
  const seededRandom = () => {
    seed = (seed * 9301 + 49297) % 233280
    return seed / 233280
  }
  
  for (const year of years) {
    for (const region of regions) {
      const regionMult = regionMultipliers[region]
      const countries = countryMap[region] || []
      
      for (const country of countries) {
        for (const serviceType of serviceTypes) {
          for (const endUserType of endUserTypes) {
            for (const deliveryChannel of deliveryChannels) {
              for (const businessModel of businessModels) {
                // Sample only one combination from old filters to reduce data size
                const productType = productTypes[Math.floor(seededRandom() * productTypes.length)]
                const productMult = productTypeMultipliers[productType]
                
                const bladeMaterial = bladeMaterials[Math.floor(seededRandom() * bladeMaterials.length)]
                const bladeMult = bladeMaterialMultipliers[bladeMaterial]
                
                const handleLength = handleLengths[Math.floor(seededRandom() * handleLengths.length)]
                const handleMult = handleLength === 'Long Handle' ? 1.1 : handleLength === 'Short Handle' ? 0.9 : 1.0
                
                const application = applications[Math.floor(seededRandom() * applications.length)]
                const appMult = applicationMultipliers[application]
                
                const endUser = endUsers[Math.floor(seededRandom() * endUsers.length)]
                const userMult = endUserMultipliers[endUser]
                
                // Determine distribution channel type (now Direct/Indirect)
                const isDirect = seededRandom() > 0.5 // 50% direct, 50% indirect
                const distributionChannelType = isDirect ? 'Direct' : 'Indirect (Via Distributors)'

                // Get application subtype based on the endUser (application category)
                const subtypes = applicationSubtypes[endUser] || []
                const distributionChannel = subtypes.length > 0
                  ? subtypes[Math.floor(seededRandom() * subtypes.length)]
                  : endUser // fallback to category if no subtypes
                
                const brand = brands[Math.floor(seededRandom() * brands.length)]
                const brandMult = brandPremiumMap[brand] || 1.0
                const company = companies[Math.floor(seededRandom() * companies.length)]
                  
                  // Apply all multipliers for variation
                  const basePrice = 10 + seededRandom() * 90 // $10-$100
                  const price = basePrice * productMult.price * bladeMult.price * brandMult * (1 + (year - 2021) * 0.02)
                  
                  const baseVolume = 100 + seededRandom() * 900 // 100-1000 units
                  const volumeUnits = Math.floor(
                    baseVolume * 
                    regionMult.volume * 
                    productMult.volume * 
                    bladeMult.volume * 
                    appMult.volume * 
                    userMult.volume * 
                    handleMult *
                    (1 + (year - 2021) * 0.05)
                  )
                  
                  const revenue = price * volumeUnits
                  const marketValueUsd = revenue * (0.9 + seededRandom() * 0.2)
                  
                  const baseMarketShare = 1 + seededRandom() * 24
                  const marketSharePct = baseMarketShare * regionMult.marketShare * brandMult
                  
                  const baseCAGR = -2 + seededRandom() * 12
                  const cagr = baseCAGR * productMult.cagr
                  const yoyGrowth = -5 + seededRandom() * 20
                  const qty = Math.floor(volumeUnits * (0.8 + seededRandom() * 0.4))
                  
                data.push({
                  recordId,
                  year,
                  region,
                  country,
                  serviceType,
                  endUserType,
                  deliveryChannel,
                  businessModel,
                  productType,
                  bladeMaterial,
                  handleLength,
                  application,
                  endUser,
                  distributionChannelType,
                  distributionChannel,
                  brand,
                  company,
                  price: Math.round(price * 100) / 100,
                  volumeUnits,
                  qty,
                  revenue: Math.round(revenue * 100) / 100,
                  marketValueUsd: Math.round(marketValueUsd * 100) / 100,
                  value: Math.round(marketValueUsd * 100) / 100,
                  marketSharePct: Math.round(marketSharePct * 100) / 100,
                  cagr: Math.round(cagr * 100) / 100,
                  yoyGrowth: Math.round(yoyGrowth * 100) / 100,
                })
                
                recordId++
              }
            }
          }
        }
      }
    }
  }
  
  return data
}

let dataCache: ShovelMarketData[] | null = null

export const getData = (): ShovelMarketData[] => {
  if (!dataCache) {
    try {
      dataCache = generateComprehensiveData()
    } catch (error) {
      dataCache = []
    }
  }
  return dataCache
}

// Function to clear cache and regenerate data (for development/testing)
export const clearDataCache = () => {
  dataCache = null
}

export interface FilterOptions {
  year?: number[]
  productType?: string[]
  bladeMaterial?: string[]
  handleLength?: string[]
  application?: string[]
  endUser?: string[]
  distributionChannelType?: string[]
  distributionChannel?: string[]
  region?: string[]
  country?: string[]
  brand?: string[]
  company?: string[]
  [key: string]: any
}

export const filterDataframe = (data: ShovelMarketData[], filters: FilterOptions): ShovelMarketData[] => {
  let filtered = [...data]
  
  for (const [field, values] of Object.entries(filters)) {
    if (values && Array.isArray(values) && values.length > 0) {
      filtered = filtered.filter(item => {
        const itemValue = item[field as keyof ShovelMarketData]
        // Handle number to string conversion for year field
        if (field === 'year' && typeof itemValue === 'number') {
          return values.map(v => String(v)).includes(String(itemValue))
        }
        return values.includes(itemValue as any)
      })
    }
  }
  
  return filtered
}

export const formatNumber = (num: number): string => {
  if (num >= 1_000_000_000) {
    const formatted = (num / 1_000_000_000).toFixed(1)
    return `${parseFloat(formatted).toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}B`
  } else if (num >= 1_000_000) {
    const formatted = (num / 1_000_000).toFixed(1)
    return `${parseFloat(formatted).toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}M`
  } else if (num >= 1_000) {
    const formatted = (num / 1_000).toFixed(1)
    return `${parseFloat(formatted).toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}K`
  }
  return Math.round(num).toLocaleString('en-US')
}

export const formatWithCommas = (num: number, decimals = 1): string => {
  const value = parseFloat(num.toFixed(decimals))
  return value.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })
}

export const addCommas = (num: number | null | undefined): string | number | null | undefined => {
  if (num === null || num === undefined || isNaN(num)) {
    return num
  }
  return Number(num).toLocaleString('en-US', { maximumFractionDigits: 2 })
}

export type { ShovelMarketData }
