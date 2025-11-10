import { useState, useEffect, useMemo } from 'react'
import { ArrowLeft, Download, Filter } from 'lucide-react'
import { motion } from 'framer-motion'
import { getCustomerIntelligenceData, CustomerIntelligenceData } from '../utils/customerIntelligenceGenerator'
import { FilterDropdown } from '../components/FilterDropdown'
import { StackedBarChart } from '../components/StackedBarChart'
import { BarChart } from '../components/BarChart'
import { PieChart } from '../components/PieChart'
import { StatBox } from '../components/StatBox'
import { useTheme } from '../context/ThemeContext'
import { InfoTooltip } from '../components/InfoTooltip'

interface CustomerIntelligenceProps {
  onNavigate: (page: string) => void
}

export function CustomerIntelligence({ onNavigate }: CustomerIntelligenceProps) {
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  
  const [data, setData] = useState<CustomerIntelligenceData[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    region: [] as string[],
    industrySector: [] as string[],
    typeOfShovelRequired: [] as string[],
    qualityPreference: [] as string[],
    priceSensitivity: [] as string[],
    leadPotential: [] as string[],
  })
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(20)
  const [sortColumn, setSortColumn] = useState<keyof CustomerIntelligenceData | null>(null)
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')

  // Generate dummy data for showcase table (separate from analysis data)
  const showcaseData = useMemo(() => {
    // Company data with multiple contacts per company
    const companyData = [
      {
        sNo: '1',
        companyName: 'BrightView Landscaping',
        industrySector: 'Landscaping',
        headquartersAddress: '980 Jolly Road, Blue Bell, PA 19422',
        yearsOfExistence: '80',
        contacts: [
          {
            name: 'Mr. John Smith',
            decisionRole: 'Centralized Procurement & Branch Manager',
            emailId: 'john.smith@brightview.com',
            telephone: '844-235-7777'
          },
          {
            name: 'Ms. Jennifer Williams',
            decisionRole: 'Operations Director',
            emailId: 'jennifer.williams@brightview.com',
            telephone: '844-235-7778'
          },
          {
            name: 'Mr. Robert Thompson',
            decisionRole: 'Regional Procurement Manager',
            emailId: 'robert.thompson@brightview.com',
            telephone: '844-235-7779'
          }
        ],
        website: 'https://www.brightview.com',
        typeOfShovelRequired: 'Hand/garden shovels for crews',
        primaryUseCase: 'Landscaping installation & maintenance, tree/planting, grounds work',
        estimatedVolumeRequirement: '6,000-10,000 units/year',
        replacementCycle: 'Annual',
        existingBrandsUsed: 'SiteOne Landscape Supply',
        qualityPreference: 'High-durability (pro/contractor-grade) to reduce downtime',
        priceSensitivity: 'Medium: multi-branch procurement seeks TCO optimization',
        certificationsRequired: 'OSHA workplace safety compliance',
        sustainabilityPreference: 'Eco-friendly materials, recyclable components',
        demandAttractiveScore: '5 - largest national buyer; continuous replenishment',
        fitForOEMShovelType: '4 - strong fit',
        leadPotential: 'Hot - scale & centralized sourcing & frequent replenishment'
      },
      {
        sNo: '2',
        companyName: 'Caterpillar Inc.',
        industrySector: 'Mining & Quarrying',
        headquartersAddress: '100 NE Adams St, Peoria, IL 61629',
        yearsOfExistence: '98',
        contacts: [
          {
            name: 'Ms. Sarah Johnson',
            decisionRole: 'Procurement Director',
            emailId: 'sarah.johnson@cat.com',
            telephone: '309-675-1000'
          },
          {
            name: 'Mr. Mark Davis',
            decisionRole: 'Global Sourcing Manager',
            emailId: 'mark.davis@cat.com',
            telephone: '309-675-1001'
          }
        ],
        website: 'https://www.caterpillar.com',
        typeOfShovelRequired: 'Mining Rope Shovels',
        primaryUseCase: 'Mining operations and material handling',
        estimatedVolumeRequirement: '50-100 units annually',
        replacementCycle: '5+ yrs',
        existingBrandsUsed: 'Caterpillar, Komatsu',
        qualityPreference: 'Premium quality preferred',
        priceSensitivity: 'Low',
        certificationsRequired: 'ISO 9001, MSHA compliance',
        sustainabilityPreference: 'Low-emission machinery, recyclable components',
        demandAttractiveScore: '5 - largest national buyer; continuous replenishment',
        fitForOEMShovelType: '5 - excellent fit',
        leadPotential: 'Hot - large volume requirements'
      },
      {
        sNo: '3',
        companyName: 'TruGreen',
        industrySector: 'Landscaping',
        headquartersAddress: '860 Ridge Lake Blvd, Memphis, TN 38120',
        yearsOfExistence: '45',
        contacts: [
          {
            name: 'Mr. Michael Brown',
            decisionRole: 'Operations Manager',
            emailId: 'michael.brown@trugreen.com',
            telephone: '901-762-7000'
          },
          {
            name: 'Ms. Amanda White',
            decisionRole: 'Procurement Manager',
            emailId: 'amanda.white@trugreen.com',
            telephone: '901-762-7001'
          },
          {
            name: 'Mr. Christopher Lee',
            decisionRole: 'Supply Chain Coordinator',
            emailId: 'christopher.lee@trugreen.com',
            telephone: '901-762-7002'
          }
        ],
        website: 'https://www.trugreen.com',
        typeOfShovelRequired: 'Hand/garden shovels for crews',
        primaryUseCase: 'Landscaping installation & maintenance, tree/planting, grounds work',
        estimatedVolumeRequirement: '8,000-12,000 units/year',
        replacementCycle: '2-3 yrs',
        existingBrandsUsed: 'Ames, Fiskars',
        qualityPreference: 'High-durability (pro/contractor-grade) to reduce downtime',
        priceSensitivity: 'Medium: multi-branch procurement seeks TCO optimization',
        certificationsRequired: 'OSHA workplace safety compliance',
        sustainabilityPreference: 'Eco-friendly materials',
        demandAttractiveScore: '4 - large regional buyer; regular replenishment',
        fitForOEMShovelType: '4 - strong fit',
        leadPotential: 'Hot - scale & centralized sourcing & frequent replenishment'
      },
      {
        sNo: '4',
        companyName: 'Deere & Company',
        industrySector: 'Agriculture',
        headquartersAddress: 'One John Deere Place, Moline, IL 61265',
        yearsOfExistence: '186',
        contacts: [
          {
            name: 'Ms. Emily Davis',
            decisionRole: 'Supply Chain Manager',
            emailId: 'emily.davis@johndeere.com',
            telephone: '309-765-8000'
          },
          {
            name: 'Mr. Thomas Anderson',
            decisionRole: 'Procurement Director',
            emailId: 'thomas.anderson@johndeere.com',
            telephone: '309-765-8001'
          }
        ],
        website: 'https://www.deere.com',
        typeOfShovelRequired: 'Excavator shovel/bucket attachments',
        primaryUseCase: 'Agricultural field work and soil management',
        estimatedVolumeRequirement: '2,000-5,000 units/year',
        replacementCycle: '2-3 yrs',
        existingBrandsUsed: 'John Deere, Case IH',
        qualityPreference: 'Brand-specific',
        priceSensitivity: 'Low',
        certificationsRequired: 'ISO 9001, CE marking',
        sustainabilityPreference: 'Low-emission machinery',
        demandAttractiveScore: '4 - large regional buyer; regular replenishment',
        fitForOEMShovelType: '3 - moderate fit',
        leadPotential: 'Warm - steady procurement'
      },
      {
        sNo: '5',
        companyName: 'Waste Management Inc.',
        industrySector: 'Environmental Services',
        headquartersAddress: '1001 Fannin St, Houston, TX 77002',
        yearsOfExistence: '54',
        contacts: [
          {
            name: 'Mr. Robert Wilson',
            decisionRole: 'Equipment Manager',
            emailId: 'robert.wilson@wm.com',
            telephone: '713-512-6200'
          },
          {
            name: 'Ms. Linda Martinez',
            decisionRole: 'Facilities Director',
            emailId: 'linda.martinez@wm.com',
            telephone: '713-512-6201'
          }
        ],
        website: 'https://www.wm.com',
        typeOfShovelRequired: 'Hand/garden shovels for crews',
        primaryUseCase: 'Warehouse material handling',
        estimatedVolumeRequirement: '1,500-3,000 units/year',
        replacementCycle: 'Annual',
        existingBrandsUsed: 'Bully Tools, Razor-Back',
        qualityPreference: 'Standard quality acceptable',
        priceSensitivity: 'High',
        certificationsRequired: 'OSHA workplace safety compliance',
        sustainabilityPreference: 'Recyclable components',
        demandAttractiveScore: '3 - medium buyer; periodic replenishment',
        fitForOEMShovelType: '3 - moderate fit',
        leadPotential: 'Warm - moderate volume'
      },
      {
        sNo: '6',
        companyName: 'The Home Depot',
        industrySector: 'Retail',
        headquartersAddress: '2455 Paces Ferry Rd NW, Atlanta, GA 30339',
        yearsOfExistence: '45',
        contacts: [
          {
            name: 'Ms. Lisa Anderson',
            decisionRole: 'Category Manager',
            emailId: 'lisa.anderson@homedepot.com',
            telephone: '770-433-8211'
          },
          {
            name: 'Mr. James Wilson',
            decisionRole: 'Merchandising Director',
            emailId: 'james.wilson@homedepot.com',
            telephone: '770-433-8212'
          },
          {
            name: 'Ms. Patricia Moore',
            decisionRole: 'Sourcing Manager',
            emailId: 'patricia.moore@homedepot.com',
            telephone: '770-433-8213'
          }
        ],
        website: 'https://www.homedepot.com',
        typeOfShovelRequired: 'Hand/garden shovels for crews',
        primaryUseCase: 'Retail distribution',
        estimatedVolumeRequirement: '15,000-25,000 units/year',
        replacementCycle: 'Annual',
        existingBrandsUsed: 'Ames, Fiskars, Bully Tools',
        qualityPreference: 'Brand-agnostic when specs met',
        priceSensitivity: 'High',
        certificationsRequired: 'CE marking, BIS',
        sustainabilityPreference: 'Eco-friendly materials, recyclable components',
        demandAttractiveScore: '5 - largest national buyer; continuous replenishment',
        fitForOEMShovelType: '4 - strong fit',
        leadPotential: 'Hot - scale & centralized sourcing & frequent replenishment'
      },
      {
        sNo: '7',
        companyName: 'Lowe\'s Companies',
        industrySector: 'Retail',
        headquartersAddress: '1000 Lowes Blvd, Mooresville, NC 28117',
        yearsOfExistence: '101',
        contacts: [
          {
            name: 'Mr. David Martinez',
            decisionRole: 'Sourcing Manager',
            emailId: 'david.martinez@lowes.com',
            telephone: '704-758-1000'
          },
          {
            name: 'Ms. Rachel Green',
            decisionRole: 'Category Director',
            emailId: 'rachel.green@lowes.com',
            telephone: '704-758-1001'
          }
        ],
        website: 'https://www.lowes.com',
        typeOfShovelRequired: 'Hand/garden shovels for crews',
        primaryUseCase: 'Retail distribution',
        estimatedVolumeRequirement: '12,000-20,000 units/year',
        replacementCycle: 'Annual',
        existingBrandsUsed: 'Ames, Fiskars, True Temper',
        qualityPreference: 'Brand-agnostic when specs met',
        priceSensitivity: 'High',
        certificationsRequired: 'CE marking, BIS',
        sustainabilityPreference: 'Eco-friendly materials',
        demandAttractiveScore: '5 - largest national buyer; continuous replenishment',
        fitForOEMShovelType: '4 - strong fit',
        leadPotential: 'Hot - scale & centralized sourcing & frequent replenishment'
      },
      {
        sNo: '8',
        companyName: 'CEMEX',
        industrySector: 'Construction & Infrastructure',
        headquartersAddress: 'Av. Ricardo Margáin Zozaya #325, San Pedro Garza García, NL 66265, Mexico',
        yearsOfExistence: '116',
        contacts: [
          {
            name: 'Ms. Patricia Garcia',
            decisionRole: 'Procurement Director',
            emailId: 'patricia.garcia@cemex.com',
            telephone: '+52-81-8888-0000'
          },
          {
            name: 'Mr. Carlos Rodriguez',
            decisionRole: 'Operations Manager',
            emailId: 'carlos.rodriguez@cemex.com',
            telephone: '+52-81-8888-0001'
          },
          {
            name: 'Ms. Maria Lopez',
            decisionRole: 'Supply Chain Coordinator',
            emailId: 'maria.lopez@cemex.com',
            telephone: '+52-81-8888-0002'
          }
        ],
        website: 'https://www.cemex.com',
        typeOfShovelRequired: 'Excavator shovel/bucket attachments',
        primaryUseCase: 'Construction excavation and site preparation',
        estimatedVolumeRequirement: '3,000-6,000 units/year',
        replacementCycle: '2-3 yrs',
        existingBrandsUsed: 'Caterpillar, Volvo',
        qualityPreference: 'Premium quality preferred',
        priceSensitivity: 'Medium: multi-branch procurement seeks TCO optimization',
        certificationsRequired: 'ISO 9001, CE marking',
        sustainabilityPreference: 'Low-emission machinery, recyclable components',
        demandAttractiveScore: '4 - large regional buyer; regular replenishment',
        fitForOEMShovelType: '4 - strong fit',
        leadPotential: 'Warm - steady procurement'
      },
      {
        sNo: '9',
        companyName: 'Arbor Day Foundation',
        industrySector: 'Forestry',
        headquartersAddress: '211 N 12th St, Lincoln, NE 68508',
        yearsOfExistence: '51',
        contacts: [
          {
            name: 'Mr. James Taylor',
            decisionRole: 'Facilities Manager',
            emailId: 'james.taylor@arborday.org',
            telephone: '402-474-5655'
          },
          {
            name: 'Ms. Susan Clark',
            decisionRole: 'Operations Coordinator',
            emailId: 'susan.clark@arborday.org',
            telephone: '402-474-5656'
          }
        ],
        website: 'https://www.arborday.org',
        typeOfShovelRequired: 'Hand/garden shovels for crews',
        primaryUseCase: 'Forestry operations and trail maintenance',
        estimatedVolumeRequirement: '500-1,000 units/year',
        replacementCycle: '2-3 yrs',
        existingBrandsUsed: 'Fiskars, Ames',
        qualityPreference: 'Standard quality acceptable',
        priceSensitivity: 'High',
        certificationsRequired: 'OSHA workplace safety compliance',
        sustainabilityPreference: 'Eco-friendly materials, recyclable components',
        demandAttractiveScore: '2 - small buyer; occasional replenishment',
        fitForOEMShovelType: '2 - weak fit',
        leadPotential: 'Cold - occasional purchases'
      },
      {
        sNo: '10',
        companyName: 'BHP Group',
        industrySector: 'Mining & Quarrying',
        headquartersAddress: '171 Collins St, Melbourne VIC 3000, Australia',
        yearsOfExistence: '138',
        contacts: [
          {
            name: 'Ms. Jennifer Lee',
            decisionRole: 'Procurement Director',
            emailId: 'jennifer.lee@bhp.com',
            telephone: '+61-3-9609-3333'
          },
          {
            name: 'Mr. Andrew Brown',
            decisionRole: 'Global Sourcing Manager',
            emailId: 'andrew.brown@bhp.com',
            telephone: '+61-3-9609-3334'
          },
          {
            name: 'Ms. Sarah Mitchell',
            decisionRole: 'Operations Director',
            emailId: 'sarah.mitchell@bhp.com',
            telephone: '+61-3-9609-3335'
          }
        ],
        website: 'https://www.bhp.com',
        typeOfShovelRequired: 'Mining Rope Shovels',
        primaryUseCase: 'Mining operations and material handling',
        estimatedVolumeRequirement: '20-50 units annually',
        replacementCycle: '5+ yrs',
        existingBrandsUsed: 'Caterpillar, Liebherr',
        qualityPreference: 'Premium quality preferred',
        priceSensitivity: 'Low',
        certificationsRequired: 'ISO 9001, MSHA compliance',
        sustainabilityPreference: 'Low-emission machinery',
        demandAttractiveScore: '5 - largest national buyer; continuous replenishment',
        fitForOEMShovelType: '5 - excellent fit',
        leadPotential: 'Hot - large volume requirements'
      }
    ]

    // Flatten to create one row per contact
    const flattenedData: Array<{
      sNo: string
      companyName: string
      industrySector: string
      headquartersAddress: string
      yearsOfExistence: string
      name: string
      decisionRole: string
      emailId: string
      website: string
      telephone: string
      typeOfShovelRequired: string
      primaryUseCase: string
      estimatedVolumeRequirement: string
      replacementCycle: string
      existingBrandsUsed: string
      qualityPreference: string
      priceSensitivity: string
      certificationsRequired: string
      sustainabilityPreference: string
      demandAttractiveScore: string
      fitForOEMShovelType: string
      leadPotential: string
    }> = []

    companyData.forEach(company => {
      company.contacts.forEach(contact => {
        flattenedData.push({
          sNo: company.sNo,
          companyName: company.companyName,
          industrySector: company.industrySector,
          headquartersAddress: company.headquartersAddress,
          yearsOfExistence: company.yearsOfExistence,
          name: contact.name,
          decisionRole: contact.decisionRole,
          emailId: contact.emailId,
          website: company.website,
          telephone: contact.telephone,
          typeOfShovelRequired: company.typeOfShovelRequired,
          primaryUseCase: company.primaryUseCase,
          estimatedVolumeRequirement: company.estimatedVolumeRequirement,
          replacementCycle: company.replacementCycle,
          existingBrandsUsed: company.existingBrandsUsed,
          qualityPreference: company.qualityPreference,
          priceSensitivity: company.priceSensitivity,
          certificationsRequired: company.certificationsRequired,
          sustainabilityPreference: company.sustainabilityPreference,
          demandAttractiveScore: company.demandAttractiveScore,
          fitForOEMShovelType: company.fitForOEMShovelType,
          leadPotential: company.leadPotential
        })
      })
    })

    return flattenedData
  }, [])

  useEffect(() => {
    setLoading(true)
    // Simulate async loading for better UX
    setTimeout(() => {
      const generatedData = getCustomerIntelligenceData()
      setData(generatedData)
      setLoading(false)
    }, 500)
  }, [])

  // Get unique filter options
  const uniqueOptions = useMemo(() => {
    return {
      regions: [...new Set(data.map(d => d.region))].filter(Boolean).sort(),
      industrySectors: [...new Set(data.map(d => d.industrySector))].filter(Boolean).sort(),
      shovelTypes: [...new Set(data.map(d => d.typeOfShovelRequired))].filter(Boolean).sort(),
      qualityPreferences: [...new Set(data.map(d => d.qualityPreference))].filter(Boolean).sort(),
      priceSensitivities: [...new Set(data.map(d => d.priceSensitivity))].filter(Boolean).sort(),
      leadPotentials: [...new Set(data.map(d => d.leadPotential))].filter(Boolean).sort(),
    }
  }, [data])

  // Filter data
  const filteredData = useMemo(() => {
    let filtered = [...data]

    if (filters.region.length > 0) {
      filtered = filtered.filter(d => filters.region.includes(d.region))
    }
    if (filters.industrySector.length > 0) {
      filtered = filtered.filter(d => filters.industrySector.includes(d.industrySector))
    }
    if (filters.typeOfShovelRequired.length > 0) {
      filtered = filtered.filter(d => filters.typeOfShovelRequired.includes(d.typeOfShovelRequired))
    }
    if (filters.qualityPreference.length > 0) {
      filtered = filtered.filter(d => filters.qualityPreference.includes(d.qualityPreference))
    }
    if (filters.priceSensitivity.length > 0) {
      filtered = filtered.filter(d => filters.priceSensitivity.includes(d.priceSensitivity))
    }
    if (filters.leadPotential.length > 0) {
      filtered = filtered.filter(d => filters.leadPotential.includes(d.leadPotential))
    }

    // Sort data
    if (sortColumn) {
      filtered.sort((a, b) => {
        const aVal = a[sortColumn] || ''
        const bVal = b[sortColumn] || ''
        const comparison = aVal.localeCompare(bVal)
        return sortDirection === 'asc' ? comparison : -comparison
      })
    }

    return filtered
  }, [data, filters, sortColumn, sortDirection])

  // Pagination
  const totalPages = Math.ceil(filteredData.length / itemsPerPage)
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    return filteredData.slice(startIndex, startIndex + itemsPerPage)
  }, [filteredData, currentPage, itemsPerPage])

  // Analysis data
  const analysisData = useMemo(() => {
    // By Region with Industry breakdown - for stacked bar chart
    const regionIndustryData = filteredData
      .filter(d => {
        const region = d.region?.trim()
        const industry = d.industrySector?.trim()
        return region && region.length > 0 && region !== 'undefined' && !region.match(/^\d+$/) &&
               industry && industry.length > 0
      })
      .map(d => ({
        region: d.region.trim(),
        disease: d.industrySector.trim(),
        industry: d.industrySector.trim(),
        value: 1,
        label: `${d.region.trim()} - ${d.industrySector.trim()}`
      }))

    // Get unique industries for stacking
    const uniqueIndustries = [...new Set(
      filteredData
        .map(d => d.industrySector?.trim())
        .filter(Boolean)
    )].sort()


    // By Region - filter out empty regions and ensure proper names (for simple bar chart if needed)
    const regionData = filteredData.reduce((acc, d) => {
      const region = d.region?.trim()
      if (region && region.length > 0 && region !== 'undefined' && !region.match(/^\d+$/)) {
        acc[region] = (acc[region] || 0) + 1
      }
      return acc
    }, {} as Record<string, number>)

    // By Industry - filter out empty values and truncate long names
    const industryData = filteredData.reduce((acc, d) => {
      const industry = d.industrySector?.trim()
      if (industry && industry.length > 0) {
        // Truncate very long industry names for better readability
        const displayName = industry.length > 50 ? industry.substring(0, 47) + '...' : industry
        acc[displayName] = (acc[displayName] || 0) + 1
      }
      return acc
    }, {} as Record<string, number>)


    // By Lead Potential - normalize and categorize
    const leadPotentialData = filteredData.reduce((acc, d) => {
      const lead = d.leadPotential?.trim()
      if (lead && lead.length > 0) {
        // Normalize lead potential labels
        let normalizedLead = lead
        if (lead.toLowerCase().includes('hot')) {
          normalizedLead = 'Hot'
        } else if (lead.toLowerCase().includes('warm')) {
          normalizedLead = 'Warm'
        } else if (lead.toLowerCase().includes('cold')) {
          normalizedLead = 'Cold'
        }
        acc[normalizedLead] = (acc[normalizedLead] || 0) + 1
      }
      return acc
    }, {} as Record<string, number>)

    // Sort by value descending for better visualization
    const sortByValue = (a: [string, number], b: [string, number]) => b[1] - a[1]

    return {
      regionIndustry: regionIndustryData,
      uniqueIndustries: uniqueIndustries.map(ind => ind.length > 40 ? ind.substring(0, 37) + '...' : ind),
      region: Object.entries(regionData)
        .sort(sortByValue)
        .map(([name, value]) => ({ name, value })),
      industry: Object.entries(industryData)
        .sort(sortByValue)
        .map(([name, value]) => ({ name, value })),
      leadPotential: Object.entries(leadPotentialData)
        .sort(sortByValue)
        .map(([name, value]) => ({ name, value })),
    }
  }, [filteredData])

  // KPI Stats
  const kpis = useMemo(() => {
    const totalCustomers = filteredData.length
    const hotLeads = filteredData.filter(d => d.leadPotential?.toLowerCase().includes('hot')).length
    const warmLeads = filteredData.filter(d => d.leadPotential?.toLowerCase().includes('warm')).length
    const avgVolume = filteredData.reduce((sum, d) => {
      const volume = parseInt(d.estimatedVolumeRequirement?.replace(/[^0-9]/g, '') || '0')
      return sum + volume
    }, 0) / (totalCustomers || 1)

    return {
      totalCustomers,
      hotLeads,
      warmLeads,
      avgVolume: Math.round(avgVolume).toLocaleString(),
    }
  }, [filteredData])

  const handleSort = (column: keyof CustomerIntelligenceData) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortColumn(column)
      setSortDirection('asc')
    }
  }

  const exportToCSV = () => {
    const headers = Object.keys(filteredData[0] || {})
    const csvContent = [
      headers.join(','),
      ...filteredData.map(row => 
        headers.map(header => {
          const value = row[header as keyof CustomerIntelligenceData] || ''
          return `"${String(value).replace(/"/g, '""')}"`
        }).join(',')
      )
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = 'customer_intelligence_filtered.csv'
    link.click()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-electric-blue mx-auto mb-4"></div>
          <p className="text-text-secondary-light dark:text-text-secondary-dark">Loading customer intelligence data...</p>
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
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={exportToCSV}
          className="flex items-center gap-2 px-5 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-md"
        >
          <Download size={20} />
          Export CSV
        </motion.button>
      </div>

      {/* Page Title */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <InfoTooltip content="• View comprehensive customer intelligence data\n• Filter and analyze customer information\n• Export filtered data to CSV\n• Analyze by region, industry, shovel type, and lead potential">
          <h1 className="text-4xl font-bold text-text-primary-light dark:text-text-primary-dark mb-3 cursor-help">
            Customer Intelligence
          </h1>
        </InfoTooltip>
        <p className="text-xl text-text-secondary-light dark:text-text-secondary-dark">
          Global customer data analysis and insights
        </p>
      </motion.div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className={`p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 ${isDark ? 'bg-navy-card border-2 border-navy-light' : 'bg-white border-2 border-gray-200'}`}>
          <StatBox
            title={kpis.totalCustomers.toLocaleString()}
            subtitle="Total Customers"
          />
        </div>
        <div className={`p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 ${isDark ? 'bg-navy-card border-2 border-navy-light' : 'bg-white border-2 border-gray-200'}`}>
          <StatBox
            title={kpis.hotLeads.toLocaleString()}
            subtitle="Hot Leads"
          />
        </div>
        <div className={`p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 ${isDark ? 'bg-navy-card border-2 border-navy-light' : 'bg-white border-2 border-gray-200'}`}>
          <StatBox
            title={kpis.warmLeads.toLocaleString()}
            subtitle="Warm Leads"
          />
        </div>
        <div className={`p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 ${isDark ? 'bg-navy-card border-2 border-navy-light' : 'bg-white border-2 border-gray-200'}`}>
          <StatBox
            title={kpis.avgVolume}
            subtitle="Total Demand/Year"
          />
        </div>
      </div>

      {/* Filters Section */}
      <div className={`p-8 rounded-2xl mb-8 shadow-xl ${isDark ? 'bg-navy-card border-2 border-navy-light' : 'bg-white border-2 border-gray-300'}`}>
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <Filter size={24} className={isDark ? 'text-cyan-accent' : 'text-electric-blue'} />
            <h3 className="text-2xl font-bold text-text-primary-light dark:text-text-primary-dark">
              Filter Data
            </h3>
          </div>
          <p className="text-base text-text-secondary-light dark:text-text-secondary-dark ml-4">
            Filter customer data by various criteria. Showing {filteredData.length} of {data.length} records.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <FilterDropdown
            label="Region"
            value={filters.region}
            onChange={(value) => setFilters({ ...filters, region: value as string[] })}
            options={uniqueOptions.regions}
          />
          <FilterDropdown
            label="Industry / Sector"
            value={filters.industrySector}
            onChange={(value) => setFilters({ ...filters, industrySector: value as string[] })}
            options={uniqueOptions.industrySectors}
          />
          <FilterDropdown
            label="Type of Shovel Required"
            value={filters.typeOfShovelRequired}
            onChange={(value) => setFilters({ ...filters, typeOfShovelRequired: value as string[] })}
            options={uniqueOptions.shovelTypes}
          />
          <FilterDropdown
            label="Quality Preference"
            value={filters.qualityPreference}
            onChange={(value) => setFilters({ ...filters, qualityPreference: value as string[] })}
            options={uniqueOptions.qualityPreferences}
          />
          <FilterDropdown
            label="Price Sensitivity"
            value={filters.priceSensitivity}
            onChange={(value) => setFilters({ ...filters, priceSensitivity: value as string[] })}
            options={uniqueOptions.priceSensitivities}
          />
          <FilterDropdown
            label="Lead Potential"
            value={filters.leadPotential}
            onChange={(value) => setFilters({ ...filters, leadPotential: value as string[] })}
            options={uniqueOptions.leadPotentials}
          />
        </div>
      </div>

      {/* Analysis Charts */}
      <div className="space-y-8 mb-8">
        {/* Region Chart with Industry Stacked */}
        {analysisData.regionIndustry.length > 0 && analysisData.uniqueIndustries.length > 0 && (
          <div className={`p-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 ${isDark ? 'bg-navy-card border-2 border-navy-light' : 'bg-white border-2 border-gray-200'}`}>
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-2">
                <div className={`w-1 h-8 rounded-full ${isDark ? 'bg-cyan-accent' : 'bg-electric-blue'}`}></div>
                <h3 className="text-2xl font-bold text-text-primary-light dark:text-text-primary-dark">
                  Customers by Region & Industry
                </h3>
              </div>
              <p className="text-base text-text-secondary-light dark:text-text-secondary-dark ml-4">
                Distribution of customers across regions with industry breakdown
              </p>
            </div>
            <div className="h-[500px] w-full">
              <StackedBarChart
                data={analysisData.regionIndustry}
                dataKey="value"
                nameKey="region"
                diseaseKey="industry"
                uniqueDiseases={analysisData.uniqueIndustries}
                xAxisLabel="Region"
                yAxisLabel="Volume"
              />
            </div>
          </div>
        )}

        {/* Lead Potential Chart */}
        {analysisData.leadPotential.length > 0 && (
          <div className={`p-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 ${isDark ? 'bg-navy-card border-2 border-navy-light' : 'bg-white border-2 border-gray-200'}`}>
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-2">
                <div className={`w-1 h-8 rounded-full ${isDark ? 'bg-cyan-accent' : 'bg-electric-blue'}`}></div>
                <h3 className="text-2xl font-bold text-text-primary-light dark:text-text-primary-dark">
                  Lead Potential Distribution
                </h3>
              </div>
              <p className="text-base text-text-secondary-light dark:text-text-secondary-dark ml-4">
                Distribution of customers by lead potential (Hot, Warm, Cold)
              </p>
            </div>
            <div className="h-[500px] w-full">
              <PieChart
                data={analysisData.leadPotential}
                dataKey="value"
                nameKey="name"
              />
            </div>
          </div>
        )}
      </div>

      {/* Customer Data View Table */}
      <div className={`p-8 rounded-2xl shadow-xl ${isDark ? 'bg-navy-card border-2 border-navy-light' : 'bg-white border-2 border-gray-300'}`}>
        <div className="mb-6">
          <h3 className="text-2xl font-bold text-text-primary-light dark:text-text-primary-dark">
            List of Potential Customers for Shovels
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              {/* First header row with group headers */}
              <tr className={`border-b-2 ${isDark ? 'border-navy-light' : 'border-gray-300'}`}>
                <th rowSpan={2} className={`px-3 py-2 text-center font-semibold ${isDark ? 'bg-navy-dark' : 'bg-gray-100'} text-text-primary-light dark:text-text-primary-dark border-r ${isDark ? 'border-navy-light' : 'border-gray-300'}`}>
                  S.No.
                </th>
                <th rowSpan={2} className={`px-3 py-2 text-center font-semibold ${isDark ? 'bg-navy-dark' : 'bg-gray-100'} text-text-primary-light dark:text-text-primary-dark border-r ${isDark ? 'border-navy-light' : 'border-gray-300'}`}>
                  Company Name
                </th>
                <th rowSpan={2} className={`px-3 py-2 text-center font-semibold ${isDark ? 'bg-navy-dark' : 'bg-gray-100'} text-text-primary-light dark:text-text-primary-dark border-r ${isDark ? 'border-navy-light' : 'border-gray-300'}`}>
                  Industry / Sector
                </th>
                <th rowSpan={2} className={`px-3 py-2 text-center font-semibold ${isDark ? 'bg-navy-dark' : 'bg-gray-100'} text-text-primary-light dark:text-text-primary-dark border-r ${isDark ? 'border-navy-light' : 'border-gray-300'}`}>
                  Headquarter's Address
                </th>
                <th rowSpan={2} className={`px-3 py-2 text-center font-semibold ${isDark ? 'bg-navy-dark' : 'bg-gray-100'} text-text-primary-light dark:text-text-primary-dark border-r ${isDark ? 'border-navy-light' : 'border-gray-300'}`}>
                  Years of Existence
                </th>
                <th colSpan={5} className={`px-3 py-2 text-center font-semibold ${isDark ? 'bg-blue-900' : 'bg-blue-100'} text-text-primary-light dark:text-text-primary-dark border-r ${isDark ? 'border-navy-light' : 'border-gray-300'}`}>
                  Contact Details
                </th>
                <th colSpan={5} className={`px-3 py-2 text-center font-semibold ${isDark ? 'bg-purple-900' : 'bg-purple-100'} text-text-primary-light dark:text-text-primary-dark border-r ${isDark ? 'border-navy-light' : 'border-gray-300'}`}>
                  Shovel Requirement Profile
                </th>
                <th colSpan={4} className={`px-3 py-2 text-center font-semibold ${isDark ? 'bg-blue-900' : 'bg-blue-100'} text-text-primary-light dark:text-text-primary-dark border-r ${isDark ? 'border-navy-light' : 'border-gray-300'}`}>
                  Vendor Evaluation Factors
                </th>
                <th colSpan={3} className={`px-3 py-2 text-center font-semibold ${isDark ? 'bg-gray-700' : 'bg-gray-200'} text-text-primary-light dark:text-text-primary-dark`}>
                  Market Potential Scoring
                </th>
              </tr>
              {/* Second header row with individual column headers */}
              <tr className={`border-b-2 ${isDark ? 'border-navy-light' : 'border-gray-300'}`}>
                {/* Contact Details columns */}
                <th className={`px-3 py-2 text-center font-semibold ${isDark ? 'bg-blue-900' : 'bg-blue-100'} text-text-primary-light dark:text-text-primary-dark border-r ${isDark ? 'border-navy-light' : 'border-gray-300'}`}>
                  Name
                </th>
                <th className={`px-3 py-2 text-center font-semibold ${isDark ? 'bg-blue-900' : 'bg-blue-100'} text-text-primary-light dark:text-text-primary-dark border-r ${isDark ? 'border-navy-light' : 'border-gray-300'}`}>
                  Decision Role
                </th>
                <th className={`px-3 py-2 text-center font-semibold ${isDark ? 'bg-blue-900' : 'bg-blue-100'} text-text-primary-light dark:text-text-primary-dark border-r ${isDark ? 'border-navy-light' : 'border-gray-300'}`}>
                  Email ID
                </th>
                <th className={`px-3 py-2 text-center font-semibold ${isDark ? 'bg-blue-900' : 'bg-blue-100'} text-text-primary-light dark:text-text-primary-dark border-r ${isDark ? 'border-navy-light' : 'border-gray-300'}`}>
                  Website
                </th>
                <th className={`px-3 py-2 text-center font-semibold ${isDark ? 'bg-blue-900' : 'bg-blue-100'} text-text-primary-light dark:text-text-primary-dark border-r ${isDark ? 'border-navy-light' : 'border-gray-300'}`}>
                  Telephone
                </th>
                {/* Shovel Requirement Profile columns */}
                <th className={`px-3 py-2 text-center font-semibold ${isDark ? 'bg-purple-900' : 'bg-purple-100'} text-text-primary-light dark:text-text-primary-dark border-r ${isDark ? 'border-navy-light' : 'border-gray-300'}`}>
                  Type of Shovel Required
                </th>
                <th className={`px-3 py-2 text-center font-semibold ${isDark ? 'bg-purple-900' : 'bg-purple-100'} text-text-primary-light dark:text-text-primary-dark border-r ${isDark ? 'border-navy-light' : 'border-gray-300'}`}>
                  Primary Use Case
                </th>
                <th className={`px-3 py-2 text-center font-semibold ${isDark ? 'bg-purple-900' : 'bg-purple-100'} text-text-primary-light dark:text-text-primary-dark border-r ${isDark ? 'border-navy-light' : 'border-gray-300'}`}>
                  Estimated Volume Requirement (Annual)
                </th>
                <th className={`px-3 py-2 text-center font-semibold ${isDark ? 'bg-purple-900' : 'bg-purple-100'} text-text-primary-light dark:text-text-primary-dark border-r ${isDark ? 'border-navy-light' : 'border-gray-300'}`}>
                  Replacement Cycle
                </th>
                <th className={`px-3 py-2 text-center font-semibold ${isDark ? 'bg-purple-900' : 'bg-purple-100'} text-text-primary-light dark:text-text-primary-dark border-r ${isDark ? 'border-navy-light' : 'border-gray-300'}`}>
                  Existing Brands Used
                </th>
                {/* Vendor Evaluation Factors columns */}
                <th className={`px-3 py-2 text-center font-semibold ${isDark ? 'bg-blue-900' : 'bg-blue-100'} text-text-primary-light dark:text-text-primary-dark border-r ${isDark ? 'border-navy-light' : 'border-gray-300'}`}>
                  Quality Preference
                </th>
                <th className={`px-3 py-2 text-center font-semibold ${isDark ? 'bg-blue-900' : 'bg-blue-100'} text-text-primary-light dark:text-text-primary-dark border-r ${isDark ? 'border-navy-light' : 'border-gray-300'}`}>
                  Price Sensitivity
                </th>
                <th className={`px-3 py-2 text-center font-semibold ${isDark ? 'bg-blue-900' : 'bg-blue-100'} text-text-primary-light dark:text-text-primary-dark border-r ${isDark ? 'border-navy-light' : 'border-gray-300'}`}>
                  Certifications Required
                </th>
                <th className={`px-3 py-2 text-center font-semibold ${isDark ? 'bg-blue-900' : 'bg-blue-100'} text-text-primary-light dark:text-text-primary-dark border-r ${isDark ? 'border-navy-light' : 'border-gray-300'}`}>
                  Sustainability Preference
                </th>
                {/* Market Potential Scoring columns */}
                <th className={`px-3 py-2 text-center font-semibold ${isDark ? 'bg-gray-700' : 'bg-gray-200'} text-text-primary-light dark:text-text-primary-dark border-r ${isDark ? 'border-navy-light' : 'border-gray-300'}`}>
                  Demand Attractive Score (1-5)
                </th>
                <th className={`px-3 py-2 text-center font-semibold ${isDark ? 'bg-gray-700' : 'bg-gray-200'} text-text-primary-light dark:text-text-primary-dark border-r ${isDark ? 'border-navy-light' : 'border-gray-300'}`}>
                  Fit for OEM / Shovel Type (1-5)
                </th>
                <th className={`px-3 py-2 text-center font-semibold ${isDark ? 'bg-gray-700' : 'bg-gray-200'} text-text-primary-light dark:text-text-primary-dark`}>
                  Lead Potential (Hot / Warm / Cold)
                </th>
              </tr>
            </thead>
            <tbody>
              {showcaseData.map((row, index) => (
                <tr 
                  key={index}
                  className={`border-b ${isDark ? 'border-navy-light hover:bg-navy-dark' : 'border-gray-200 hover:bg-gray-50'} transition-colors`}
                >
                  <td className={`px-3 py-2 text-center text-text-primary-light dark:text-text-primary-dark border-r ${isDark ? 'border-navy-light' : 'border-gray-300'}`}>
                    {row.sNo}
                  </td>
                  <td className={`px-3 py-2 text-text-primary-light dark:text-text-primary-dark border-r ${isDark ? 'border-navy-light' : 'border-gray-300'}`}>
                    {row.companyName}
                  </td>
                  <td className={`px-3 py-2 text-text-secondary-light dark:text-text-secondary-dark border-r ${isDark ? 'border-navy-light' : 'border-gray-300'}`}>
                    {row.industrySector}
                  </td>
                  <td className={`px-3 py-2 text-text-secondary-light dark:text-text-secondary-dark border-r ${isDark ? 'border-navy-light' : 'border-gray-300'}`}>
                    {row.headquartersAddress}
                  </td>
                  <td className={`px-3 py-2 text-center text-text-secondary-light dark:text-text-secondary-dark border-r ${isDark ? 'border-navy-light' : 'border-gray-300'}`}>
                    {row.yearsOfExistence}
                  </td>
                  {/* Contact Details */}
                  <td className={`px-3 py-2 text-text-secondary-light dark:text-text-secondary-dark border-r ${isDark ? 'border-navy-light' : 'border-gray-300'}`}>
                    {row.name}
                  </td>
                  <td className={`px-3 py-2 text-text-secondary-light dark:text-text-secondary-dark border-r ${isDark ? 'border-navy-light' : 'border-gray-300'}`}>
                    {row.decisionRole}
                  </td>
                  <td className={`px-3 py-2 text-text-secondary-light dark:text-text-secondary-dark border-r ${isDark ? 'border-navy-light' : 'border-gray-300'}`}>
                    <a href={`mailto:${row.emailId}`} className="text-electric-blue hover:underline">
                      {row.emailId}
                    </a>
                  </td>
                  <td className={`px-3 py-2 text-text-secondary-light dark:text-text-secondary-dark border-r ${isDark ? 'border-navy-light' : 'border-gray-300'}`}>
                    <a href={row.website} target="_blank" rel="noopener noreferrer" className="text-electric-blue hover:underline">
                      {row.website.replace('https://', '').replace('http://', '')}
                    </a>
                  </td>
                  <td className={`px-3 py-2 text-text-secondary-light dark:text-text-secondary-dark border-r ${isDark ? 'border-navy-light' : 'border-gray-300'}`}>
                    {row.telephone}
                  </td>
                  {/* Shovel Requirement Profile */}
                  <td className={`px-3 py-2 text-text-secondary-light dark:text-text-secondary-dark border-r ${isDark ? 'border-navy-light' : 'border-gray-300'}`}>
                    {row.typeOfShovelRequired}
                  </td>
                  <td className={`px-3 py-2 text-text-secondary-light dark:text-text-secondary-dark border-r ${isDark ? 'border-navy-light' : 'border-gray-300'}`}>
                    {row.primaryUseCase}
                  </td>
                  <td className={`px-3 py-2 text-text-secondary-light dark:text-text-secondary-dark border-r ${isDark ? 'border-navy-light' : 'border-gray-300'}`}>
                    {row.estimatedVolumeRequirement}
                  </td>
                  <td className={`px-3 py-2 text-text-secondary-light dark:text-text-secondary-dark border-r ${isDark ? 'border-navy-light' : 'border-gray-300'}`}>
                    {row.replacementCycle}
                  </td>
                  <td className={`px-3 py-2 text-text-secondary-light dark:text-text-secondary-dark border-r ${isDark ? 'border-navy-light' : 'border-gray-300'}`}>
                    {row.existingBrandsUsed}
                  </td>
                  {/* Vendor Evaluation Factors */}
                  <td className={`px-3 py-2 text-text-secondary-light dark:text-text-secondary-dark border-r ${isDark ? 'border-navy-light' : 'border-gray-300'}`}>
                    {row.qualityPreference}
                  </td>
                  <td className={`px-3 py-2 text-text-secondary-light dark:text-text-secondary-dark border-r ${isDark ? 'border-navy-light' : 'border-gray-300'}`}>
                    {row.priceSensitivity}
                  </td>
                  <td className={`px-3 py-2 text-text-secondary-light dark:text-text-secondary-dark border-r ${isDark ? 'border-navy-light' : 'border-gray-300'}`}>
                    {row.certificationsRequired}
                  </td>
                  <td className={`px-3 py-2 text-text-secondary-light dark:text-text-secondary-dark border-r ${isDark ? 'border-navy-light' : 'border-gray-300'}`}>
                    {row.sustainabilityPreference}
                  </td>
                  {/* Market Potential Scoring */}
                  <td className={`px-3 py-2 text-center text-text-secondary-light dark:text-text-secondary-dark border-r ${isDark ? 'border-navy-light' : 'border-gray-300'}`}>
                    {row.demandAttractiveScore}
                  </td>
                  <td className={`px-3 py-2 text-center text-text-secondary-light dark:text-text-secondary-dark border-r ${isDark ? 'border-navy-light' : 'border-gray-300'}`}>
                    {row.fitForOEMShovelType}
                  </td>
                  <td className="px-3 py-2 text-center">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      row.leadPotential?.toLowerCase().includes('hot') 
                        ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                        : row.leadPotential?.toLowerCase().includes('warm')
                        ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                    }`}>
                      {row.leadPotential}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

